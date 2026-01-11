import React, { useState, useEffect } from 'react';
import { Shield, Settings, Info, ToggleLeft, ToggleRight, Save, LayoutGrid, AlertTriangle } from 'lucide-react';

const RuleConfig = () => {
    const [config, setConfig] = useState(null);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const res = await fetch('http://localhost:5001/rules');
            const data = await res.json();
            setConfig(data.config);
            setGroups(data.groups);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load rules", err);
            setLoading(false);
        }
    };

    const toggleRule = async (ruleId, currentEnabled) => {
        try {
            // Optimistic UI update
            const newGroups = groups.map(group => ({
                ...group,
                rules: group.rules.map(rule =>
                    rule.id === ruleId ? { ...rule, enabled: !currentEnabled } : rule
                )
            }));
            setGroups(newGroups);

            // API Call
            await fetch('http://localhost:5001/rules/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: ruleId, enabled: !currentEnabled })
            });
        } catch (err) {
            console.error("Failed to toggle rule", err);
            fetchRules(); // Revert on error
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Configuration...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Settings className="w-6 h-6 text-gray-700" />
                        Rule Engine Configuration
                    </h1>
                    <p className="text-gray-500 mt-1">Manage risk detection logic and thresholds (v{config?.version})</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 flex items-center gap-2 text-sm text-gray-600">
                        {/* <LayoutGrid className="w-4 h-4" /> */}
                        {/* <span>View: {config?.ui_config?.default_view}</span> */}
                    </div>
                </div>
            </div>

            {/* Thresholds Card */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                {['monitor', 'review', 'high_risk'].map((level) => (
                    <div key={level} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${level === 'high_risk' ? 'bg-red-500' : level === 'review' ? 'bg-orange-500' : 'bg-yellow-500'
                            }`} />
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{level.replace('_', ' ')}</div>
                        <div className="text-3xl font-bold text-gray-900">{config?.risk_model?.thresholds[level]}</div>
                        <div className="text-xs text-gray-500 mt-2">Score Threshold</div>
                    </div>
                ))}
            </div>

            {/* Rule Groups */}
            <div className="space-y-8">
                {groups.map((group) => (
                    <div key={group.group_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${group.group_id === 'MULE' ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'}`}>
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{group.label}</h3>
                                    <p className="text-xs text-gray-500">{group.rules.length} Active Rules</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">Active</span>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {group.rules.map((rule) => (
                                <div key={rule.id} className={`p-6 flex items-start justify-between transition-colors ${!rule.enabled ? 'bg-gray-50/50 opacity-60' : 'hover:bg-slate-50'}`}>
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1">
                                            <div className="font-mono text-xs font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{rule.id}</div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                                {rule.name}
                                                <span className="text-xs font-normal text-gray-400">({rule.score} pts)</span>
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1">{rule.desc}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => toggleRule(rule.id, rule.enabled)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${rule.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${rule.enabled ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RuleConfig;
