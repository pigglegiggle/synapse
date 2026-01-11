package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"bank-fraud-demo/models"
)

type AIClients struct {
	BaseURL string
	Client  *http.Client
}

func NewAIClient(baseURL string) *AIClients {
	return &AIClients{
		BaseURL: baseURL,
		Client:  &http.Client{Timeout: 10 * time.Second}, // Increased timeout for context queries
	}
}

// AnalysisRequest includes transaction and receiver context for graph-aware scoring
type AnalysisRequest struct {
	Transaction     models.Transaction `json:"transaction"`
	ReceiverContext map[string]any     `json:"receiver_context"`
}

// AnalyzeTransactionWithContext sends transaction + graph context to AI service
func (c *AIClients) AnalyzeTransactionWithContext(txn models.Transaction, receiverContext map[string]any) (models.AnalysisResult, error) {
	// Rule-Based Pre-check (Hybrid Approach)
	// If amount > 100,000, flag immediately as High Risk
	if txn.Amount > 100000 {
		return models.AnalysisResult{
			TransactionID: txn.TransactionID,
			RiskScore:     90.0,
			Action:        "Review",
			Reasons:       []string{"Amount exceeds 100,000 THB threshold"},
			Timestamp:     time.Now().Format(time.RFC3339),
		}, nil
	}

	// Prepare payload with context
	payload, err := json.Marshal(AnalysisRequest{
		Transaction:     txn,
		ReceiverContext: receiverContext,
	})
	if err != nil {
		return models.AnalysisResult{}, err
	}

	resp, err := c.Client.Post(c.BaseURL+"/predict", "application/json", bytes.NewBuffer(payload))
	if err != nil {
		// Fallback if AI service is down
		return models.AnalysisResult{
			TransactionID: txn.TransactionID,
			RiskScore:     0,
			Action:        "Allow",
			Reasons:       []string{"AI Service Unavailable - Default Allow"},
			Timestamp:     time.Now().Format(time.RFC3339),
		}, nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return models.AnalysisResult{}, fmt.Errorf("AI service returned status: %d", resp.StatusCode)
	}

	var result models.AnalysisResult
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return models.AnalysisResult{}, err
	}

	result.TransactionID = txn.TransactionID
	return result, nil
}

// AnalyzeTransaction - Legacy method without context (backward compatible)
func (c *AIClients) AnalyzeTransaction(txn models.Transaction) (models.AnalysisResult, error) {
	return c.AnalyzeTransactionWithContext(txn, nil)
}
