import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import pickle
import os

class FraudModel:
    def __init__(self):
        self.model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
        self.is_trained = False

    def train_dummy(self):
        # Create dummy data to train the model so it's not empty
        print("Training dummy model with realistic features...")
        X_train = np.array([
            [500, 1, 0, 0.5], [1000, 2, 0, 0.1], [20000, 1, 0, 0.8],
            [50000, 8, 1, 0.95], [49000, 5, 1, 0.1], [49900, 4, 1, 0.0],
            [300, 9, 0, 0.9], [1000000, 10, 0, 1.0]
        ])
        self.model.fit(X_train)
        self.is_trained = True
        print("Model trained with realistic fraud patterns.")

    def calculate_behavioral_features(self, txn_data):
        """
        Simulates the calculation of complex behavioral features (T3 & T4)
        In a real system, this would query a Feature Store (Redis/Cassandra).
        """
        amount = txn_data.get('amount', 0)
        scenario = "normal"
        if amount > 40000 and amount < 50000: scenario = "structuring"
        if "MULE" in txn_data.get('receiver_account', ''): scenario = "mule"
        if "GAME" in txn_data.get('receiver_account', ''): scenario = "gambling"
        
        # --- Feature Engineering (T3) ---
        
        # 1. Median Holding Time (Minutes)
        # Mules move money fast (< 15 mins). Normals hold for days.
        median_holding_time = np.random.randint(1000, 10000) # Default normal (days)
        if scenario == "mule":
            median_holding_time = np.random.randint(1, 14) # < 15 mins
            
        # 2. Inflow/Outflow Ratio
        # Mules ~ 1.0 (All in = All out). Normals ~ 0.8 or lower.
        inflow_outflow_ratio = 0.5
        if scenario == "mule" or scenario == "gambling":
            inflow_outflow_ratio = 0.95 + (np.random.rand() * 0.05)
            
        # 3. Burst Rate (Txns in last 20 mins)
        burst_rate = 1
        if scenario == "mule": burst_rate = np.random.randint(15, 30)
        if scenario == "gambling": burst_rate = np.random.randint(20, 50)
        
        # 4. Monthly Turnover (THB)
        monthly_turnover = 50000
        if scenario == "mule": monthly_turnover = 2000000 + np.random.randint(0, 5000000)
        
        # --- Inferred Profiling (T4) ---
        
        # Infer Income Bucket based on historical average transaction size (Simulated)
        # Mule: Low Income (students/villagers) but High Turnover
        inferred_income_bucket = "medium"
        if scenario == "mule":
            inferred_income_bucket = "low" # Mules are often recruited from vulnerables
            
        return {
            "median_holding_time": median_holding_time,
            "inflow_outflow_ratio": round(inflow_outflow_ratio, 2),
            "burst_rate": burst_rate,
            "monthly_turnover": monthly_turnover,
            "inferred_income_bucket": inferred_income_bucket
        }

    def predict(self, txn_data):
        if not self.is_trained:
            self.train_dummy()
        
        amount = txn_data.get('amount', 0)
        behavior = self.calculate_behavioral_features(txn_data)
        
        # Legacy features for Isolation Forest (still useful for general anomaly)
        velocity = 1
        is_structuring = 0
        if (48000 <= amount <= 49999) or (9000 <= amount <= 9999): is_structuring = 1
        if behavior['burst_rate'] > 10: velocity = 8
        
        features = np.array([[amount, velocity, is_structuring, behavior['inflow_outflow_ratio']]])
        score = self.model.decision_function(features)[0] 
        risk_score = 50 - (score * 200)
        if risk_score < 0: risk_score = 0
        if risk_score > 100: risk_score = 100
        
        return {
            "score": risk_score,
            "features": {
                "velocity": velocity,
                "is_structuring": is_structuring,
                "flow_ratio": behavior['inflow_outflow_ratio'],
                "median_holding_time": behavior['median_holding_time'],
                "monthly_turnover": behavior['monthly_turnover'],
                "inferred_income_bucket": behavior['inferred_income_bucket'],
                "burst_rate": behavior['burst_rate']
            }
        }

model_instance = FraudModel()
model_instance.train_dummy()
