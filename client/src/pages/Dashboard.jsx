import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    IndianRupee, TrendingUp, TrendingDown, Users, Calendar, 
    ArrowUpRight, Search, Bell, History, FileText, Briefcase
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

const data = [
    { name: 'Jan', revenue: 4000, expenses: 2400 },
    { name: 'Feb', revenue: 3000, expenses: 1398 },
    { name: 'Mar', revenue: 2000, expenses: 9800 },
    { name: 'Apr', revenue: 2780, expenses: 3908 },
    { name: 'May', revenue: 1890, expenses: 4800 },
    { name: 'Jun', revenue: 2390, expenses: 3800 },
    { name: 'Jul', revenue: 3490, expenses: 4300 },
];

const StatCard = ({ title, value, change, icon: Icon, isPositive, index }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white p-6 rounded-[2.5rem] shadow-premium hover:shadow-glow/10 transition-all border border-slate-100 group"
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`p-4 rounded-2xl transition-colors ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                <Icon size={24} />
            </div>
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{change}%</span>
            </div>
        </div>
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">
            {typeof value === 'number' && title.toLowerCase().includes('₹') ? `₹${value.toLocaleString()}` : value}
        </h3>
    </motion.div>
);

const Dashboard = () => {
    const { user, api } = useAuth();
    const [stats, setStats] = useState({ revenue: 0, expenses: 0, profit: 0 });
    const [counts, setCounts] = useState({ clients: 0, bookings: 0, staff: 0 });
    const [recentPayments, setRecentPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [payRes, clientsRes, bookingsRes, staffRes, recentPayRes] = await Promise.all([
                    api.get('/payments/summary'),
                    api.get('/clients'),
                    api.get('/bookings'),
                    api.get('/staff'),
                    api.get('/payments?limit=5')
                ]);
                setStats(payRes.data);
                setCounts({
                    clients: clientsRes.data.length,
                    bookings: bookingsRes.data.length,
                    staff: staffRes.data.length
                });
                setRecentPayments(recentPayRes.data.slice(0, 5));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [api]);

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-20 bg-accent/20 blur-[100px] rounded-full group-hover:bg-accent/30 transition-all duration-700"></div>
                <div className="relative z-10">
                   <h1 className="text-3xl font-black text-white tracking-tight">Welcome back, <span className="text-accent">{user?.name}</span> 👋</h1>
                   <p className="text-slate-400 font-medium mt-1">Here's a quick overview of your business performance today.</p>
                </div>
                <div className="relative z-10 flex items-center space-x-4 mt-6 sm:mt-0">
                    <div className="hidden md:flex items-center bg-white/10 border border-white/10 rounded-2xl px-4 py-2 w-72 focus-within:ring-2 focus-within:ring-accent/40 transition-all backdrop-blur-md">
                        <Search size={18} className="text-slate-400 mr-2" />
                        <input type="text" placeholder="Global search..." className="bg-transparent border-none outline-none text-sm w-full font-medium text-white placeholder:text-slate-500" />
                    </div>
                    <button className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-[1.5rem] transition-all relative backdrop-blur-md border border-white/10">
                        <Bell size={20} />
                        <span className="absolute top-4 right-4 h-2 w-2 bg-rose-500 rounded-full border-2 border-slate-900"></span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard title="Total Revenue" value={`₹${stats.revenue?.toLocaleString() || 0}`} change="12" icon={IndianRupee} isPositive={true} index={0} />
                <StatCard title="Total Expenses" value={`₹${stats.expenses?.toLocaleString() || 0}`} change="3.2" icon={TrendingDown} isPositive={false} index={1} />
                <StatCard title="Profit Margin" value={`₹${stats.profit?.toLocaleString() || 0}`} change="18" icon={TrendingUp} isPositive={true} index={2} />
                <StatCard title="Active Clients" value={counts.clients} change="5.4" icon={Users} isPositive={true} index={3} />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-premium border border-slate-100"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                           <h2 className="text-2xl font-black text-slate-900 tracking-tight">Growth Analytics</h2>
                           <p className="text-sm text-slate-500 font-medium">Visualizing your monthly revenue stream.</p>
                        </div>
                        <select className="bg-slate-50 border border-slate-200 text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-[1.25rem] outline-none hover:bg-slate-100 transition-all">
                            <option>This Month</option>
                            <option>Last 30 Days</option>
                            <option>Current Year</option>
                        </select>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4B677" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#D4B677" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={15} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} tickFormatter={(v) => `₹${v}`} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#0f172a', 
                                        borderRadius: '24px', 
                                        border: 'none', 
                                        color: '#fff',
                                        padding: '16px',
                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
                                    }} 
                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#D4B677" strokeWidth={5} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Right Panel: Recent activity */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-10 rounded-[3rem] shadow-premium border border-slate-100 flex flex-col"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Live Feed</h2>
                        <History size={20} className="text-slate-300" />
                    </div>
                    
                    <div className="space-y-8 flex-1">
                        {recentPayments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-30 text-center">
                                <History size={48} className="mb-4" />
                                <p className="font-bold uppercase tracking-widest text-[10px]">No recent activity</p>
                            </div>
                        ) : recentPayments.map((pay, i) => (
                            <div key={pay._id} className="group relative flex items-start space-x-4">
                                <div className={`mt-1 h-3 w-3 rounded-full ring-4 ring-white ${pay.type === 'incoming' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                <div className="flex-1 border-b border-slate-50 pb-4 last:border-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-black text-slate-900 group-hover:text-accent transition-colors capitalize">{pay.note || 'Recorded Payment'}</p>
                                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider bg-slate-50 px-2 py-0.5 rounded-md">{format(new Date(pay.date || Date.now()), 'HH:mm')}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{pay.partyType} • {pay.method}</p>
                                         <p className={`text-xs font-black ${pay.type === 'incoming' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {pay.type === 'incoming' ? '+' : '-'}₹{pay.amount?.toLocaleString()}
                                         </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                         <div className="bg-slate-50 p-4 rounded-2xl">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bookings</p>
                             <div className="flex items-center space-x-2 mt-1">
                                 <Briefcase size={14} className="text-slate-900" />
                                 <span className="font-black text-slate-900">{counts.bookings}</span>
                             </div>
                         </div>
                         <div className="bg-slate-50 p-4 rounded-2xl">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoices</p>
                             <div className="flex items-center space-x-2 mt-1">
                                 <FileText size={14} className="text-slate-900" />
                                 <span className="font-black text-slate-900">{counts.bookings}</span>
                             </div>
                         </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
