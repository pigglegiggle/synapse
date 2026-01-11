package api

import (
	"context"
	"fmt"
	"log"
	"math"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"bank-fraud-demo/models"
	"bank-fraud-demo/services"
    "bank-fraud-demo/db"
)

type BankHandler struct {
	Neo4j *services.Neo4jService
	AI    *services.AIClients
}

func NewBankHandler(neo4j *services.Neo4jService, ai *services.AIClients) *BankHandler {
	return &BankHandler{
		Neo4j: neo4j,
		AI:    ai,
	}
}

// processAndSave encapsulates the logic of analyzing and saving a transaction
// Now includes graph-aware context for intelligent compound scoring
func (h *BankHandler) processAndSave(txn models.Transaction) (*models.AnalysisResult, error) {
	// 1. Query receiver's historical context from Neo4j for graph-aware scoring
	ctx := context.Background()
	receiverContext, err := h.Neo4j.GetAccountRiskContext(ctx, txn.ReceiverAccount)
	if err != nil {
		// If context query fails, proceed with empty context (graceful degradation)
		receiverContext = map[string]any{}
	}

	// 2. Analyze with AI (passing graph context for compound scoring)
	analysis, err := h.AI.AnalyzeTransactionWithContext(txn, receiverContext)
	if err != nil {
		return nil, err
	}

	// 3. Determine final action
	if analysis.RiskScore > 80 {
		analysis.Action = "Block"
	} else if analysis.RiskScore > 50 {
		analysis.Action = "Review"
	} else {
		analysis.Action = "Allow"
	}

	// 4. Save to Neo4j (async for performance)
	go func() {
		bgCtx := context.Background()
		h.Neo4j.SaveTransaction(bgCtx, txn, analysis)
	}()

	return &analysis, nil
}

func (h *BankHandler) IngestTransaction(c *gin.Context) {
	var txn models.Transaction
	if err := c.ShouldBindJSON(&txn); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	analysis, err := h.processAndSave(txn)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to analyze transaction"})
		return
	}

	c.JSON(http.StatusOK, models.FraudCheckResponse{
		AnalysisResult: *analysis,
	})
}

func (h *BankHandler) GetGraph(c *gin.Context) {
	limit := 50
	if l := c.Query("limit"); l != "" {
		fmt.Sscanf(l, "%d", &limit)
	}
	if limit > 100000 { limit = 100000 } // Effectively unlimited

	minRisk := 0.0
	if r := c.Query("min_risk"); r != "" {
		fmt.Sscanf(r, "%f", &minRisk)
	}

	ctx := context.Background()
	data, err := h.Neo4j.GetRecentTransactions(ctx, limit, minRisk)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, data)
}

func (h *BankHandler) GetAccountDetails(c *gin.Context) {
	accountID := c.Param("id")
	ctx := context.Background()
	data, err := h.Neo4j.GetAccountHistory(ctx, accountID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, data)
}

// --- Test Bench Handlers ---

type GenerateRequest struct {
	Count    int    `json:"count"`
	Scenario string `json:"scenario"` // "random", "mule", "velocity", "structuring"
}

func (h *BankHandler) GenerateISO20022Data(c *gin.Context) {
	var req GenerateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		req.Count = 10
		req.Scenario = "random"
	}

	if req.Count <= 0 { req.Count = 10 }
	if req.Count > 1000 { req.Count = 1000 }

	banks := []string{"SCB", "KBANK", "KTB", "BBL", "BAY", "TTB"}
	
	go func() {
		var wg sync.WaitGroup
		sem := make(chan struct{}, 20) // Moderate concurrency

		for i := 0; i < req.Count; i++ {
			wg.Add(1)
			go func(idx int) {
				defer wg.Done()
				sem <- struct{}{}
				defer func() { <-sem }()

				sourceBank := banks[rand.Intn(len(banks))]
				targetBank := banks[rand.Intn(len(banks))]
				for sourceBank == targetBank {
					targetBank = banks[rand.Intn(len(banks))]
				}

				senderAcc := fmt.Sprintf("%s-%06d", sourceBank, rand.Intn(999999))
				receiverAcc := fmt.Sprintf("%s-%06d", targetBank, rand.Intn(999999))
				amount := 100.0 + rand.Float64()*50000.0

				// Scenario Logic
				if req.Scenario == "mule" {
					numMuleAccounts := 5 + rand.Intn(10)
					muleID := rand.Intn(numMuleAccounts)
					if idx%3 == 0 {
						receiverAcc = fmt.Sprintf("%s-MULE-%03d", targetBank, muleID)
						amount = 100000.0 + rand.Float64()*900000.0
					}
				} else if req.Scenario == "structuring" {
					base := 48000.0
					if rand.Float64() > 0.5 { base = 9000.0 }
					amount = base + rand.Float64()*1999.0
				} else if req.Scenario == "velocity" {
					numGamblingSites := 3 + rand.Intn(5)
					siteID := rand.Intn(numGamblingSites)
					receiverAcc = fmt.Sprintf("%s-GAME-%03d", targetBank, siteID)
					amounts := []float64{100.0, 200.0, 300.0, 500.0, 1000.0}
					amount = amounts[rand.Intn(len(amounts))]
				} else if req.Scenario == "mixed" {
					r := rand.Float64()
					if r < 0.33 {
						numMuleAccounts := 5 + rand.Intn(8)
						muleID := rand.Intn(numMuleAccounts)
						if idx%3 == 0 {
							receiverAcc = fmt.Sprintf("%s-MULE-%03d", targetBank, muleID)
							amount = 50000.0 + rand.Float64()*400000.0
						}
					} else if r < 0.66 {
						numBetSites := 4 + rand.Intn(6)
						siteID := rand.Intn(numBetSites)
						receiverAcc = fmt.Sprintf("%s-BET-%03d", targetBank, siteID)
						amounts := []float64{500.0, 1000.0, 1500.0}
						amount = amounts[rand.Intn(len(amounts))]
					} else {
						amount = 49000.0 + rand.Float64()*900.0
					}
				}

				txn := models.Transaction{
					TransactionID:   fmt.Sprintf("TXID-%d-%d", time.Now().UnixNano(), idx),
					Amount:          math.Round(amount*100) / 100,
					Currency:        "THB",
					Timestamp:       time.Now().Add(time.Duration(-idx*10) * time.Second),
					SenderAccount:   senderAcc,
					ReceiverAccount: receiverAcc,
					SenderIP:        fmt.Sprintf("192.168.%d.%d", rand.Intn(255), rand.Intn(255)),
					Channel:         "mobile",
					TransactionType: "credit_transfer",
					Location:        "Bangkok, TH",
					DeviceID:        fmt.Sprintf("DEV-%x", rand.Int63()),
				}

				_, _ = h.processAndSave(txn)
			}(i)
		}
		wg.Wait()
		log.Printf("Background simulation of %d transactions completed", req.Count)
	}()

	c.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("Started background generation of %d %s transactions", req.Count, req.Scenario)})
}

func (h *BankHandler) ResetData(c *gin.Context) {
	ctx := context.Background()
	// 1. Reset Neo4j
	err := h.Neo4j.ResetDatabase(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reset database: " + err.Error()})
		return
	}

	// 2. Reset SQLite Stats
	_, err = db.DB.Exec("UPDATE verification_stats SET checked = 0, false_positives = 0 WHERE id = 1")
	if err != nil {
		fmt.Println("Failed to reset stats:", err)
	}

	c.JSON(http.StatusOK, gin.H{"message": "System reset successful (Graph & Stats wiped)"})
}

// --- Auth & Stats Handlers ---

type LoginRequest struct {
    Username string `json:"username"`
    Password string `json:"password"`
}

func (h *BankHandler) Login(c *gin.Context) {
    var req LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    var id int
    err := db.DB.QueryRow("SELECT id FROM users WHERE username = ? AND password = ?", req.Username, req.Password).Scan(&id)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "token": "valid-token-123",
        "username": req.Username,
    })
}

func (h *BankHandler) GetStats(c *gin.Context) {
    var checked, falsePositives int
    err := db.DB.QueryRow("SELECT checked, false_positives FROM verification_stats WHERE id = 1").Scan(&checked, &falsePositives)
    if err != nil {
         c.JSON(http.StatusOK, gin.H{"checked": 0, "false_positives": 0})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "checked": checked,
        "false_positives": falsePositives,
    })
}

type UpdateStatsRequest struct {
    Verdict string `json:"verdict"` // 'FRAUD_CONFIRMED' | 'FALSE_POSITIVE'
}

func (h *BankHandler) UpdateStats(c *gin.Context) {
    var req UpdateStatsRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    tx, _ := db.DB.Begin()
    _, _ = tx.Exec("UPDATE verification_stats SET checked = checked + 1 WHERE id = 1")
    if req.Verdict == "FALSE_POSITIVE" {
        _, _ = tx.Exec("UPDATE verification_stats SET false_positives = false_positives + 1 WHERE id = 1")
    }
    tx.Commit()

    c.JSON(http.StatusOK, gin.H{"status": "updated"})
}

type VerifyTransactionRequest struct {
    Verdict string `json:"verdict"` // 'CONFIRMED_FRAUD' | 'FALSE_POSITIVE'
}

func (h *BankHandler) VerifyTransaction(c *gin.Context) {
    txnID := c.Param("id")
    var req VerifyTransactionRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    ctx := context.Background()
    err := h.Neo4j.UpdateTransactionVerification(ctx, txnID, req.Verdict)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update verification: " + err.Error()})
        return
    }

    // Update SQLite stats
    tx, _ := db.DB.Begin()
    _, _ = tx.Exec("UPDATE verification_stats SET checked = checked + 1 WHERE id = 1")
    if req.Verdict == "FALSE_POSITIVE" {
        _, _ = tx.Exec("UPDATE verification_stats SET false_positives = false_positives + 1 WHERE id = 1")
    }
    tx.Commit()

    c.JSON(http.StatusOK, gin.H{"status": "verified", "id": txnID, "verdict": req.Verdict})
}
