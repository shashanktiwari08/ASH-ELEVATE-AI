import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Briefcase, 
    UserPlus, 
    CreditCard, 
    FileText, 
    Settings, 
    ChevronRight,
    LogOut,
    PlusCircle,
    BarChart3,
    Lock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ onClose }) => {
    const { user, logout } = useAuth();

    const allMenuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['admin', 'client', 'vendor', 'serviceboy'] },
        { name: 'Clients', icon: Users, path: '/clients', roles: ['admin'] },
        { name: 'Vendors', icon: Briefcase, path: '/vendors', roles: ['admin'] },
        { name: 'Staff', icon: UserPlus, path: '/staff', roles: ['admin'] },
        { name: 'Events', icon: PlusCircle, path: '/bookings', roles: ['admin'] },
        { name: 'Payments', icon: CreditCard, path: '/payments', roles: ['admin', 'client'] },
        { name: 'Invoices', icon: FileText, path: '/invoices', roles: ['admin'] },
        { name: 'Reports', icon: BarChart3, path: '/reports', roles: ['admin'] },
        { name: 'System Access', icon: Lock, path: '/system-access', roles: ['admin'] },
    ];

    const menuItems = allMenuItems.filter(item => 
        item.roles.includes(user?.role?.toLowerCase() || 'admin')
    );

    return (
        <aside className="h-full w-64 bg-slate-950 text-white flex flex-col border-r border-slate-800/50 shadow-2xl">
            {/* Header / Logo */}
            <div className="p-8 pb-10 flex items-center space-x-4">
                <img src="/logo.png" alt="ASH ELEVATE Logo" className="h-14 w-14 object-contain rounded-xl shadow-glow" />
                <div className="flex flex-col">
                    <span className="text-xl font-black font-sans tracking-tighter leading-none uppercase">ASH<span className="text-accent">ELEVATE AI</span></span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Tenant Dashboard</span>
                </div>
            </div>

            {/* Menu Sections */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em] px-4 mb-4 mt-2">Main Menu</p>
                {menuItems.map((item) => (
                    <NavLink 
                        key={item.name} 
                        to={item.path} 
                        onClick={onClose}
                        className={({ isActive }) => `
                            sidebar-link group relative
                            ${isActive ? 'sidebar-link-active' : ''}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} transition-colors mr-3`} />
                                <span className={isActive ? 'font-semibold' : 'font-medium'}>{item.name}</span>
                                {isActive && (
                                    <motion.div layoutId="active" className="ml-auto">
                                        <ChevronRight size={16} />
                                    </motion.div>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center space-x-3 mb-4 px-2">
                    <div className="h-9 w-9 rounded-full bg-slate-700/50 backdrop-blur-md flex items-center justify-center text-sm font-bold ring-1 ring-slate-600 ring-offset-2 ring-offset-slate-900 transition-all hover:ring-accent">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate capitalize text-slate-100">{user?.name || 'User'}</p>
                        <p className="text-xs text-slate-500 truncate lowercase">{user?.role || 'Administrator'}</p>
                    </div>
                </div>
                <button 
                    onClick={() => {
                        logout();
                        onClose && onClose();
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-all text-sm font-medium border border-transparent hover:border-red-500/20 active:scale-[0.98]"
                >
                    <LogOut size={16} className="text-red-400" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
