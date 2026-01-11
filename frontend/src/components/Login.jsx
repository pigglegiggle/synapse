import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { loginUser } from '../api';

const Login = ({ onLogin }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [username, setUsername] = useState('analyst@synapse.bank');
    const [password, setPassword] = useState('secure');

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const data = await loginUser(username, password);
            onLogin(data.token);
        } catch (err) {
            setError('Invalid credentials. Try analyst@synapse.bank / secure');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 text-2xl font-bold mb-2">
                        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        Synapse RiskOps
                    </div>
                    <p className="text-slate-400">Enterprise Financial Intelligence Platform</p>
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 opacity-90">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold">ISO-20022 Native</h3>
                                <p className="text-sm text-slate-400">Full schema validation & transparency</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 opacity-90">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Real-time Graph AI</h3>
                                <p className="text-sm text-slate-400">Detect mule networks in milliseconds</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-xs text-slate-500">
                    &copy; 2026 Synapse Financial Technologies. Authorized Personnel Only.
                </div>

                {/* Decorative Background Circles */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-2xl translate-y-1/4 -translate-x-1/4"></div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                        <p className="text-slate-500">Please authenticate to access the Risk Console.</p>
                        {error && (
                            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> {error}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Employee ID / Email</label>
                            <input
                                type="email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Security Token</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                />
                                <Lock className="absolute right-3 top-2.5 w-5 h-5 text-slate-400" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all transform active:scale-95"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    Access Console <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Demo Credentials</p>
                            <div className="flex justify-between text-xs text-slate-600">
                                <span>User: <code className="bg-white px-1 border rounded">analyst@synapse.bank</code></span>
                                <span>Pass: <code className="bg-white px-1 border rounded">secure</code></span>
                            </div>
                        </div>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
                        System Status: <span className="text-green-600 font-medium">Operational</span> • v2.4.0
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
