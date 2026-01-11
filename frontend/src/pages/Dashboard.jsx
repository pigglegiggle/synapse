import React, { useState, useEffect } from 'react';
import { Activity, Bell, Shield, TrendingUp, Check, ZoomIn, ZoomOut, Maximize2, RotateCcw, Database, Brain, Lock } from 'lucide-react';
import TransactionGraph from '../components/Graph';
import AlertPanel from '../components/AlertPanel';
import DetailModal from '../components/DetailModal';
import InvestigationModal from '../components/InvestigationModal';
import { getGraphData, getAccountDetails, getVerificationStats, updateVerificationStats, verifyTransaction } from '../api';

const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [inspectingTransaction, setInspectingTransaction] = useState(null);
    const [graphKey, setGraphKey] = useState(0);
    const [verificationStats, setVerificationStats] = useState({ checked: 0, false_positives: 0 });

    // Graph Controls State
    const [graphLimit, setGraphLimit] = useState(50);
    const [graphMinRisk, setGraphMinRisk] = useState(0);

    useEffect(() => {
        const handleLimitUpdate = (e) => setGraphLimit(e.detail);
        const handleRiskUpdate = (e) => setGraphMinRisk(e.detail);

        window.addEventListener('update-limit', handleLimitUpdate);
        window.addEventListener('update-risk', handleRiskUpdate);

        // Initial Fetch of Stats
        getVerificationStats().then(setVerificationStats);

        return () => {
            window.removeEventListener('update-limit', handleLimitUpdate);
            window.removeEventListener('update-risk', handleRiskUpdate);
        };
    }, []);

    // Poll for data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getGraphData({ limit: graphLimit, minRisk: graphMinRisk });
                setTransactions(data || []);
                // Get high risk as alerts (no limit - show all)
                const highRisk = (data || []).filter(t => t.risk_score > 70);
                setAlerts(highRisk.map(t => ({
                    ...t,
                    transaction_id: t.txn_id,
                    action: t.risk_score > 80 ? 'High Risk' : 'Medium Risk'
                })));

                // Refresh stats
                const stats = await getVerificationStats();
                setVerificationStats(stats);
            } catch (err) {
                // console.error(err);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, [graphLimit, graphMinRisk]);

    const highRiskCount = transactions.filter(t => t.risk_score > 80).length;

    const falsePositiveRate = verificationStats.checked > 0
        ? ((verificationStats.false_positives / verificationStats.checked) * 100).toFixed(2)
        : "0.00";

    const monitoredVolume = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const fraudPrevented = transactions
        .filter(t => t.risk_score > 80)
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    const formatCurrency = (val) => {
        if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
        return `$${val.toLocaleString()}`;
    };

    const handleVerification = async (verdict) => {
        // Only count as false positive if the transaction was actually flagged as high-risk
        // and the analyst marked it as safe
        const wasHighRisk = inspectingTransaction && inspectingTransaction.risk_score > 70;

        if (verdict === 'FALSE_POSITIVE' && !wasHighRisk) {
            // Low-risk transaction marked as safe - this is expected, not a false positive
            // Just close the modal without incrementing false positive counter
            setInspectingTransaction(null);
            return;
        }

        await updateVerificationStats(verdict);
        const newStats = await getVerificationStats();
        setVerificationStats(newStats);
        setInspectingTransaction(null);
    };

    const handleDetailVerification = async (verdict) => {
        const tx = selectedTransaction;
        if (!tx) return;

        // 1. Call Backend to save verification
        await verifyTransaction(tx.txn_id || tx.transaction_id, verdict);

        // 2. Update Local State (to reflect change in UI immediately)
        // Update selected transaction
        setSelectedTransaction(prev => ({ ...prev, verification_status: verdict }));

        // Update graph nodes if it exists in graph
        // (Optional: trigger graph refresh or just update node color if we had complex state)

        // 3. Update Stats
        await updateVerificationStats(verdict);
        const newStats = await getVerificationStats();
        setVerificationStats(newStats);

        // DO NOT CLOSE MODAL AUTOMATICALLY
        // setSelectedTransaction(null); 
    };

    return (
        <div className="flex-1 overflow-hidden flex flex-col h-full">
            {/* RiskOps Metrics */}
            <div className="grid grid-cols-4 gap-6 p-6 pb-2 shrink-0">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Monitored Volume</div>
                        <TrendingUp className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 tracking-tight">{formatCurrency(monitoredVolume)}</div>
                    <div className="text-xs text-slate-500 mt-2 font-medium bg-slate-100 inline-block px-2 py-0.5 rounded">
                        Last 24h
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-green-300 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">False Positive Rate</div>
                        <Activity className="w-5 h-5 text-slate-300 group-hover:text-green-500 transition-colors" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 tracking-tight">{falsePositiveRate}%</div>
                    <div className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Target &lt; 0.5%
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Fraud Prevented</div>
                        <Shield className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <div className="text-3xl font-bold text-indigo-600 tracking-tight">{formatCurrency(fraudPrevented)}</div>
                    <div className="text-xs text-slate-500 mt-2 font-medium">
                        {highRiskCount} High-risk Blocks
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-orange-300 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Case Queue</div>
                        <Bell className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 tracking-tight">{alerts.length}</div>
                    <div className="text-xs text-orange-600 font-medium mt-2 flex items-center gap-1">
                        Requires Attention
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex p-6 pt-4 gap-6">
                {/* Graph Section */}
                <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <h2 className="font-semibold text-slate-900 text-sm">Transaction Network</h2>
                            <div className="h-4 w-px bg-slate-300"></div>
                            {/* Filters */}
                            <div className="flex items-center gap-2">
                                <select
                                    onChange={(e) => window.dispatchEvent(new CustomEvent('update-limit', { detail: parseInt(e.target.value) }))}
                                    className="text-xs bg-white border border-slate-200 rounded-md py-1 pr-6 focus:ring-1 focus:ring-indigo-500 outline-none"
                                    defaultValue="50"
                                >
                                    <option value="50">Last 50</option>
                                    <option value="100">Last 100</option>
                                    <option value="500">Last 500</option>
                                    <option value="999999">All (∞)</option>
                                </select>
                                <select
                                    onChange={(e) => window.dispatchEvent(new CustomEvent('update-risk', { detail: parseFloat(e.target.value) }))}
                                    className="text-xs bg-white border border-slate-200 rounded-md py-1 pr-6 focus:ring-1 focus:ring-indigo-500 outline-none"
                                    defaultValue="0"
                                >
                                    <option value="0">All Risk</option>
                                    <option value="50">Medium Risk (&gt;50)</option>
                                    <option value="80">High Risk (&gt;80)</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-400 text-xs font-semibold rounded border border-gray-200 cursor-not-allowed">
                                    <Brain className="w-3 h-3" />
                                    AI Network Analyst
                                    <Lock className="w-2.5 h-2.5 ml-1 opacity-70" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 rounded bg-white border border-slate-200 p-0.5">
                                <button onClick={() => window.dispatchEvent(new CustomEvent('graph-zoom-in'))} className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Zoom In"><ZoomIn className="w-3.5 h-3.5 text-slate-600" /></button>
                                <div className="w-px h-3 bg-slate-200"></div>
                                <button onClick={() => window.dispatchEvent(new CustomEvent('graph-zoom-out'))} className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Zoom Out"><ZoomOut className="w-3.5 h-3.5 text-slate-600" /></button>
                                <div className="w-px h-3 bg-slate-200"></div>
                                <button onClick={() => window.dispatchEvent(new CustomEvent('graph-fit'))} className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Fit to Screen"><Maximize2 className="w-3.5 h-3.5 text-slate-600" /></button>
                                <div className="w-px h-3 bg-slate-200"></div>
                                <button onClick={() => setGraphKey(prev => prev + 1)} className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Reset View"><RotateCcw className="w-3.5 h-3.5 text-slate-600" /></button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                        <TransactionGraph
                            key={graphKey}
                            transactions={transactions}
                            onSelectNode={async (nodeId) => {
                                if (nodeId) {
                                    try {
                                        const details = await getAccountDetails(nodeId);
                                        setSelectedTransaction({ type: 'ACCOUNT', data: details });
                                    } catch (e) {
                                        console.error("Failed to fetch account details", e);
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Right Alerts Panel */}
                <div className="w-80 shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
                        <h3 className="font-semibold text-slate-900 text-sm">Risk Alerts</h3>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">{alerts.length}</span>
                    </div>
                    <div className="flex-1 overflow-auto p-2">
                        <AlertPanel alerts={alerts} onSelectAlert={setSelectedTransaction} />
                    </div>
                </div>
            </div>

            {/* Floating Detail Modal */}
            {selectedTransaction && (
                <DetailModal
                    transaction={selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                    onInspectTransaction={(txn) => setInspectingTransaction(txn)}
                    onVerification={handleDetailVerification}
                />
            )}

            {/* Investigation Modal */}
            {inspectingTransaction && (
                <InvestigationModal
                    transaction={inspectingTransaction}
                    onClose={() => setInspectingTransaction(null)}
                    onVerification={handleVerification}
                />
            )}
        </div>
    );
};

export default Dashboard;
