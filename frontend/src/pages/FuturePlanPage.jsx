import React from 'react';
import { Database, TrendingUp, GitMerge, Target, Search, ArrowRight, Server, Layers, Sliders, Bot } from 'lucide-react';

const FuturePlanPage = () => {
    const plans = [
        {
            icon: Database,
            title: "Real-Time Feature Store",
            color: "text-blue-600",
            bg: "bg-blue-100",
            current: "Simulated behavioral data (in-memory)",
            future: "Production Redis/Feast Implementation",
            desc: "Currently, we simulate complex behaviors like 'holding time' or 'velocity'. The next step is to build a real sliding-window aggregation engine using Redis to calculate these features in milli-seconds for every actual transaction."
        },
        {
            icon: TrendingUp,
            title: "Supervised Gradient Boosting",
            color: "text-green-600",
            bg: "bg-green-100",
            current: "Unsupervised Isolation Forest + Static Rules",
            future: "XGBoost/LightGBM trained on Analyst Feedback",
            desc: "We are collecting 'False Positive' and 'Confirmed Fraud' labels from your dashboard. We will use this labeled dataset to train a supervised model (XGBoost) that learns exactly what YOUR analysts consider fraud, replacing generic anomaly detection."
        },
        {
            icon: Bot,
            title: "Agentic Network Analyst",
            color: "text-purple-600",
            bg: "bg-purple-100",
            current: "Static Filters (e.g. Risk > 80)",
            future: "Autonomous Pattern Hunter",
            desc: "Instead of analysts manually filtering the graph, an AI Agent will proactively 'walk' the network 24/7. It follows money trails, identifies mule rings, and auto-generates case files with evidence (screenshots of the graph) for human review."
        },
        {
            icon: Sliders,
            title: "Dynamic Rule Engine",
            color: "text-pink-600",
            bg: "bg-pink-100",
            current: "Hardcoded thresholds (app.py)",
            future: "No-Code Rule Builder (Add/Delete/Edit)",
            desc: "Empower analysts to create, delete, and modify complex logic patterns without writing a single line of code. We will build a visual drag-and-drop policy editor backed by a hot-swappable database engine."
        },
        {
            icon: Target,
            title: "GenAI Rule Architect",
            color: "text-red-600",
            bg: "bg-red-100",
            current: "Manual Rule Config",
            future: "AI-Generated Policy Suggestions",
            desc: "The AI won't just tune numbers; it will invent new rules. Analyze confirmed fraud cases to discover hidden patterns (e.g., 'Fraudsters often use device X between 2-4 AM') and automatically draft new rules for analysts to approve."
        },
        {
            icon: Search,
            title: "SHAP Explanability",
            color: "text-orange-600",
            bg: "bg-orange-100",
            current: "Rule Names",
            future: "Feature Contribution Plots",
            desc: "For the 'Black Box' models, we will implement SHAP (SHapley Additive exPlanations) to show analysts exactly how much 'Time of Day' vs 'Amount' contributed to a specific risk score."
        }
    ];

    return (
        <div className="flex-1 h-screen overflow-y-auto bg-gray-50">
            <header className="bg-slate-900 text-white px-8 py-12 relative overflow-hidden">
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-indigo-500 bg-opacity-30 rounded-full text-indigo-200 text-sm font-medium border border-indigo-500 border-opacity-30">
                            Hackathon Roadmap
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Execution Plan for the Finals</h1>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                        If selected for the final round, we are ready to implement these 5 advanced technologies within the 24-hour hackathon.
                    </p>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-8 py-12">
                <div className="grid gap-8">
                    {plans.map((plan, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                            <div className={`w-16 h-16 ${plan.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                <plan.icon className={`w-8 h-8 ${plan.color}`} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.title}</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {plan.desc}
                                </p>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <div className="text-xs text-gray-400 uppercase font-bold mb-1">Current Implementation</div>
                                        <div className="text-gray-600 font-medium flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                            {plan.current}
                                        </div>
                                    </div>
                                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                        <div className="text-xs text-indigo-400 uppercase font-bold mb-1">Target State</div>
                                        <div className="text-indigo-900 font-bold flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                            {plan.future}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">See what we have now</h2>
                    <a href="/model-explain" className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-bold rounded-full transition-colors mr-4">
                        Current Model Logic
                    </a>
                    <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-colors">
                        Go to Dashboard <ArrowRight className="w-5 h-5" />
                    </a>
                </div>
            </main>
        </div>
    );
};

export default FuturePlanPage;
