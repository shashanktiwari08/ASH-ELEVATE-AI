import React from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Wallet } from 'lucide-react';

const TopNav = () => {
    const { isGstEntity, toggleEntity } = useCompany();
    const { user } = useAuth();

    return (
        <div className="w-full h-16 glass rounded-2xl mb-6 flex items-center justify-between px-6 shadow-sm border-slate-200">
            
            {/* Left: Dual Entity Switcher */}
            <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider hidden sm:block">
                    Active Ledger:
                </span>
                
                <button 
                    onClick={toggleEntity}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 font-bold ${
                        isGstEntity 
                            ? 'bg-blue-50 text-blue-700 border-2 border-blue-200 hover:bg-blue-100' 
                            : 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200 hover:bg-emerald-100'
                    }`}
                >
                    {isGstEntity ? <Building2 size={18} /> : <Wallet size={18} />}
                    <span>{isGstEntity ? 'Premium Catering (GST)' : 'Cash Ledger (Non-GST)'}</span>
                </button>
            </div>

            {/* Right: User Profile */}
            <div className="flex items-center space-x-3">
                <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-slate-800">{user?.name || 'Investor'}</p>
                    <p className="text-xs text-slate-500 capitalize">{user?.role || 'Admin'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-accent/10 border-2 border-accent text-accent flex items-center justify-center font-bold shadow-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'I'}
                </div>
            </div>
            
        </div>
    );
};

export default TopNav;
