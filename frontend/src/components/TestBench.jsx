import React, { useState, useEffect, useRef } from 'react';
import { generateData, resetSystem, getSimulationProgress } from '../api';
import { Play, RotateCcw, Database, Server, Settings, CheckCircle, AlertTriangle, Loader, Users, Dice5, Activity, Network, BarChart } from 'lucide-react';

const TestBench = () => {
    const [count, setCount] = useState(20);
    const [scenario, setScenario] = useState('mule');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [progress, setProgress] = useState(0);
    const pollingRef = useRef(null);

    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    const pollProgress = () => {
        if (pollingRef.current) clearInterval(pollingRef.current);

        pollingRef.current = setInterval(async () => {
            const data = await getSimulationProgress();
            setProgress(data.progress);
            if (!data.active && data.progress >= 100) {
                clearInterval(pollingRef.current);
                setLoading(false);
                setStatus({ type: 'success', message: 'Simulation completed with 100% data fidelity.' });
            }
        }, 1000);
    };

    const handleGenerate = async () => {
        setLoading(true);
        setStatus(null);
        setProgress(0);
        try {
            const res = await generateData(count, scenario);
            // status will be updated when progress reaches 100%
            pollProgress();
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to generate data. Check backend connection.' });
            setLoading(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm("Are you sure? This will delete ALL transaction data.")) return;

        setLoading(true);
        setStatus(null);
        try {
            await resetSystem();
            setStatus({ type: 'success', message: 'System reset successful. Database is empty.' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to reset system.' });
        } finally {
            setLoading(false);
        }
    };

    const scenarios = [
        {
            id: 'mule',
            title: 'Mule Relay Ring',
            icon: <Network className="w-6 h-6 text-purple-600" />,
            desc: 'Simulates a money mule network with rapid pass-throughs, relay behaviors, and profile mismatches.',
            features: ['Pass-through < 15m', 'Flow Ratio > 0.9', 'Profile Mismatch']
        },
        {
            id: 'velocity', // Maps to gambling logic backend
            title: 'Online Gambling',
            icon: <Dice5 className="w-6 h-6 text-orange-600" />,
            desc: 'Simulates high-velocity small transfers to a central aggregator node (Gambling Site).',
            features: ['High Velocity', 'Amount Clustering', 'Many-to-One']
        },
        {
            id: 'mixed',
            title: 'Full Simulation',
            icon: <Activity className="w-6 h-6 text-green-600" />,
            desc: 'A chaotic mix of Mule Rings, Gambling Velocity, and Structuring patterns.',
            features: ['Mule Networks', 'Gambling/High-Risk', 'Structuring']
        }
    ];

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Database className="w-8 h-8 text-blue-600" />
                        Scenario Studio
                    </h1>
                    <p className="text-gray-500 mt-2">Generate advanced financial crime patterns for surveillance testing.</p>
                </div>
                <button
                    onClick={handleReset}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 flex items-center gap-2 transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Reset System
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {scenarios.map((acc) => (
                    <button
                        key={acc.id}
                        onClick={() => setScenario(acc.id)}
                        className={`relative p-6 rounded-xl border-2 text-left transition-all ${scenario === acc.id
                            ? 'border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                {acc.icon}
                            </div>
                            {scenario === acc.id && (
                                <CheckCircle className="w-6 h-6 text-blue-600 fill-blue-50" />
                            )}
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2">{acc.title}</h3>
                        <p className="text-sm text-gray-600 mb-4 h-10">{acc.desc}</p>
                        <div className="flex flex-wrap gap-2">
                            {acc.features.map((feat, i) => (
                                <span key={i} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-500 font-medium">
                                    {feat}
                                </span>
                            ))}
                        </div>
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center justify-between">
                            <span>Transaction Volume</span>
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">{count} ISO-20022 Messages</span>
                        </label>
                        <input
                            type="range"
                            min="5" max="500" step="5"
                            value={count}
                            onChange={(e) => setCount(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between mt-2 text-xs text-gray-400">
                            <span>5 (Minimal)</span>
                            <span>250 (Moderate)</span>
                            <span>500 (Heavy)</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className={`w-full md:w-64 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-3 transition-all transform ${loading ? 'bg-gray-400 cursor-not-allowed scale-95' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                            }`}
                    >
                        {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                        {loading ? 'Simulating...' : 'Execute Simulation'}
                    </button>
                </div>

                {loading && (
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">Simulating Transaction Flow</span>
                            <span className="text-sm font-bold text-blue-600">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200 shadow-inner">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500 ease-out relative"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-3 flex items-center gap-2">
                            <Activity className="w-3 h-3 text-blue-400" />
                            Ingesting ISO-20022 messages and performing graph-aware risk scoring...
                        </p>
                    </div>
                )}
            </div>

            {status && (
                <div className={`mt-6 p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    <span className="font-medium">{status.message}</span>
                </div>
            )}
        </div>
    );
};

export default TestBench;
