import React from 'react';
import { Activity, Shield, Database, Settings, User, LogOut, Brain, Sparkles } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const Layout = ({ onLogout }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate('/login');
    };

    return (
        <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
            {/* Enterprise Top Bar */}
            <header className="bg-slate-900 text-white shadow-lg shrink-0 z-50">
                <div className="px-6 h-16 flex items-center justify-between">
                    {/* Logo Area */}
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            <img src="/synapse.svg" alt="Synapse Logo" className="w-10 h-10 hover:scale-105 transition-transform" />
                            <div>
                                <h1 className="font-bold text-lg tracking-tight leading-none">Synapse</h1>
                                <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Risk Intelligence Platform</p>
                            </div>
                        </div>

                        {/* Main Navigation */}
                        <nav className="flex items-center gap-1 ml-4">
                            <NavLink
                                to="/"
                                className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isActive ? 'bg-slate-800 text-white ring-1 ring-white/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                            >
                                <Shield className="w-4 h-4" /> Risk Center
                            </NavLink>
                            <NavLink
                                to="/transactions"
                                className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isActive ? 'bg-slate-800 text-white ring-1 ring-white/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                            >
                                <Database className="w-4 h-4" /> Transactions
                            </NavLink>
                            <NavLink
                                to="/model-explain"
                                className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isActive ? 'bg-slate-800 text-white ring-1 ring-white/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                            >
                                <Brain className="w-4 h-4" /> How AI Works
                            </NavLink>
                            <NavLink
                                to="/future-plan"
                                className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isActive ? 'bg-slate-800 text-white ring-1 ring-white/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                            >
                                <Sparkles className="w-4 h-4" /> Future Plan
                            </NavLink>
                            <NavLink
                                to="/policies"
                                className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isActive ? 'bg-slate-800 text-white ring-1 ring-white/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                            >
                                <Settings className="w-4 h-4" /> Policy Engine
                            </NavLink>
                        </nav>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        {/* <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-medium text-green-400">System Active</span>
                        </div> */}

                        <div className="h-6 w-px bg-slate-700 mx-2"></div>

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-medium text-white">Analyst Demo</div>
                                <div className="text-xs text-slate-400">Risk Analyst</div>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                                <User className="w-4 h-4 text-slate-300" />
                            </div>
                            <button onClick={handleLogout} className="text-slate-500 hover:text-white transition-colors">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden flex flex-col bg-slate-50">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
