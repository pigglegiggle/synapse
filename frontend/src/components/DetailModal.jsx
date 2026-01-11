import React, { useState } from 'react';
import { X, Shield, TrendingUp, MapPin, Monitor, Brain, Loader, Eye, Lock } from 'lucide-react';

const DetailModal = ({ transaction, onClose, onInspectTransaction, onVerification }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState(null);

    if (!transaction) return null;

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            // Simulate AI analysis call
            await new Promise(resolve => setTimeout(resolve, 1500));
            setAiAnalysis({
                riskAssessment: "Medium to High",
                confidence: 87,
                patterns: [
                    "Unusual transaction velocity - 12 txns in last hour",
                    "Amount significantly above account average",
                    "New recipient account (first interaction)"
                ],
                recommendation: "This account shows patterns consistent with potential money laundering. Recommend further investigation into transaction history and beneficiary relationships.",
                behaviorScore: {
                    velocity: 78,
                    amount: 65,
                    network: 82
                }
            });
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Handle Account Detail View
    if (transaction.type === 'ACCOUNT') {
        const data = transaction.data;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
                    {/* Modal Header */}
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-lg text-gray-900">Account Inspector</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Detailed account analysis and insights</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin">
                        <div className="p-6 space-y-5">
                            {/* Account Info */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <label className="text-xs text-gray-500 uppercase font-medium block mb-1">Account ID</label>
                                    <div className="font-mono text-sm text-gray-900">{data.account_id}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <label className="text-xs text-gray-500 uppercase font-medium block mb-1">Total Transactions</label>
                                    <div className="text-lg font-semibold text-gray-900">{data.total_txns}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <label className="text-xs text-gray-500 uppercase font-medium block mb-1">High Risk Count</label>
                                    <div className="text-lg font-semibold text-red-600">{data.high_risk_txns}</div>
                                </div>
                            </div>

                            {/* Risk Score */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-gray-600" />
                                        <span className="font-semibold text-gray-900">Risk Assessment</span>
                                    </div>
                                    <span className={`text-2xl font-bold ${data.avg_risk > 50 ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                        {data.avg_risk?.toFixed(1)}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${data.avg_risk > 80 ? 'bg-red-500' :
                                            data.avg_risk > 50 ? 'bg-orange-500' : 'bg-green-500'
                                            }`}
                                        style={{ width: `${data.avg_risk}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* AI Analysis Section */}
                            <div className="border border-blue-200 rounded-lg overflow-hidden">
                                <div className="bg-blue-50 px-4 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Brain className="w-5 h-5 text-blue-600" />
                                        <span className="font-semibold text-blue-900">AI Analysis</span>
                                    </div>
                                    {!aiAnalysis && (
                                        <div className="px-3 py-1.5 bg-gray-200 text-gray-500 text-xs font-bold rounded-lg flex items-center gap-2 cursor-not-allowed opacity-75">
                                            <Lock className="w-3 h-3" />
                                            Coming in Finals
                                        </div>
                                    )}
                                </div>

                                {aiAnalysis ? (
                                    <div className="p-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-white p-3 rounded border border-gray-200">
                                                <div className="text-xs text-gray-500 mb-1">Risk Level</div>
                                                <div className="font-semibold text-orange-600">{aiAnalysis.riskAssessment}</div>
                                            </div>
                                            <div className="bg-white p-3 rounded border border-gray-200">
                                                <div className="text-xs text-gray-500 mb-1">Confidence</div>
                                                <div className="font-semibold text-gray-900">{aiAnalysis.confidence}%</div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-sm font-semibold text-gray-900 mb-2">Detected Patterns</div>
                                            <ul className="space-y-1.5">
                                                {aiAnalysis.patterns.map((pattern, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5"></span>
                                                        {pattern}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <div className="text-sm font-semibold text-gray-900 mb-2">Behavior Metrics</div>
                                            <div className="space-y-2">
                                                <div>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-gray-600">Velocity Risk</span>
                                                        <span className="font-semibold">{aiAnalysis.behaviorScore.velocity}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                        <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${aiAnalysis.behaviorScore.velocity}%` }}></div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-gray-600">Amount Anomaly</span>
                                                        <span className="font-semibold">{aiAnalysis.behaviorScore.amount}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                        <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${aiAnalysis.behaviorScore.amount}%` }}></div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-gray-600">Network Risk</span>
                                                        <span className="font-semibold">{aiAnalysis.behaviorScore.network}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${aiAnalysis.behaviorScore.network}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-orange-50 border border-orange-200 rounded p-3">
                                            <div className="text-xs font-semibold text-orange-900 mb-1">Inspector Notes</div>
                                            <div className="text-sm text-orange-800">{aiAnalysis.recommendation}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-500 text-sm">
                                        Click "Run Analysis" to generate AI-powered insights for this account
                                    </div>
                                )}
                            </div>

                            {/* Recent Activity */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Recent Activity</h4>
                                <div className="space-y-2">
                                    {data.history && data.history.map((h, i) => (
                                        <div key={i} className={`p-3 rounded-lg border ${h.risk_score > 80 ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
                                            }`}>
                                            <div className="flex justify-between mb-2">
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm text-gray-900">
                                                        {h.role === 'Sender' ? '→ Sent to' : '← From'} {h.other_account}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        {new Date(h.timestamp).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-sm">{parseInt(h.amount).toLocaleString()} THB</div>
                                                    <div className={`text-xs font-medium ${h.risk_score > 80 ? 'text-red-600' : 'text-green-600'
                                                        }`}>
                                                        Risk: {h.risk_score?.toFixed(0)}
                                                    </div>
                                                </div>
                                            </div>
                                            {h.reasons && h.reasons.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-100">
                                                    {h.reasons.slice(0, 3).map((r, idx) => (
                                                        <span key={idx} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                                                            {r}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <button
                                                onClick={() => onInspectTransaction && onInspectTransaction({
                                                    ...h,
                                                    transaction_id: h.txn_id,
                                                    txn_id: h.txn_id,
                                                    sender_account: h.role === 'Sender' ? data.account_id : h.other_account,
                                                    receiver_account: h.role === 'Receiver' ? data.account_id : h.other_account
                                                })}
                                                className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Eye className="w-4 h-4" /> View Full Details
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Transaction Detail View
    const isHighRisk = transaction.risk_score > 70;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900">Transaction Forensics</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Complete transaction analysis and metadata</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
                    <div className="space-y-5">
                        {/* Analyst Feedback - Moved to Top */}
                        <div className="pb-4 border-b border-gray-100">
                            <h4 className="font-semibold text-gray-900 mb-3 block">Analyst Verification</h4>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => onVerification && onVerification('CONFIRMED_FRAUD')}
                                    className={`flex-1 py-2.5 border rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 group
                                        ${transaction.verification_status === 'CONFIRMED_FRAUD'
                                            ? 'bg-red-600 text-white border-red-700 shadow-inner'
                                            : 'bg-white border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-gray-700'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full border ${transaction.verification_status === 'CONFIRMED_FRAUD' ? 'border-white bg-white' : 'border-gray-400 group-hover:border-red-500'}`}></div>
                                    Genuine Anomaly {transaction.verification_status === 'CONFIRMED_FRAUD' && '(Selected)'}
                                </button>
                                <button
                                    onClick={() => onVerification && onVerification('FALSE_POSITIVE')}
                                    className={`flex-1 py-2.5 border rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 group
                                        ${transaction.verification_status === 'FALSE_POSITIVE'
                                            ? 'bg-green-600 text-white border-green-700 shadow-inner'
                                            : 'bg-white border-gray-200 hover:bg-green-50 hover:border-green-200 hover:text-green-700 text-gray-700'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full border ${transaction.verification_status === 'FALSE_POSITIVE' ? 'border-white bg-white' : 'border-gray-400 group-hover:border-green-500'}`}></div>
                                    False Alarm {transaction.verification_status === 'FALSE_POSITIVE' && '(Selected)'}
                                </button>
                            </div>
                        </div>

                        {/* Transaction ID & Amount */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <label className="text-xs text-gray-500 uppercase font-medium block mb-1">Transaction ID</label>
                                <div className="font-mono text-sm text-gray-900">{transaction.transaction_id || transaction.txn_id || "N/A"}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <label className="text-xs text-gray-500 uppercase font-medium block mb-1">Amount</label>
                                <div className="text-lg font-semibold text-gray-900">
                                    {transaction.amount?.toLocaleString()} {transaction.currency || 'THB'}
                                </div>
                            </div>
                        </div>

                        {/* Risk Assessment - Detailed */}
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-5 rounded-lg border border-red-200">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-red-600" />
                                    <span className="font-semibold text-gray-900">Risk Assessment</span>
                                </div>
                                <span className={`text-2xl font-bold ${isHighRisk ? 'text-red-600' : 'text-green-600'}`}>
                                    {transaction.risk_score?.toFixed(1)} / 100
                                </span>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                                <div
                                    className={`h-2.5 rounded-full ${transaction.risk_score > 80 ? 'bg-red-500' :
                                        transaction.risk_score > 50 ? 'bg-orange-500' : 'bg-green-500'
                                        }`}
                                    style={{ width: `${transaction.risk_score}%` }}
                                ></div>
                            </div>

                            {transaction.reasons && transaction.reasons.length > 0 && (
                                <div>
                                    <div className="text-sm font-semibold text-gray-900 mb-2">Flagged Reasons:</div>
                                    <div className="space-y-2">
                                        {transaction.reasons.map((r, i) => (
                                            <div key={i} className="bg-white p-3 rounded border border-red-200">
                                                <div className="flex items-start gap-2">
                                                    <Shield className="w-4 h-4 text-red-600 mt-0.5" />
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-red-700">{r}</div>
                                                        <div className="text-xs text-gray-600 mt-1">
                                                            {r.includes('velocity') && "High frequency of transactions detected in short time period"}
                                                            {r.includes('amount') && "Transaction amount significantly deviates from account's normal behavior"}
                                                            {r.includes('time') && "Transaction occurred during unusual hours for this account"}
                                                            {r.includes('location') && "Geographic location mismatch or high-risk jurisdiction"}
                                                            {r.includes('pattern') && "Transaction pattern matches known fraud signatures"}
                                                            {!r.includes('velocity') && !r.includes('amount') && !r.includes('time') && !r.includes('location') && !r.includes('pattern') && "Anomalous behavior detected by AI model"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Transaction Path */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Transaction Flow
                            </h4>
                            <div className="space-y-3">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <div className="text-xs text-blue-700 font-medium mb-1">SENDER</div>
                                    <div className="font-mono text-sm font-semibold text-gray-900">{transaction.sender_account}</div>
                                    {transaction.sender_bank && (
                                        <div className="text-xs text-gray-600 mt-1">Bank: {transaction.sender_bank}</div>
                                    )}
                                </div>

                                <div className="flex items-center justify-center">
                                    <div className="text-gray-400 text-xl">↓</div>
                                </div>

                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <div className="text-xs text-purple-700 font-medium mb-1">RECEIVER</div>
                                    <div className="font-mono text-sm font-semibold text-gray-900">{transaction.receiver_account}</div>
                                    {transaction.receiver_bank && (
                                        <div className="text-xs text-gray-600 mt-1">Bank: {transaction.receiver_bank}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Technical Details */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Monitor className="w-4 h-4" />
                                Technical Details
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                    <div className="text-xs text-gray-500 font-medium mb-1">Sender IP Address</div>
                                    <div className="font-mono text-sm text-gray-900">{transaction.sender_ip || "192.168.1.100"}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                    <div className="text-xs text-gray-500 font-medium mb-1">Device ID</div>
                                    <div className="font-mono text-sm text-gray-900">{transaction.device_id || "device_abc123"}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                    <div className="text-xs text-gray-500 font-medium mb-1">Channel</div>
                                    <div className="text-sm text-gray-900 capitalize">{transaction.channel || "mobile"}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                    <div className="text-xs text-gray-500 font-medium mb-1">Session ID</div>
                                    <div className="font-mono text-xs text-gray-900">{transaction.session_id || "sess_xyz789"}</div>
                                </div>
                            </div>
                        </div>

                        {/* Location & Timestamp */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Location & Timing
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                    <div className="text-xs text-gray-500 font-medium mb-1">Location</div>
                                    <div className="text-sm text-gray-900">{transaction.location || "Bangkok, Thailand"}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                    <div className="text-xs text-gray-500 font-medium mb-1">Country Code</div>
                                    <div className="text-sm text-gray-900">{transaction.country || "TH"}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                    <div className="text-xs text-gray-500 font-medium mb-1">Timestamp</div>
                                    <div className="text-sm text-gray-900">
                                        {transaction.timestamp ? new Date(transaction.timestamp).toLocaleString() : "N/A"}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                    <div className="text-xs text-gray-500 font-medium mb-1">Transaction Type</div>
                                    <div className="text-sm text-gray-900">{transaction.txn_type || "Transfer"}</div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Metadata */}
                        <h4 className="font-semibold text-gray-900 mb-3">Additional Metadata</h4>
                        <div className="bg-gray-50 p-4 rounded border border-gray-200">
                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                                <div className="text-gray-600">Protocol:</div>
                                <div className="font-medium text-gray-900">ISO-20022</div>

                                <div className="text-gray-600">Message Type:</div>
                                <div className="font-medium text-gray-900">{transaction.message_type || "pacs.008"}</div>

                                <div className="text-gray-600">Processing Time:</div>
                                <div className="font-medium text-gray-900">{transaction.processing_time || "47ms"}</div>

                                <div className="text-gray-600">Status:</div>
                                <div className="font-medium text-green-600">{transaction.status || "Completed"}</div>
                            </div>
                        </div>
                    </div>

                    {/* Analyst Feedback */}

                </div>
            </div>
        </div>
    );
};

export default DetailModal;
