import React from 'react';
import { ChevronUp, ChevronDown, AlertTriangle } from 'lucide-react';

const AlertsDrawer = ({ alerts, isExpanded, onToggle, onSelectAlert }) => {
    return (
        <div className={`bg-white border-t border-gray-200 transition-all duration-300 ${isExpanded ? 'h-64' : 'h-12'
            }`}>
            {/* Drawer Header */}
            <button
                onClick={onToggle}
                className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="font-medium text-gray-900">Recent Alerts</span>
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                        {alerts.length}
                    </span>
                </div>
                {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                )}
            </button>

            {/* Drawer Content */}
            {isExpanded && (
                <div className="px-6 pb-4 overflow-y-auto scrollbar-thin" style={{ height: 'calc(100% - 48px)' }}>
                    {alerts.length === 0 ? (
                        <div className="text-center text-gray-400 py-8 text-sm">
                            No alerts at this time
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {alerts.map((alert) => (
                                <div
                                    key={alert.transaction_id}
                                    onClick={() => onSelectAlert(alert)}
                                    className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-all bg-white"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium text-gray-900 text-sm">
                                            {alert.transaction_id}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${alert.action === 'Block'
                                                ? 'bg-red-50 text-red-700' :
                                                alert.action === 'Review'
                                                    ? 'bg-orange-50 text-orange-700' :
                                                    'bg-green-50 text-green-700'
                                            }`}>
                                            {alert.action}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        Risk: <span className="font-semibold">{alert.risk_score.toFixed(1)}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {new Date(alert.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AlertsDrawer;
