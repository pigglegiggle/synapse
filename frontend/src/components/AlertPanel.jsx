import React from 'react';
import { AlertTriangle, Clock, ChevronRight, User, AlertOctagon, CheckCircle } from 'lucide-react';

const AlertPanel = ({ alerts, onSelectAlert }) => {
    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm shrink-0">
                <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                    <AlertOctagon className="w-4 h-4 text-orange-500" />
                    <span>Case Queue</span>
                </div>
                <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {alerts.length} Pending
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-0">
                {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
                        <CheckCircle className="w-8 h-8 text-slate-300" />
                        <span className="text-sm">All caught up! No open cases.</span>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {alerts.map((alert) => (
                            <div
                                key={alert.transaction_id}
                                onClick={() => onSelectAlert(alert)}
                                className="group bg-white hover:bg-slate-50 cursor-pointer transition-colors p-3 relative border-l-4 border-transparent hover:border-indigo-500"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs font-medium text-slate-500">#{alert.transaction_id.substring(0, 8)}</span>
                                        {alert.risk_score > 90 ? (
                                            <span className="text-[10px] font-bold uppercase tracking-wide bg-red-100 text-red-700 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> Critical
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold uppercase tracking-wide bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-sm">
                                                High Priority
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </div>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <div className="text-sm font-semibold text-slate-900">
                                            Fraud Score: <span className={alert.risk_score > 90 ? "text-red-600" : "text-orange-600"}>{alert.risk_score.toFixed(0)}/100</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <User className="w-3 h-3" />
                                            <span>Target Account: ...{alert.role === 'Sender' ? alert.receiver_account.substring(0, 4) : alert.sender_account.substring(0, 4)}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertPanel;
