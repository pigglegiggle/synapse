---
marp: true
theme: default
class: invert
size: 16:9
style: |
  :root {
    --h1-color: #60a5fa;
    --h2-color: #a78bfa;
    --text-color: #f1f5f9;
    --bg-gradient: linear-gradient(135deg, #020617 0%, #1e1b4b 100%);
    --card-bg: rgba(255, 255, 255, 0.03);
    --card-border: 1px solid rgba(255, 255, 255, 0.08);
  }
  section {
    background-image: var(--bg-gradient);
    color: var(--text-color);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    padding: 60px;
  }
  h1 {
    color: var(--h1-color);
    font-size: 60px;
    margin-bottom: 20px;
    background: linear-gradient(to right, #60a5fa, #c084fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  h2 {
    color: var(--h2-color);
    font-size: 40px;
    border-bottom: none;
    margin-bottom: 30px;
  }
  h3 {
    color: #e2e8f0;
    font-size: 28px;
  }
  p, li {
    font-size: 24px;
    line-height: 1.6;
    color: #cbd5e1;
  }
  strong {
    color: #38bdf8;
    font-weight: 700;
  }
  .columns {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
  }
  .columns-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
  }
  .card {
    background: var(--card-bg);
    border: var(--card-border);
    border-radius: 16px;
    padding: 25px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
  }
  .badge {
    display: inline-block;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 16px;
    font-weight: bold;
    margin-right: 10px;
  }
  .badge-red { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); }
  .badge-green { background: rgba(34, 197, 94, 0.2); color: #86efac; border: 1px solid rgba(34, 197, 94, 0.3); }
  .badge-blue { background: rgba(59, 130, 246, 0.2); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.3); }
  
  .footer {
    position: absolute;
    bottom: 30px;
    right: 50px;
    font-size: 16px;
    color: #64748b;
  }
---

<!-- _class: lead -->
# SYNAPSE
## AI-Powered Thai Inter-Bank Fraud Surveillance

<div style="margin-top: 50px;">
  <p style="font-size: 32px; color: #94a3b8;">Protecting the Thai financial ecosystem with<br/>Graph Intelligence and Adaptive AI</p>
</div>

<div style="margin-top: 80px; display: inline-block; padding: 15px 40px; border: 1px solid #60a5fa; border-radius: 50px; color: #60a5fa;">
  Team <strong>4TB</strong>
</div>

---

# The Crisis: Fraud Costing Billions

The Thai banking sector faces a sophisticated wave of financial crime.

<div class="columns">
  <div class="card">
    <h3>💰 Money Mules</h3>
    <p>Ordinary citizens recruited to move illicit funds.</p>
    <p class="badge badge-red">High Velocity</p> <p class="badge badge-red">Pass-through</p>
  </div>
  
  <div class="card">
    <h3>🎰 Gambling Rings</h3>
    <p>Complex many-to-one networks evading simple rules.</p>
    <p class="badge badge-red">Structuring</p> <p class="badge badge-red">Clustering</p>
  </div>

  <div class="card">
    <h3>📉 Legacy Systems</h3>
    <p>Rules-only systems flag too many false positives.</p>
    <p class="badge badge-red">Inefficient</p> <p class="badge badge-red">Slow</p>
  </div>

  <div class="card">
    <h3>🚨 The Impact</h3>
    <p>Billions lost annually. Trust damaged. Compliance overwhelmed.</p>
  </div>
</div>

<div class="footer">Synapse | Team 4TB</div>

---

# Our Solution: The Three-Layer Defense

Synapse protects real-time transactions by combining three powerful technologies.

<div class="columns-3" style="margin-top: 40px;">
  <div class="card">
    <h3>1. ML Anomaly Detection</h3>
    <p><strong>Isolation Forest</strong> models learn normal behavior and flag statistical outliers.</p>
    <ul style="font-size: 18px; color: #94a3b8;">
      <li>Pass-through timing</li>
      <li>Inflow/Outflow ratios</li>
      <li>Burst rates</li>
    </ul>
  </div>

  <div class="card">
    <h3>2. Smart Rule Engine</h3>
    <p><strong>12 Configurable Rules</strong> targeting specific Thai fraud typologies.</p>
    <ul style="font-size: 18px; color: #94a3b8;">
      <li>Mule detection (M-Series)</li>
      <li>Gambling patterns (G-Series)</li>
      <li>Structuring detection</li>
    </ul>
  </div>

  <div class="card">
    <h3>3. Graph Intelligence</h3>
    <p><strong>Neo4j</strong> network analysis tracks risk propagation across accounts.</p>
    <ul style="font-size: 18px; color: #94a3b8;">
      <li>Risk inheritance</li>
      <li>Many-to-one detection</li>
      <li>Visual investigation</li>
    </ul>
  </div>
</div>

<div class="footer">Synapse | Team 4TB</div>

---

# How It Works: Architecture

<div class="card" style="display: flex; justify-content: center; align-items: center; height: 500px; font-family: monospace;">
  <div style="text-align: center;">
    <div style="border: 2px solid #60a5fa; padding: 15px; border-radius: 10px; display: inline-block;">Thai Inter-Bank Stream</div>
    <div style="font-size: 30px; color: #64748b;">⬇</div>
    <div style="border: 2px solid #a78bfa; padding: 20px; border-radius: 10px; background: rgba(167, 139, 250, 0.1);">
      <h3 style="margin: 0 0 10px 0;">SYNAPSE ENGINE (Go + Python)</h3>
      <div style="display: flex; gap: 20px; justify-content: center;">
        <span class="badge badge-blue">Rule Engine</span>
        <span class="badge badge-blue">ML Model</span>
        <span class="badge badge-blue">Graph DB (Neo4j)</span>
      </div>
    </div>
    <div style="font-size: 30px; color: #64748b;">⬇</div>
    <div style="display: flex; gap: 40px; justify-content: center;">
      <div style="border: 2px solid #34d399; padding: 15px; border-radius: 10px; color: #34d399;">Allow (Low Risk)</div>
      <div style="border: 2px solid #f472b6; padding: 15px; border-radius: 10px; color: #f472b6;">Review (Medium Risk)</div>
      <div style="border: 2px solid #ef4444; padding: 15px; border-radius: 10px; color: #ef4444;">BLOCK (High Risk)</div>
    </div>
  </div>
</div>

<div class="footer">Synapse | Team 4TB</div>

---

# Live Demo Highlights

A fully functional <strong>React 19 + Go</strong> platform ready for deployment.

<div class="columns">
  <div>
    <h3>📊 Real-Time Dashboard</h3>
    <p>Monitors volume, fraud prevented, and false positive rates live.</p>
    <br/>
    <h3>🕸️ Interactive Graph</h3>
    <p>Visualizes transaction networks. Nodes colored by risk level (Red/Orange/Blue).</p>
  </div>
  <div class="card">
    <h3>Investigation Workflow</h3>
    <ul style="list-style-type: none; padding: 0;">
      <li style="margin-bottom: 20px;">🚨 <strong>Alert Queue</strong>: Prioritized high-risk cases</li>
      <li style="margin-bottom: 20px;">🔍 <strong>Deep Dive</strong>: Inspect triggered rules & evidence</li>
      <li>✅ <strong>Verdict</strong>: Analyst feedback loop</li>
    </ul>
  </div>
</div>

<div class="footer">Synapse | Team 4TB</div>

---

# Current Intelligence Features (Phase 1)

Our system is already live with advanced detection capabilities.

<div class="columns">
  <div class="card">
    <h3>Behavioral Rules</h3>
    <ul>
      <li><strong>M001 Pass-Through</strong>: Funds held < 15 mins.</li>
      <li><strong>G004 Amount Clustering</strong>: Frequent bets of 100/300/500 THB.</li>
      <li><strong>M005 PromptPay Dominance</strong>: Unusual usage patterns.</li>
    </ul>
  </div>
  <div class="card">
    <h3>Graph Patterns</h3>
    <ul>
      <li><strong>Relationship Risk</strong>: If Account A is fraudulent, Account B inherits risk.</li>
      <li><strong>Star Topology</strong>: Detects 'Collector' accounts (Gambling) and 'Distributor' accounts (Mule Payouts).</li>
    </ul>
  </div>
</div>

<div class="footer">Synapse | Team 4TB</div>

---

# Future Roadmap: Advanced AI (Phase 2)

If selected for the finals, we evolve from Detection to <strong>Prediction & Explanation</strong>.

<div class="columns-3">
  <div class="card">
    <h3 style="color: #60a5fa">🧠 LLM Agent</h3>
    <p><strong>Natural Language Investigations</strong></p>
    <p style="font-size: 18px">"Why is this suspicious?"<br/>GPT-4 generates readable explanations and auto-reports.</p>
  </div>
  
  <div class="card">
    <h3 style="color: #34d399">🕸️ GNNs</h3>
    <p><strong>Graph Neural Networks</strong></p>
    <p style="font-size: 18px">Deep learning directly on the graph structure to find hidden criminal rings.</p>
  </div>

  <div class="card">
    <h3 style="color: #f472b6">🔄 Adaptive Learning</h3>
    <p><strong>Reinforcement Learning</strong></p>
    <p style="font-size: 18px">System self-tunes rule thresholds based on analyst feedback.</p>
  </div>
</div>

<div class="footer">Synapse | Team 4TB</div>

---

# Impact & Market

Scalable technology for a safer Thai digital economy.

<div class="columns">
  <div>
    <h2>Why Now?</h2>
    <p>Thailand's digital transaction volume is exploding via PromptPay, making manual monitoring impossible.</p>
    <br/>
    <h2>The Value</h2>
    <ul>
      <li><strong>Stop Losses</strong>: Prevent millions in daily fraud.</li>
      <li><strong>Save Time</strong>: 90% reduction in false positives.</li>
      <li><strong>Build Trust</strong>: Secure the banking ecosystem.</li>
    </ul>
  </div>
  <div style="display: flex; justify-content: center; align-items: center;">
    <div style="text-align: center;">
      <div style="font-size: 80px; font-weight: bold; color: #60a5fa;">99.5%</div>
      <p>Target Accuracy</p>
      <br/>
      <div style="font-size: 80px; font-weight: bold; color: #34d399;">&lt;100ms</div>
      <p>Processing Latency</p>
    </div>
  </div>
</div>

<div class="footer">Synapse | Team 4TB</div>

---

<!-- _class: lead -->
# Thank You
## Ready to Secure the Future of Banking

<div style="display: flex; gap: 40px; justify-content: center; margin-top: 60px;">
  <div style="text-align: center;">
    <div style="width: 100px; height: 100px; background: #334155; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 40px;">👨‍💻</div>
    <h3>Team 4TB</h3>
  </div>
</div>

<div style="margin-top: 50px; font-size: 24px; color: #94a3b8;">
  GitHub: github.com/4tb/synapse • Demo Available
</div>

<div class="footer">Synapse | Team 4TB</div>
