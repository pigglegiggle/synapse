import React from 'react';
import { LayoutDashboard, Activity, FileText, Settings, Database, LogOut, Brain, Sparkles } from 'lucide-react';

const Sidebar = ({ activeTab, onTabChange }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'model-explain', label: 'How ML Works', icon: Brain },
        { id: 'future-plan', label: 'Future Plan', icon: Sparkles },
        { id: 'data', label: 'Sources', icon: Database },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
            {/* Navigation */}
            <nav className="flex-1 p-3 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${isActive
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200">
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <div className="text-xs text-gray-500 font-medium mb-1">System Status</div>
                    <div className="flex items-center gap-2 text-xs text-green-600">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        <span className="font-medium">Operational</span>
                    </div>
                </div>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
