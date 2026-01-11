import requests
import time
import random
import datetime

API_URL = "http://localhost:8080/api/bank/transaction"

# Thai Bank Codes (Mock)
BANKS = ["KBANK", "SCB", "BBL", "KTB", "TTB", "BAY"]
LOCATIONS = ["Bangkok", "Chiang Mai", "Phuket", "Khon Kaen", "Pattaya", "Nonthaburi", "Udon Thani"]
DEVICES = [f"DEV{str(i).zfill(3)}" for i in range(1, 10)]

def generate_promptpay_id():
    # Simulate 08x-xxx-xxxx or 14000-xxx-xxxxx
    if random.random() < 0.8:
        return f"0{random.randint(6,9)}{random.randint(0,9)}-{random.randint(100,999)}-{random.randint(1000,9999)}"
    else:
        return f"{random.randint(1,5)}{random.randint(1000,9999)}-{random.randint(10000,99999)}-{random.randint(10,99)}"

def generate_account_id():
    bank = random.choice(BANKS)
    # ACC format: BANK-ACCOUNT_NUM
    return f"{bank}-{random.randint(100000, 999999)}"

def generate_transaction(tx_id, amount, sender, receiver, is_new=False, suspicious_ip=False):
    timestamp = datetime.datetime.now().isoformat() + "+07:00"
    
    sender_ip = "192.168.1.1" # Default localized IP
    if suspicious_ip:
        sender_ip = "45.155.205.1" # Known bad subnet example
        
    return {
      "transaction_id": tx_id,
      "amount": amount,
      "currency": "THB",
      "timestamp": timestamp,
      "sender_account": sender,
      "receiver_account": receiver,
      "sender_ip": sender_ip,
      "receiver_ip": "10.0.0.5", # Internal Switch IP
      "device_id": random.choice(DEVICES),
      "channel": "mobile_banking",
      "location": random.choice(LOCATIONS),
      "transaction_type": "promptpay_transfer",
      "metadata": {
          "sender_promptpay": generate_promptpay_id(),
          "receiver_promptpay": generate_promptpay_id()
      }
    }

def send_txn(data):
    try:
        print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {data['sender_account']} -> {data['receiver_account']} ({data['amount']:,.0f} THB)...", end="")
        resp = requests.post(API_URL, json=data)
        if resp.status_code == 200:
            res = resp.json()
            analysis = res['analysis_result']
            risk_score = analysis['risk_score']
            action = "FLAGGED" if risk_score > 70 else "CLEARED"
            
            # Colored output simulation
            if risk_score > 70:
                 print(f" \033[91m-> {action} (Score: {risk_score:.1f})\033[0m") # Red
            else:
                 print(f" \033[92m-> {action} (Score: {risk_score:.1f})\033[0m") # Green

            if analysis['reasons']:
                print(f"    \033[93mFlags: {analysis['reasons']}\033[0m")
        else:
            print(f" -> Error: {resp.status_code} {resp.text}")
    except Exception as e:
        print(f" -> Failed: {e}")

def main():
    print("================================================================")
    print("   THAI INTER-BANK SURVEILLANCE DATA GENERATOR (ITMX-M Mock)   ")
    print("================================================================")
    print("Simulating PromptPay traffic between: KBANK, SCB, BBL, KTB, TTB")
    time.sleep(2)
    
    count = 1000
    
    # Create valid accounts pool
    valid_accounts = [generate_account_id() for _ in range(30)]
    
    try:
        while True:
            tx_id = f"TXID-{datetime.datetime.now().strftime('%Y%m%d')}-{str(count).zfill(6)}"
            
            rand_val = random.random()
            
            if rand_val < 0.75: 
                # Normal: Small Ticket P2P
                amount = random.randint(200, 5000)
                sender = random.choice(valid_accounts)
                receiver = random.choice(valid_accounts)
                while receiver == sender or receiver.split('-')[0] == sender.split('-')[0]: # Encourage cross-bank
                     receiver = random.choice(valid_accounts)
                
                txn = generate_transaction(tx_id, amount, sender, receiver)
                send_txn(txn)
                
            elif rand_val < 0.85:
                # Rule: High Value Transfer (> 2M THB is reporting threshold usually, let's say 500k for demo)
                amount = random.randint(500000, 2000000)
                sender = random.choice(valid_accounts) 
                receiver = random.choice(valid_accounts)
                txn = generate_transaction(tx_id, amount, sender, receiver)
                send_txn(txn)
                
            elif rand_val < 0.95:
                # MULE FAN-IN (Many -> One)
                mule_target = f"SCB-999{random.randint(100,999)}" # Target Mule
                print(f"\n[!!!] DETECTING RAPID INFLOW TO {mule_target} (Mule Pattern)")
                for i in range(4):
                    sub_tx_id = f"{tx_id}-M{i}"
                    sender = generate_account_id() # Random external accounts
                    amount = random.randint(30000, 49000) # Smurfing just below 50k
                    txn = generate_transaction(sub_tx_id, amount, sender, mule_target, suspicious_ip=True)
                    send_txn(txn)
                    time.sleep(0.2)
                print("")

            else:
                # AI Anomaly: New Device + High Velocity
                sender = random.choice(valid_accounts)
                receiver = generate_account_id()
                amount = random.randint(100000, 300000)
                txn = generate_transaction(tx_id, amount, sender, receiver, suspicious_ip=True)
                send_txn(txn)

            # Random delay (Real-time feel)
            time.sleep(random.uniform(0.5, 2.0)) 
            count += 1
            
    except KeyboardInterrupt:
        print("\nStopped.")

if __name__ == "__main__":
    main()
