import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, 
    Phone, 
    Mail, 
    MapPin, 
    Calendar, 
    CreditCard, 
    Briefcase,
    TrendingUp,
    Clock,
    DollarSign,
    CheckCircle2,
    Search,
    Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const StaffDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { api } = useAuth();
    const [staff, setStaff] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [staffRes, historyRes] = await Promise.all([
                    api.get(`/staff/${id}`),
                    api.get(`/staff/${id}/history`)
                ]);
                setStaff(staffRes.data);
                setHistory(historyRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-12 text-center font-black animate-pulse">Loading Service Boy Profile...</div>;
    if (!staff) return <div className="p-12 text-center">Service boy not found.</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header / Back */}
            <div className="flex items-center space-x-6">
                <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{staff.name} <span className="text-slate-400 font-medium ml-2 text-xl">#{staff.serviceBoyId}</span></h1>
                    <div className="flex items-center space-x-4 mt-1 text-sm font-bold text-slate-500 uppercase tracking-widest">
                        <span className="text-accent underline decoration-2">{staff.skillCategory}</span>
                        <span className="h-4 w-px bg-slate-200"></span>
                        <span className="text-emerald-500">{staff.status}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            <Briefcase size={120} />
                        </div>
                        <div className="h-24 w-24 rounded-3xl bg-accent/10 text-accent flex items-center justify-center font-black text-4xl mb-8 group-hover:scale-105 transition-transform">
                            {staff.name.charAt(0)}
                        </div>
                        
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4 text-slate-600">
                                <Phone size={18} className="text-slate-400" />
                                <span className="font-bold">{staff.phone}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-slate-600">
                                <Mail size={18} className="text-slate-400" />
                                <span className="font-bold">{staff.email || 'No email provided'}</span>
                            </div>
                            <div className="flex items-start space-x-4 text-slate-600">
                                <MapPin size={18} className="text-slate-400 mt-1" />
                                <span className="font-medium">{staff.address}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-slate-600">
                                <CreditCard size={18} className="text-slate-400" />
                                <span className="text-xs font-black uppercase tracking-widest">ID: {staff.idProofDetails || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="mt-10 pt-10 border-t border-slate-50">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">Rate Configuration</p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-900">{staff.rateType}</span>
                                <span className="text-lg font-black text-accent">₹{staff.baseRate}</span>
                            </div>
                            {staff.overtimeRate > 0 && (
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs font-medium text-slate-500">Overtime Rate</span>
                                    <span className="text-sm font-bold text-slate-700">₹{staff.overtimeRate}/hr</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Statistics and History */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <StatItem label="Days Worked" value={staff.totalDaysWorked} icon={Calendar} color="bg-indigo-50 text-indigo-600" />
                        <StatItem label="Total Earned" value={`₹${staff.totalEarnings}`} icon={DollarSign} color="bg-emerald-50 text-emerald-600" />
                        <StatItem label="Advance" value={`₹${staff.advancePaid}`} icon={TrendingUp} color="bg-amber-50 text-amber-600" />
                        <StatItem label="Pending" value={`₹${staff.pendingBalance}`} icon={Clock} color="bg-rose-50 text-rose-600" />
                    </div>

                    {/* Duty History */}
                    <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 flex flex-col">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Assignment History</h2>
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" placeholder="Search events..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none" />
                                </div>
                                <button className="p-2 bg-slate-900 text-white rounded-xl hover:shadow-lg transition-all"><Download size={18} /></button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    <tr>
                                        <th className="px-8 py-5">Date / Event</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5 text-right">Rate</th>
                                        <th className="px-8 py-5 text-right">Overtime</th>
                                        <th className="px-8 py-5 text-right font-black text-slate-900">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((duty, i) => (
                                        <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-black text-slate-900">{format(new Date(duty.date), 'dd MMM yyyy')}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">{duty.eventName || duty.booking?.title || 'General Duty'}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                    duty.attendanceStatus === 'present' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                                }`}>
                                                    {duty.attendanceStatus}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right font-bold text-slate-700">₹{duty.rateApplied}</td>
                                            <td className="px-8 py-6 text-right font-bold text-slate-700">₹{duty.overtimeAmount}</td>
                                            <td className="px-8 py-6 text-right font-black text-slate-900 font-mono tracking-tighter">₹{duty.totalAmount}</td>
                                        </tr>
                                    ))}
                                    {history.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-medium italic">No duty assignments recorded yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatItem = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div className={`p-4 rounded-2xl w-fit ${color} mb-4`}>
            <Icon size={24} />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-900 tracking-tighter mt-1">{value}</p>
    </div>
);

export default StaffDetails;
