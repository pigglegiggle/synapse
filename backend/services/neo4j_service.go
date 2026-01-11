package services

import (
	"context"
	"log"
	"time"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"bank-fraud-demo/models"
)

type Neo4jService struct {
	Driver neo4j.DriverWithContext
}

func NewNeo4jService(uri, username, password string) (*Neo4jService, error) {
	driver, err := neo4j.NewDriverWithContext(uri, neo4j.BasicAuth(username, password, ""))
	if err != nil {
		return nil, err
	}
	// Verify connection
	ctx := context.Background()
	err = driver.VerifyConnectivity(ctx)
	if err != nil {
		// Log error but don't fail hard if Docker isn't up yet; we can retry later or fail at runtime
		log.Printf("Warning: Could not connect to Neo4j: %v", err)
	}
	return &Neo4jService{Driver: driver}, nil
}

func (s *Neo4jService) Close(ctx context.Context) error {
	return s.Driver.Close(ctx)
}

func (s *Neo4jService) SaveTransaction(ctx context.Context, txn models.Transaction, analysis models.AnalysisResult) error {
	session := s.Driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	_, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		query := `
			MERGE (s:Account {id: $sender_acc})
			MERGE (r:Account {id: $receiver_acc})
			CREATE (t:Transaction {
				id: $txn_id,
				amount: $amount,
				timestamp: $timestamp,
				risk_score: $risk_score,
				action: $action,
				reasons: $reasons
			})
			CREATE (s)-[:TRANSFERRED {amount: $amount, timestamp: $timestamp, txn_id: $txn_id, risk_score: $risk_score, reasons: $reasons}]->(r)
			CREATE (t)-[:FROM]->(s)
			CREATE (t)-[:TO]->(r)
			RETURN t.id
		`
		params := map[string]any{
			"sender_acc":   txn.SenderAccount,
			"receiver_acc": txn.ReceiverAccount,
			"txn_id":       txn.TransactionID,
			"amount":       txn.Amount,
			"timestamp":    txn.Timestamp.Format(time.RFC3339Nano),
			"risk_score":   analysis.RiskScore,
			"action":       analysis.Action,
			"reasons":      analysis.Reasons,
		}
		result, err := tx.Run(ctx, query, params)
		if err != nil {
			return nil, err
		}
		return result.Collect(ctx)
	})
	return err
}

func (s *Neo4jService) GetRecentTransactions(ctx context.Context, limit int, minRisk float64) ([]map[string]any, error) {
	session := s.Driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		query := `
			MATCH (s:Account)-[r:TRANSFERRED]->(recv:Account)
			WHERE r.risk_score >= $min_risk
			RETURN s.id as sender, recv.id as receiver, r.amount as amount, r.timestamp as timestamp, r.txn_id as txn_id, r.risk_score as risk_score
			ORDER BY r.timestamp DESC
			LIMIT $limit
		`
		res, err := tx.Run(ctx, query, map[string]any{
			"limit": limit,
			"min_risk": minRisk,
		})
		if err != nil {
			return nil, err
		}
		
		var records []map[string]any
		for res.Next(ctx) {
			rec := res.Record()
			sender, _ := rec.Get("sender")
			receiver, _ := rec.Get("receiver")
			amount, _ := rec.Get("amount")
			timestamp, _ := rec.Get("timestamp")
			txnId, _ := rec.Get("txn_id")
			riskScore, _ := rec.Get("risk_score")
			
			records = append(records, map[string]any{
				"source": sender,
				"target": receiver,
				"sender_account": sender,
				"receiver_account": receiver,
				"amount": amount,
				"timestamp": timestamp,
				"txn_id": txnId,
				"risk_score": riskScore,
			})
		}
		return records, nil
	})

	if err != nil {
		return nil, err
	}
	return result.([]map[string]any), nil
}

func (s *Neo4jService) GetAccountHistory(ctx context.Context, accountID string) (map[string]any, error) {
	session := s.Driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		// Fetch transactions via the Transaction node to get canonical properties (including verification_status)
		query := `
			MATCH (a:Account {id: $acc_id})<-[:FROM|TO]-(t:Transaction)
			MATCH (t)-[:FROM]->(sender:Account)
			MATCH (t)-[:TO]->(receiver:Account)
			RETURN 
				t.txn_id as txn_id,
				t.amount as amount, 
				t.timestamp as timestamp, 
				t.risk_score as risk_score,
				t.action as action,
				t.reasons as reasons,
				t.verification_status as verification_status,
				CASE WHEN sender.id = $acc_id THEN receiver.id ELSE sender.id END as other_acc,
				sender.id = $acc_id as is_sender
			ORDER BY t.timestamp DESC
			LIMIT 20
		`
		res, err := tx.Run(ctx, query, map[string]any{"acc_id": accountID})
		if err != nil {
			return nil, err
		}

		var history []map[string]any
		var totalRisk float64
		var count int
		var highRiskCount int

		for res.Next(ctx) {
			rec := res.Record()
			amount, _ := rec.Get("amount")
			timestamp, _ := rec.Get("timestamp")
			txnId, _ := rec.Get("txn_id")
			riskScore, _ := rec.Get("risk_score")
			action, _ := rec.Get("action")
			reasons, _ := rec.Get("reasons")
			verificationStatus, _ := rec.Get("verification_status")
			otherAcc, _ := rec.Get("other_acc")
			isSender, _ := rec.Get("is_sender")

			// Calculate stats
			var rs float64
			if riskScore != nil {
				if val, ok := riskScore.(float64); ok {
					rs = val
				}
			}
			
			totalRisk += rs
			if rs > 80 { highRiskCount++ }
			count++

			history = append(history, map[string]any{
				"txn_id": txnId,
				"amount": amount,
				"timestamp": timestamp,
				"risk_score": rs,
				"action": action,
				"reasons": reasons,
				"verification_status": verificationStatus,
				"other_account": otherAcc,
				"role": func() string { if isSender != nil && isSender.(bool) { return "Sender" } else { return "Receiver" } }(),
			})
		}
		
		avgRisk := 0.0
		if count > 0 { avgRisk = totalRisk / float64(count) }

		return map[string]any{
			"account_id": accountID,
			"history": history,
			"avg_risk": avgRisk,
			"high_risk_txns": highRiskCount,
			"total_txns": count,
		}, nil
	})

	if err != nil {
		return nil, err
	}
	return result.(map[string]any), nil
}
func (s *Neo4jService) ResetDatabase(ctx context.Context) error {
	session := s.Driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	_, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		query := `MATCH (n) DETACH DELETE n`
		return tx.Run(ctx, query, nil)
	})
	return err
}

// GetAccountRiskContext returns aggregated risk signals for an account
// Used for graph-aware compound risk scoring
func (s *Neo4jService) GetAccountRiskContext(ctx context.Context, accountID string) (map[string]any, error) {
	session := s.Driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		query := `
			MATCH (target:Account {id: $account_id})<-[r:TRANSFERRED]-(sender:Account)
			WITH target, r, sender
			RETURN 
				count(r) as incoming_tx_count,
				count(DISTINCT sender) as unique_sender_count,
				coalesce(sum(r.amount), 0) as total_volume,
				coalesce(avg(r.risk_score), 0) as avg_incoming_risk,
				size([x IN collect(r.amount) WHERE x IN [100.0, 200.0, 300.0, 500.0, 1000.0, 1500.0]]) as clustering_amount_count
		`
		res, err := tx.Run(ctx, query, map[string]any{"account_id": accountID})
		if err != nil {
			return nil, err
		}

		if res.Next(ctx) {
			rec := res.Record()
			incomingCount, _ := rec.Get("incoming_tx_count")
			uniqueSenders, _ := rec.Get("unique_sender_count")
			totalVolume, _ := rec.Get("total_volume")
			avgRisk, _ := rec.Get("avg_incoming_risk")
			clusteringCount, _ := rec.Get("clustering_amount_count")

			return map[string]any{
				"incoming_tx_count":       incomingCount,
				"unique_sender_count":     uniqueSenders,
				"total_volume":            totalVolume,
				"avg_incoming_risk":       avgRisk,
				"clustering_amount_count": clusteringCount,
			}, nil
		}

		// No data found, return defaults
		return map[string]any{
			"incoming_tx_count":       int64(0),
			"unique_sender_count":     int64(0),
			"total_volume":            0.0,
			"avg_incoming_risk":       0.0,
			"clustering_amount_count": int64(0),
		}, nil
	})

	if err != nil {
		return nil, err
	}
	return result.(map[string]any), nil
}

func (s *Neo4jService) UpdateTransactionVerification(ctx context.Context, txnID string, verdict string) error {
	session := s.Driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	_, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		query := `
			MATCH (t:Transaction {id: $txn_id})
			SET t.verification_status = $verdict, 
			    t.verified_at = $timestamp
			WITH t
			MATCH ()-[r:TRANSFERRED {txn_id: $txn_id}]->()
			SET r.verification_status = $verdict,
			    r.verified_at = $timestamp
			RETURN t.id
		`
		params := map[string]any{
			"txn_id":    txnID,
			"verdict":   verdict,
			"timestamp": time.Now().Format(time.RFC3339),
		}
		return tx.Run(ctx, query, params)
	})
	return err
}
