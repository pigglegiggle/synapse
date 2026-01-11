import React from 'react';
import { Brain, Shield, Search, Lock, Users, Zap, Fingerprint, Calculator } from 'lucide-react';

const ModelExplainer = () => {
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">How It Works</h1>
                <p className="text-gray-500">The journey of a transaction from entry to decision.</p>
            </div>

            <div className="relative">
                {/* Connecting Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block" />

                <div className="space-y-12 relative">

                    {/* Step 1: Entry */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center border-4 border-white shadow-sm z-10 relative">
                            <Fingerprint className="w-8 h-8 text-blue-600" />
                            <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">1</div>
                        </div>
                        <div className="flex-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">1. Behavior & Feature Extraction</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                The system doesn't just look at the amount. It calculates hidden behavioral features in real-time.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="p-3 bg-gray-50 rounded border border-gray-100">
                                    <div className="text-[10px] text-gray-400 uppercase font-bold">Velocity</div>
                                    <div className="font-semibold text-gray-800">High Burst</div>
                                    <div className="text-[10px] text-gray-400 mt-1">20+ txns/min</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded border border-gray-100">
                                    <div className="text-[10px] text-gray-400 uppercase font-bold">Flow Ratio</div>
                                    <div className="font-semibold text-purple-600">98% Match</div>
                                    <div className="text-[10px] text-red-500 mt-1">Money In ≈ Money Out (Mule)</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded border border-gray-100">
                                    <div className="text-[10px] text-gray-400 uppercase font-bold">Holding Time</div>
                                    <div className="font-semibold text-red-600">&lt; 15 Mins</div>
                                    <div className="text-[10px] text-gray-500 mt-1">Mule behavior</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded border border-gray-100">
                                    <div className="text-[10px] text-gray-400 uppercase font-bold">Inferred Income</div>
                                    <div className="font-semibold text-gray-800">Low</div>
                                    <div className="text-[10px] text-gray-500 mt-1">Mismatch with turnover</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: The Checkpoints */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0 w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center border-4 border-white shadow-sm z-10 relative">
                            <Shield className="w-8 h-8 text-purple-600" />
                            <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">2</div>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold text-gray-900">2. Hybrid Detection Engine</h3>
                                <span className="text-xs text-gray-500">We combine Unsupervised AI with Expert Rules.</span>
                            </div>

                            {/* Guard 1: AI */}
                            <div className="bg-white p-5 rounded-xl border-l-4 border-purple-500 shadow-sm flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                        <Brain className="w-4 h-4 text-purple-500" />
                                        Isolation Forest (Anomaly Detection)
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        "This transaction is a statistical outlier in the vector space."
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="px-3 py-1 bg-purple-100 text-purple-700 font-bold rounded-full text-xs">Score: 0.85</div>
                                </div>
                            </div>

                            {/* Guard 2: Rules */}
                            <div className="bg-white p-5 rounded-xl border-l-4 border-orange-500 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                            <Search className="w-4 h-4 text-orange-500" />
                                            Expert Policy Engine
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            "Matches known typologies (Mule, Structuring)."
                                        </p>
                                    </div>
                                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">2 Rules Hit</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm p-2 bg-red-50 rounded border border-red-100">
                                        <span className="flex items-center gap-2 text-red-800">
                                            <Users className="w-3 h-3" />
                                            M001: Mule Account (Pass-through)
                                        </span>
                                        <span className="font-bold text-red-600">+25 Pts</span>
                                    </div>
                                    <div className="flex justify-between text-sm p-2 bg-orange-50 rounded border border-orange-100">
                                        <span className="flex items-center gap-2 text-orange-800">
                                            <Zap className="w-3 h-3" />
                                            G002: Gambling Velocity
                                        </span>
                                        <span className="font-bold text-orange-600">+15 Pts</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Calculation */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center border-4 border-white shadow-sm z-10 relative">
                            <Calculator className="w-8 h-8 text-green-600" />
                            <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">3</div>
                        </div>
                        <div className="flex-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">3. Compound Scoring</h3>
                                <p className="text-sm text-gray-600">Final Risk Score = (AI Confidence * Weight) + Rule Violations</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-center p-3 bg-red-50 border border-red-100 rounded-lg">
                                    <div className="text-xs text-red-500 uppercase font-bold">Final Risk Score</div>
                                    <div className="text-3xl font-black text-red-700">85/100</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 4: Decision */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0 w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border-4 border-white shadow-sm z-10 relative">
                            <Lock className="w-8 h-8 text-white" />
                            <div className="absolute -top-2 -right-2 bg-slate-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">4</div>
                        </div>
                        <div className="flex-1 bg-gradient-to-r from-red-900 to-red-800 p-6 rounded-xl shadow-lg text-white flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-lg font-bold text-white">4. Final Verdict</h3>
                                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded uppercase animate-pulse">Block & KYC</span>
                                </div>
                                <p className="text-sm text-red-100">Score &gt; 80 triggers immediate freeze and Enhanced Due Diligence (EDD) request.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ModelExplainer;
