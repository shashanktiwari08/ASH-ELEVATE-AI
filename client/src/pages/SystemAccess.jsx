import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
    ShieldCheck, 
    Users, 
    Briefcase, 
    UserCheck, 
    Search, 
    KeyRound, 
    RotateCcw,
    ChevronDown,
    Filter,
    RefreshCw,
    UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';

const SystemAccess = () => {
    const { api } = useAuth();
    const [activeTab, setActiveTab] = useState('Client');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            switch (activeTab) {
                case 'Client': endpoint = '/clients'; break;
                case 'Vendor': endpoint = '/vendors'; break;
                case 'Staff': endpoint = '/staff'; break;
            }
            const res = await api.get(endpoint);
            setData(res.data);
        } catch (err) {
            toast.error(`Failed to load ${activeTab} data`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const filteredData = data.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serviceBoyId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const tabs = [
        { id: 'Client', label: 'Clients', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { id: 'Vendor', label: 'Vendors', icon: Briefcase, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        { id: 'Staff', label: 'Staff / Service boys', icon: UserCheck, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen font-inter text-slate-200">
            {/* Header section */}
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-accent/10 rounded-2xl">
                            <ShieldCheck className="text-accent" size={32} />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-white uppercase">
                            System <span className="text-accent">Access</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-bold tracking-widest text-xs uppercase ml-1">
                        Secure Login PIN & Access Control Management
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-accent transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-6 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm font-medium"
                        />
                    </div>
                </div>
            </header>

            {/* Tabs selection */}
            <div className="flex flex-wrap gap-4 mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-6 py-4 rounded-3xl font-black text-sm uppercase tracking-widest transition-all ${
                            activeTab === tab.id 
                            ? `${tab.bg} ${tab.color} ring-2 ring-current ring-offset-4 ring-offset-slate-950`
                            : 'bg-slate-900/50 text-slate-500 hover:text-slate-300 border border-slate-800'
                        }`}
                    >
                        <tab.icon size={20} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* List Section */}
            <div className="glass-dark rounded-[2.5rem] border border-slate-800/50 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800/50 bg-slate-900/30">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Name / ID</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Phone Number</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Login PIN</th>
                                {activeTab === 'Client' && (
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Repeat Count</th>
                                )}
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <RefreshCw className="animate-spin mx-auto text-accent mb-4" size={40} />
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading secure data...</p>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <Users className="mx-auto text-slate-800 mb-4" size={60} />
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No {activeTab}s found matching your search</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item, idx) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={item._id} 
                                        className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-all group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                                                    activeTab === 'Client' ? 'bg-blue-400/10 text-blue-400' : 
                                                    activeTab === 'Vendor' ? 'bg-amber-400/10 text-amber-400' : 'bg-indigo-400/10 text-indigo-400'
                                                }`}>
                                                    {item.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold group-hover:text-accent transition-colors">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                                                        {item.serviceBoyId || activeTab}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-mono text-sm text-slate-400">{item.phone}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-center">
                                                <div className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-3 group/pin cursor-pointer hover:border-accent transition-all shadow-inner">
                                                    <KeyRound size={14} className="text-accent" />
                                                    <span className="font-mono text-lg font-black tracking-[0.2em] text-white">
                                                        {item.pin || '----'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        {activeTab === 'Client' && (
                                            <td className="px-8 py-6 text-center">
                                                <div className="inline-flex flex-col items-center">
                                                    <span className="text-2xl font-black text-white">{item.repeatCount || 0}</span>
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Times Booked</span>
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                className="p-3 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all transform active:scale-95"
                                                title="Reset Access"
                                                onClick={() => toast.success('Password update feature coming soon!')}
                                            >
                                                <RotateCcw size={18} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <footer className="mt-8 flex items-center gap-2 text-slate-500 px-4">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Administrator access only • All PINs are unique and auto-generated on registration</span>
            </footer>
        </div>
    );
};

export default SystemAccess;
