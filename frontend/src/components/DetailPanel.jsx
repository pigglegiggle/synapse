import React from 'react';
import { Activity, Shield, MapPin, Monitor, Eye } from 'lucide-react';

const DetailPanel = ({ transaction, onInspectTransaction }) => {
    if (!transaction) {
        return (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Select an item to view details
            </div>
        );
    }

    // Handle Account Detail View
    if (transaction.type === 'ACCOUNT') {
        const data = transaction.data;
        return (
            <div className="h-full flex flex-col space-y-3 overflow-y-auto scrollbar-thin">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-medium">Account ID</label>
                        <div className="font-medium text-gray-900 text-sm mt-0.5">{data.account_id}</div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-medium">Transactions</label>
                        <div className="font-medium text-gray-900 text-sm mt-0.5">{data.total_txns}</div>
                    </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Avg Risk Score</span>
                        <span className={`text-lg font-semibold ${data.avg_risk > 50 ? 'text-red-600' : 'text-green-600'
                            }`}>
                            {data.avg_risk?.toFixed(1)}
                        </span>
                    </div>
                    <div className="text-xs text-gray-600">
                        High Risk: <span className="font-semibold">{data.high_risk_txns}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900">Recent Activity</h4>
                    {data.history && data.history.map((h, i) => (
                        <div key={i} className={`p-2.5 rounded-lg border ${h.risk_score > 80 ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
                            }`}>
                            <div className="flex justify-between mb-1.5">
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 text-xs">
                                        {h.role === 'Sender' ? 'Sent to' : 'From'} {h.other_account}
                                    </div>
                                    <div className="text-[10px] text-gray-500 mt-0.5">
                                        {new Date(h.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-xs text-gray-900">
                                        {parseInt(h.amount).toLocaleString()}
                                    </div>
                                    <div className={`text-xs font-medium ${h.risk_score > 80 ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                        Risk: {h.risk_score?.toFixed(0)}
                                    </div>
                                </div>
                            </div>
                            {h.reasons && h.reasons.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-100">
                                    {h.reasons.slice(0, 2).map((r, idx) => (
                                        <span key={idx} className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-medium">
                                            {r}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <button
                                onClick={() => onInspectTransaction && onInspectTransaction({
                                    ...h,
                                    transaction_id: h.txn_id,
                                    sender_account: h.role === 'Sender' ? data.account_id : h.other_account,
                                    receiver_account: h.role === 'Receiver' ? data.account_id : h.other_account
                                })}
                                className="w-full mt-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1.5"
                            >
                                <Eye className="w-3 h-3" /> View Details
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Transaction Detail View
    const isHighRisk = transaction.risk_score > 70;
    return (
        <div className="h-full flex flex-col space-y-3 overflow-y-auto scrollbar-thin">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs text-gray-500 uppercase font-medium">Transaction ID</label>
                    <div className="font-medium text-gray-900 text-sm mt-0.5">{transaction.transaction_id || "N/A"}</div>
                </div>
                <div>
                    <label className="text-xs text-gray-500 uppercase font-medium">Amount</label>
                    <div className="font-medium text-gray-900 text-sm mt-0.5">
                        {transaction.amount?.toLocaleString()} {transaction.currency}
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Risk Score</span>
                    <span className={`text-lg font-semibold ${isHighRisk ? 'text-red-600' : 'text-green-600'
                        }`}>
                        {transaction.risk_score?.toFixed(1)}
                    </span>
                </div>
                {transaction.reasons && transaction.reasons.length > 0 && (
                    <div className="space-y-1">
                        {transaction.reasons.map((r, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-red-600">
                                <Shield className="w-3 h-3 mt-0.5" />
                                {r}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">Transaction Path</h4>
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                        <span className="text-xs text-gray-500 font-medium">From</span>
                        <div className="text-right">
                            <div className="text-xs font-medium text-gray-900">
                                {transaction.sender_account?.split('-')[1]}
                            </div>
                            <div className="text-[10px] text-gray-500">
                                {transaction.sender_account?.split('-')[0]}
                            </div>
                        </div>
                    </div>
                    <div className="text-center text-gray-400">↓</div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                        <span className="text-xs text-gray-500 font-medium">To</span>
                        <div className="text-right">
                            <div className="text-xs font-medium text-gray-900">
                                {transaction.receiver_account?.split('-')[1]}
                            </div>
                            <div className="text-[10px] text-gray-500">
                                {transaction.receiver_account?.split('-')[0]}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">Context</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <span className="text-gray-500">Location</span>
                        <div className="font-medium text-gray-900 mt-0.5">
                            {transaction.location || "Unknown"}
                        </div>
                    </div>
                    <div>
                        <span className="text-gray-500">Device</span>
                        <div className="font-medium text-gray-900 mt-0.5">
                            {transaction.device_id || "Unknown"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailPanel;
