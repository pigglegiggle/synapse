package models

import "time"

type Transaction struct {
	TransactionID   string    `json:"transaction_id"`
	Amount          float64   `json:"amount"`
	Currency        string    `json:"currency"`
	Timestamp       time.Time `json:"timestamp"`
	SenderAccount   string    `json:"sender_account"`
	ReceiverAccount string    `json:"receiver_account"`
	SenderIP        string    `json:"sender_ip"`
	ReceiverIP      string    `json:"receiver_ip"`
	DeviceID        string    `json:"device_id"`
	Channel         string    `json:"channel"`
	Location        string    `json:"location"`
	TransactionType string    `json:"transaction_type"`
}

type AnalysisResult struct {
	TransactionID string   `json:"transaction_id"`
	RiskScore     float64  `json:"risk_score"`
	Action        string   `json:"action"` // Block, Review, Allow
	Reasons       []string `json:"reasons"`
	Timestamp     string   `json:"timestamp"`
}

type FraudCheckRequest struct {
	Transaction Transaction `json:"transaction"`
}

type FraudCheckResponse struct {
	AnalysisResult AnalysisResult `json:"analysis_result"`
}
