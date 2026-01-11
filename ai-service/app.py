from flask import Flask, request, jsonify
from flask_cors import CORS
from model import model_instance
import datetime

app = Flask(__name__)
CORS(app)

# --- Rule Engine Configuration (v2.0.0 - Graph-Aware) ---
RISK_MODEL_CONFIG = {
    "version": "2.0.0",
    "risk_model": {
        "scoring_type": "graph_aware_compound",
        "thresholds": {"monitor": 30, "review": 60, "high_risk": 80}
    },
    "ui_config": {
        "toggleable": True,
        "default_view": "grouped_by_use_case"
    }
}

# Clustering amounts for gambling detection
CLUSTERING_AMOUNTS = [100.0, 200.0, 300.0, 500.0, 1000.0, 1500.0]

# In-memory storage for rules
RULE_GROUPS = [
    {
        "group_id": "GAMBLING",
        "label": "Online Gambling Detection",
        "enabled": True,
        "rules": [
            {"id": "G001", "name": "High In-Out Velocity", "enabled": True, "score": 25, "desc": "High velocity in/out, balance not held"},
            {"id": "G002", "name": "Many-to-One Pattern", "enabled": True, "score": 30, "desc": "Multiple accounts transferring to one"},
            {"id": "G003", "name": "One-to-Many Payouts", "enabled": True, "score": 25, "desc": "One account paying out to many rapidly"},
            {"id": "G004", "name": "Amount Clustering", "enabled": True, "score": 15, "desc": "Common gambling amounts (100, 300, 500)"},
            {"id": "G005", "name": "Night & Weekend Activity", "enabled": True, "score": 10, "desc": "Activity during high-risk hours"},
            {"id": "G006", "name": "Generic Purpose Text", "enabled": True, "score": 10, "desc": "Empty or generic remark info"}
        ]
    },
    {
        "group_id": "MULE",
        "label": "Money Mule Detection",
        "enabled": True,
        "rules": [
            {"id": "M001", "name": "Pass-Through Behavior", "enabled": True, "score": 25, "desc": "Immediate flow-through < 15 mins"},
            {"id": "M002", "name": "One-to-One Relay", "enabled": True, "score": 20, "desc": "Repeated relay pattern"},
            {"id": "M003", "name": "High Velocity Bursts", "enabled": True, "score": 20, "desc": "20+ txns in short burst"},
            {"id": "M004", "name": "Profile Mismatch", "enabled": True, "score": 20, "desc": "Low inferred income, high turnover"},
            {"id": "M005", "name": "PromptPay Dominance", "enabled": True, "score": 15, "desc": "High PromptPay usage ratio"},
            {"id": "M006", "name": "Network Risk Inheritance", "enabled": True, "score": 25, "desc": "Connected to flagged accounts"}
        ]
    }
]

@app.route('/rules', methods=['GET'])
def get_rules():
    return jsonify({
        "config": RISK_MODEL_CONFIG,
        "groups": RULE_GROUPS
    })

@app.route('/rules/update', methods=['POST'])
def update_rule():
    req = request.json
    rule_id = req.get('id')
    enabled = req.get('enabled')
    
    found = False
    for group in RULE_GROUPS:
        for rule in group['rules']:
            if rule['id'] == rule_id:
                rule['enabled'] = enabled
                found = True
                break
    
    if found:
        return jsonify({"status": "success", "message": f"Rule {rule_id} updated"})
    return jsonify({"status": "error", "message": "Rule not found"}), 404

@app.route('/predict', methods=['POST'])
def predict():
    req_data = request.json
    
    # Support both old format (transaction only) and new format (transaction + context)
    if 'transaction' in req_data:
        data = req_data['transaction']
        receiver_context = req_data.get('receiver_context', {})
    else:
        data = req_data
        receiver_context = {}
    
    # Get AI features
    ai_result = model_instance.predict(data)
    features = ai_result['features']
    amount = data.get('amount', 0)
    
    # Extract receiver context (graph-aware signals)
    incoming_tx_count = int(receiver_context.get('incoming_tx_count', 0) or 0)
    unique_sender_count = int(receiver_context.get('unique_sender_count', 0) or 0)
    total_volume = float(receiver_context.get('total_volume', 0) or 0)
    avg_incoming_risk = float(receiver_context.get('avg_incoming_risk', 0) or 0)
    clustering_amount_count = int(receiver_context.get('clustering_amount_count', 0) or 0)
    
    total_score = 0
    triggered_rules = []
    
    # Flatten enabled rules for easy lookup
    active_rules = {}
    for group in RULE_GROUPS:
        if not group['enabled']: continue
        for rule in group['rules']:
            if rule['enabled']:
                active_rules[rule['id']] = rule['score']

    # ============================================================
    # GAMBLING GROUP (G-Series) - Now with GRAPH-AWARE SCORING
    # ============================================================
    
    # G002: Many-to-One Pattern (GRAPH-AWARE)
    # If receiver has many unique senders, this is a collector/aggregator
    if "G002" in active_rules and unique_sender_count >= 3:
        base_score = active_rules["G002"]
        # Compound multiplier: More senders = higher risk
        multiplier = min(4.0, 1 + (unique_sender_count / 5))
        contribution = int(base_score * multiplier)
        total_score += contribution
        triggered_rules.append(f"G002: Many-to-One ({unique_sender_count} unique senders, ×{multiplier:.1f})")
    
    # G004: Amount Clustering (GRAPH-AWARE)
    # Check BOTH current transaction AND historical clustering count
    is_clustering_amount = amount in CLUSTERING_AMOUNTS
    
    if "G004" in active_rules:
        if clustering_amount_count >= 3 or is_clustering_amount:
            base_score = active_rules["G004"]
            
            # Compound multiplier based on historical clustering patterns
            if clustering_amount_count >= 10:
                multiplier = 3.0  # Max multiplier for heavy clustering
            elif clustering_amount_count >= 5:
                multiplier = 2.0
            elif clustering_amount_count >= 3:
                multiplier = 1.5
            else:
                multiplier = 1.0
            
            contribution = int(base_score * multiplier)
            total_score += contribution
            
            if clustering_amount_count >= 3:
                triggered_rules.append(f"G004: Amount Clustering ({clustering_amount_count} patterns detected, ×{multiplier:.1f})")
            else:
                triggered_rules.append("G004: Amount Clustering (current tx)")

    # G001: High In-Out Velocity
    if "G001" in active_rules and features['velocity'] > 8 and features['flow_ratio'] > 0.9:
        total_score += active_rules["G001"]
        triggered_rules.append("G001: High In-Out Velocity")

    # ============================================================
    # MULE GROUP (M-Series) - Now with GRAPH-AWARE SCORING
    # ============================================================

    # M001: Pass-through (Behavioral)
    if "M001" in active_rules and features['median_holding_time'] < 15 and features['flow_ratio'] > 0.9:
        total_score += active_rules["M001"]
        triggered_rules.append("M001: Pass-Through Behavior (<15m)")

    # M003: High Velocity Burst
    if "M003" in active_rules and features['burst_rate'] > 20:
        total_score += active_rules["M003"]
        triggered_rules.append(f"M003: High Velocity Burst ({features['burst_rate']} tx)")

    # M004: Profile Mismatch
    if "M004" in active_rules and features['inferred_income_bucket'] == 'low' and features['monthly_turnover'] > 1000000:
        total_score += active_rules["M004"]
        triggered_rules.append("M004: Profile Mismatch (Low Income, High Turnover)")

    # M005: PromptPay Dominance (simulated via velocity)
    if "M005" in active_rules and features['velocity'] > 5:
        total_score += active_rules["M005"]
        triggered_rules.append("M005: PromptPay Relay Dominance")
    
    # M006: Network Risk Inheritance (GRAPH-AWARE)
    # If account has high avg incoming risk, inherit some of that risk
    if "M006" in active_rules and avg_incoming_risk > 50 and incoming_tx_count >= 3:
        base_score = active_rules["M006"]
        # Scale by how risky incoming transactions are
        risk_factor = min(2.0, avg_incoming_risk / 50)
        contribution = int(base_score * risk_factor)
        total_score += contribution
        triggered_rules.append(f"M006: Network Risk Inheritance (avg {avg_incoming_risk:.0f} from {incoming_tx_count} txns)")

    # ============================================================
    # VOLUME-BASED AMPLIFICATION (NEW)
    # ============================================================
    
    # If total volume through this account is very high, amplify risk
    if total_volume > 500000:  # 500k THB
        volume_bonus = min(20, int(total_volume / 100000))
        total_score += volume_bonus
        triggered_rules.append(f"VOLUME: High throughput (฿{total_volume:,.0f} total)")

    # ============================================================
    # Decision Logic
    # ============================================================
    
    # Cap at 100
    total_score = min(100, total_score)
    
    action = "Monitor"
    thresholds = RISK_MODEL_CONFIG["risk_model"]["thresholds"]
    
    if total_score >= thresholds["high_risk"]:
        action = "Escalate (EDD)"
    elif total_score >= thresholds["review"]:
        action = "Review"
    elif total_score >= thresholds["monitor"]:
        action = "Monitor"

    return jsonify({
        "risk_score": total_score,
        "action": action,
        "reasons": triggered_rules,
        "evidence": {
            "holding_time_min": features['median_holding_time'],
            "flow_ratio": features['flow_ratio'],
            "inferred_income": features['inferred_income_bucket'],
            "turnover": features['monthly_turnover'],
            "graph_context": {
                "incoming_tx_count": incoming_tx_count,
                "unique_sender_count": unique_sender_count,
                "clustering_amount_count": clustering_amount_count,
                "total_volume": total_volume
            }
        },
        "timestamp": datetime.datetime.now().isoformat(),
        "rule_version": RISK_MODEL_CONFIG["version"]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
