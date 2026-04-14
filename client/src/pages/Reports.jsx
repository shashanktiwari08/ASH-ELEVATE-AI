import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Download, Calendar as CalendarIcon, User, 
    TrendingUp, Clock, ArrowUpRight, FileText, 
    CreditCard as CreditCardIcon, Briefcase
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import toast from 'react-hot-toast';

const Reports = () => {
    const { api } = useAuth();
    const [stats, setStats] = useState({ totalPending: 0, totalAdvance: 0, activeWorkers: 0 });
    const [dateRange, setDateRange] = useState({
        start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/staff/stats/summary');
                setStats(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [api]);

    const downloadPDF = () => {
        const baseUrl = api.defaults.baseURL.replace('/api', '');
        const url = `${baseUrl}/api/staff/report/pdf?startDate=${dateRange.start}&endDate=${dateRange.end}`;
        window.open(url, '_blank');
        toast.success('Generating Duty Report...');
    };

    const comingSoon = (title) => {
        toast.success(`${title} generation initiated... (Module Alpha)`);
    };

    const reportCards = [
        { 
            title: "Staff Work Audit", 
            desc: "Daily activities, hours and assignments by date range.",
            icon: CalendarIcon, 
            color: "text-indigo-600", 
            bg: "bg-indigo-50",
            action: downloadPDF
        },
        { 
            title: "Personnel Payouts", 
            desc: "Total earnings, paid vs pending per worker for the month.",
            icon: User, 
            color: "text-emerald-600", 
            bg: "bg-emerald-50",
            action: () => comingSoon("Payout Report") 
        },
        { 
            title: "Client Billing Summary", 
            desc: "Requirement vs allocation revenue analysis per booking.",
            icon: TrendingUp, 
            color: "text-accent", 
            bg: "bg-accent/10",
            action: () => comingSoon("Billing Analysis") 
        },
        { 
            title: "Pending Dues Log", 
            desc: "Unpaid vendor bills and accumulated balances status.",
            icon: Clock, 
            color: "text-rose-600", 
            bg: "bg-rose-50",
            action: () => comingSoon("Dues Report") 
        }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-6 md:space-y-0 bg-white p-10 rounded-[3rem] shadow-premium border border-slate-100">
                <div>
                   <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Intelligence <span className="text-accent underline decoration-indigo-200">Suite</span></h1>
                   <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs opacity-60">Generate financial and operational insights.</p>
                </div>
                <div className="flex items-center space-x-4 bg-slate-50/80 p-3 rounded-[2rem] border border-slate-100 backdrop-blur-md">
                    <div className="px-6 py-2 border-r border-slate-200">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 text-right">Start Date</p>
                        <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="bg-transparent border-none outline-none font-black text-xs text-slate-900" />
                    </div>
                    <div className="px-6 py-2">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">End Date</p>
                        <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="bg-transparent border-none outline-none font-black text-xs text-slate-900" />
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard label="Pending Wages" value={`₹${stats.totalPending?.toLocaleString()}`} icon={Clock} color="text-rose-600" bg="bg-rose-50" />
                <StatCard label="Advance Paid" value={`₹${stats.totalAdvance?.toLocaleString()}`} icon={CreditCardIcon} color="text-indigo-600" bg="bg-indigo-50" />
                <StatCard label="Active strength" value={stats.activeWorkers} icon={Briefcase} color="text-emerald-600" bg="bg-emerald-50" />
            </div>

            {/* Report Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {reportCards.map((report, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-premium hover:-translate-y-2 transition-all flex items-start space-x-10 relative overflow-hidden"
                    >
                        <div className={`p-8 rounded-[2rem] ${report.bg} ${report.color} group-hover:scale-110 transition-transform shadow-sm`}>
                            <report.icon size={36} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-tighter">{report.title}</h3>
                            <p className="text-sm text-slate-500 font-medium mt-4 leading-relaxed">{report.desc}</p>
                            <button 
                                onClick={report.action}
                                className="mt-10 flex items-center space-x-3 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all active:scale-95 text-[10px] uppercase tracking-[0.2em] shadow-lg"
                            >
                                <Download size={16} />
                                <span>Generate PDF</span>
                            </button>
                        </div>
                        <div className="absolute top-8 right-8 p-2 opacity-5 group-hover:opacity-100 transition-opacity">
                            <ArrowUpRight size={24} className="text-slate-400 group-hover:text-accent" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Support section */}
            <div className="bg-slate-900 p-16 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between border-[8px] border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-20 bg-accent/10 blur-[120px] rounded-full group-hover:bg-accent/20 transition-all duration-1000"></div>
                <div className="relative z-10 max-w-lg">
                    <h2 className="text-4xl font-black tracking-tighter leading-tight uppercase">Need custom exports?</h2>
                    <p className="text-slate-400 font-medium mt-4 text-lg">Our data science team can build specialized Excel/CSV formats for your chartered accountant.</p>
                </div>
                <button className="relative z-10 mt-12 md:mt-0 px-12 py-6 bg-accent hover:bg-indigo-600 text-white font-black rounded-[2.5rem] shadow-glow transition-all active:scale-95 uppercase tracking-[0.2em] text-[10px]">
                    Talk to Analytics
                </button>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex items-center space-x-8 group hover:border-indigo-100 transition-all">
        <div className={`p-6 rounded-[1.5rem] ${bg} ${color} group-hover:scale-110 transition-transform shadow-sm`}>
            <Icon size={30} />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{value || '0'}</p>
        </div>
    </div>
);

export default Reports;
