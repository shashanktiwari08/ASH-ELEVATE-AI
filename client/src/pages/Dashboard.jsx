import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    IndianRupee, TrendingUp, TrendingDown, Users, Calendar, 
    ArrowUpRight, Search, Bell, History, FileText, Briefcase, Camera, 
    CheckCircle2, MapPin, Clock, UploadCloud, Phone, Check, ShieldCheck, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';

const data = [
    { name: 'Jan', revenue: 4000, expenses: 2400 },
    { name: 'Feb', revenue: 3000, expenses: 1398 },
    { name: 'Mar', revenue: 2000, expenses: 9800 },
    { name: 'Apr', revenue: 2780, expenses: 3908 },
    { name: 'May', revenue: 1890, expenses: 4800 },
    { name: 'Jun', revenue: 2390, expenses: 3800 },
    { name: 'Jul', revenue: 3490, expenses: 4300 },
];

const StatCard = ({ title, value, change, icon: Icon, isPositive, index, colorClass = "bg-emerald-50 text-emerald-600" }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white p-6 rounded-[2.5rem] shadow-premium hover:shadow-glow/10 transition-all border border-slate-100 group"
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`p-4 rounded-2xl transition-colors ${colorClass}`}>
                <Icon size={24} />
            </div>
            {change && (
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{change}%</span>
                </div>
            )}
        </div>
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">
            {typeof value === 'number' && (title.includes('₹') || title.includes('Bill') || title.includes('Paid') || title.includes('Balance')) ? `₹${value.toLocaleString()}` : value}
        </h3>
    </motion.div>
);

const Dashboard = () => {
    const { user, api } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ revenue: 0, expenses: 0, profit: 0 });
    const [counts, setCounts] = useState({ clients: 0, bookings: 0, staff: 0 });
    const [pendingVerifications, setPendingVerifications] = useState(0);
    const [recentPayments, setRecentPayments] = useState([]);
    
    // Service Boy Data
    const [myDuties, setMyDuties] = useState([]);
    
    // Client Data
    const [myBookings, setMyBookings] = useState([]);
    const [assignedStaff, setAssignedStaff] = useState([]);
    const [activeDutyCheckins, setActiveDutyCheckins] = useState([]);

    const [loading, setLoading] = useState(true);
    
    // Modals
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedDutyForUpload, setSelectedDutyForUpload] = useState(null);
    
    // Form States
    const [photoUrl, setPhotoUrl] = useState('');
    const [paymentForm, setPaymentForm] = useState({
        bookingId: '',
        amount: '',
        method: 'upi',
        screenshot: '',
        note: ''
    });

    const isAdmin = user?.role === 'admin' || user?.role === 'manager';
    const isServiceBoy = user?.role === 'serviceboy';
    const isClient = user?.role === 'client';

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (isAdmin) {
                    const [payRes, clientsRes, bookingsRes, staffRes, recentPayRes, staffStatsRes] = await Promise.all([
                        api.get('/payments/summary'),
                        api.get('/clients'),
                        api.get('/bookings'),
                        api.get('/staff'),
                        api.get('/payments?limit=5'),
                        api.get('/staff/stats/summary')
                    ]);
                    setStats(payRes.data);
                    setCounts({
                        clients: clientsRes.data.length,
                        bookings: bookingsRes.data.length,
                        staff: staffRes.data.length
                    });
                    setRecentPayments(recentPayRes.data.slice(0, 5));
                    setPendingVerifications(staffStatsRes.data.pendingVerifications || 0);
                } else if (isServiceBoy) {
                    const dutiesRes = await api.get('/staff/my-duties');
                    setMyDuties(dutiesRes.data);
                } else if (isClient) {
                    const [bookingsRes, dutiesRes] = await Promise.all([
                        api.get('/bookings/client/my-bookings'),
                        api.get('/staff/my-duties') // This route needs to be client-aware or I should use report route
                    ]);
                    // Actually, client needs to see duties assigned to THEIR bookings
                    // I will filter duties by booking client
                    setMyBookings(bookingsRes.data);
                    
                    // Fetch duties for client's bookings
                    const clientDutiesRes = await api.get('/staff/report');
                    setActiveDutyCheckins(clientDutiesRes.data.filter(d => d.booking?.client === user?._id || d.booking?.client?._id === user?._id));

                    // Extract all assigned staff from bookings
                    const allStaff = [];
                    bookingsRes.data.forEach(b => {
                        b.services?.forEach(s => {
                            s.staffAssigned?.forEach(staff => {
                                if (!allStaff.find(st => st._id === staff._id)) {
                                    allStaff.push(staff);
                                }
                            });
                        });
                    });
                    setAssignedStaff(allStaff);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [api, isAdmin, isServiceBoy, isClient, user?._id]);

    const handleUploadProof = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/staff/duty/${selectedDutyForUpload._id}/upload-proof`, { photoUrl });
            toast.success('Check-in proof sent!');
            setIsUploadModalOpen(false);
            setPhotoUrl('');
            if (isServiceBoy) {
                const dutiesRes = await api.get('/staff/my-duties');
                setMyDuties(dutiesRes.data);
            }
        } catch (err) {
            toast.error('Failed to upload proof');
        }
    };

    const handleClientVerify = async (dutyId) => {
        try {
            await api.patch(`/staff/duty/${dutyId}/client-verify`);
            toast.success('Thank you! Worker attendance verified.');
            // Refresh
            const clientDutiesRes = await api.get('/staff/report');
            setActiveDutyCheckins(clientDutiesRes.data.filter(d => d.booking?.client === user?._id || d.booking?.client?._id === user?._id));
        } catch (err) {
            toast.error('Failed to verify');
        }
    };

    const handleReportPayment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/bookings/client/report-payment', paymentForm);
            toast.success('Payment reported! Admin will verify your screenshot.');
            setIsPaymentModalOpen(false);
            // Refresh bookings to show updated pending state if we had one
        } catch (err) {
            toast.error('Failed to report payment');
        }
    };

    if (isClient) {
        const primaryBooking = myBookings[0];
        return (
            <div className="max-w-7xl mx-auto space-y-10 pb-12 text-slate-900">
                {/* Client Header */}
                <div className="bg-indigo-600 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 p-32 bg-white/10 blur-[100px] rounded-full"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight leading-none uppercase tracking-tighter italic">Your Event <span className="text-white/60">Portal</span></h1>
                            <p className="text-indigo-100 font-bold mt-2 uppercase tracking-widest text-xs opacity-80">Managing your {primaryBooking?.title || 'Upcoming Event'}</p>
                        </div>
                        <button 
                            onClick={() => {
                                setPaymentForm({...paymentForm, bookingId: primaryBooking?._id});
                                setIsPaymentModalOpen(true);
                            }}
                            className="px-10 py-5 bg-white text-indigo-600 font-black rounded-3xl uppercase text-xs tracking-widest shadow-xl hover:bg-slate-50 transition-all active:scale-95 flex items-center"
                        >
                            <IndianRupee size={20} className="mr-3" />
                            Report New Payment
                        </button>
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatCard title="Total Event Contract" value={primaryBooking?.totalAmount || 0} icon={FileText} index={0} colorClass="bg-slate-900 text-white" />
                    <StatCard title="Advance Paid" value={primaryBooking?.amountPaid || 0} icon={TrendingUp} index={1} colorClass="bg-emerald-50 text-emerald-600" />
                    <StatCard title="Balance Remaining" value={(primaryBooking?.totalAmount || 0) - (primaryBooking?.amountPaid || 0)} icon={IndianRupee} index={2} colorClass="bg-rose-50 text-rose-600" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Active On-Site Staff */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Live Team Tracking</h2>
                            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">Active Staff On-Site</span>
                        </div>

                        {activeDutyCheckins.length === 0 ? (
                            <div className="bg-white p-20 rounded-[3rem] border border-slate-100 shadow-premium flex flex-col items-center justify-center text-center opacity-40">
                                <Users size={60} className="mb-4 text-slate-300" />
                                <p className="font-black uppercase tracking-widest text-xs">No check-ins yet</p>
                                <p className="text-xs font-medium text-slate-500 mt-2 italic">Staff members will appear here once they reach the venue.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {activeDutyCheckins.map((duty) => (
                                    <div key={duty._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-premium group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black">
                                                    {duty.staff?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Boy</p>
                                                    <h4 className="font-black text-slate-900 uppercase tracking-tighter">{duty.staff?.name}</h4>
                                                </div>
                                            </div>
                                            <a href={`tel:${duty.staff?.phone}`} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all">
                                                <Phone size={18} />
                                            </a>
                                        </div>
                                        
                                        {duty.venuePhotoProof ? (
                                            <div className="relative h-48 rounded-3xl overflow-hidden mb-4 border border-slate-100">
                                                <img src={duty.venuePhotoProof} className="w-full h-full object-cover" alt="Venue Checkin" />
                                                <div className="absolute top-4 left-4 flex space-x-2">
                                                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm flex items-center">
                                                        <Clock size={10} className="mr-1 text-indigo-600"/> {duty.reportingTime || 'Checked in'}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-48 rounded-3xl bg-slate-50 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200 mb-4 opacity-50">
                                                <Camera size={30} className="text-slate-300 mb-2" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Waiting for Photo</p>
                                            </div>
                                        )}

                                        {duty.clientVerified ? (
                                            <div className="w-full flex items-center justify-center py-3 bg-emerald-50 text-emerald-600 font-black rounded-2xl text-[10px] uppercase tracking-widest">
                                                <ShieldCheck size={16} className="mr-2" />
                                                You Verified Presence
                                            </div>
                                        ) : duty.venuePhotoProof ? (
                                            <button 
                                                onClick={() => handleClientVerify(duty._id)}
                                                className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                                            >
                                                Confirm Presence
                                            </button>
                                        ) : (
                                            <div className="w-full py-3 bg-slate-50 text-slate-400 font-bold rounded-2xl text-[10px] uppercase tracking-widest text-center">
                                                Waiting for on-site check-in
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Venue Managers & Event Details */}
                    <div className="space-y-8">
                       <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                           <ShieldCheck size={80} className="absolute -bottom-8 -right-8 text-white/10" />
                           <h3 className="text-xl font-black uppercase tracking-tighter mb-6 underline decoration-white/20">Assigned Team</h3>
                           
                           <div className="space-y-6 relative z-10">
                               {assignedStaff.length === 0 ? (
                                   <p className="text-[10px] uppercase font-bold text-white/30 italic">No staff assigned yet</p>
                               ) : assignedStaff.map((staff, i) => (
                                   <div key={i} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
                                       <div>
                                           <p className="text-sm font-black tracking-tight">{staff.name}</p>
                                           <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">Service Boy • {staff.serviceBoyId}</p>
                                       </div>
                                       <a href={`tel:${staff.phone}`} className="p-3 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-xl transition-all">
                                           <Phone size={16} />
                                       </a>
                                   </div>
                               ))}
                               
                               {/* Mock Managers if none assigned */}
                               <div className="pt-4 border-t border-white/10 mt-4">
                                   <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Venue Managers</p>
                                   <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10 opacity-60">
                                       <div>
                                           <p className="text-sm font-black tracking-tight">On-Site Supervisor</p>
                                           <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">Contact for venue issues</p>
                                       </div>
                                       <button className="p-3 bg-white/10 rounded-xl"><Phone size={16} /></button>
                                   </div>
                               </div>
                           </div>
                       </div>

                       <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-premium">
                            <h3 className="text-lg font-black uppercase tracking-tighter mb-6">Payment Timeline</h3>
                            <div className="space-y-6">
                                {primaryBooking?.amountPaid > 0 && (
                                    <div className="flex items-start space-x-4">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2 ring-4 ring-emerald-50"></div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 italic">Advance Received</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">₹{primaryBooking.amountPaid} • Processed</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-start space-x-4">
                                    <div className="h-2 w-2 rounded-full bg-indigo-500 mt-2 ring-4 ring-indigo-50 animate-pulse"></div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 italic">Pending Balance</p>
                                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">₹{(primaryBooking?.totalAmount || 0) - (primaryBooking?.amountPaid || 0)} • Due shortly</p>
                                    </div>
                                </div>
                            </div>
                       </div>
                    </div>
                </div>

                {/* Report Payment Modal */}
                <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Record Your Payment">
                    <form onSubmit={handleReportPayment} className="space-y-6 p-2">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Amount Paid (₹)</label>
                                <input 
                                    required
                                    type="number" 
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-emerald-600"
                                    value={paymentForm.amount}
                                    onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Payment Method</label>
                                <select 
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold"
                                    value={paymentForm.method}
                                    onChange={e => setPaymentForm({...paymentForm, method: e.target.value})}
                                >
                                    <option value="upi">UPI / GPay / PhonePe</option>
                                    <option value="online_banking">Net Banking</option>
                                    <option value="cheque">Cheque</option>
                                    <option value="cash">Cash Handover</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Upload Receipt / Screenshot</label>
                            <div className="relative group overflow-hidden border-2 border-dashed border-slate-200 rounded-3xl p-10 bg-slate-50 flex flex-col items-center justify-center hover:bg-slate-100 transition-all cursor-pointer">
                                <input 
                                    type="text" 
                                    placeholder="Paste Screenshot Link..." 
                                    className="w-full mt-4 p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold font-sans"
                                    value={paymentForm.screenshot}
                                    onChange={e => setPaymentForm({...paymentForm, screenshot: e.target.value})}
                                />
                                <div className="mt-4 flex items-center space-x-2 text-slate-400">
                                    <UploadCloud size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Verification Image Link</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Notes (Optional)</label>
                            <textarea 
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs" 
                                placeholder="Any transaction reference id..."
                                value={paymentForm.note}
                                onChange={e => setPaymentForm({...paymentForm, note: e.target.value})}
                            ></textarea>
                        </div>

                        <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                            Submit for Verification
                        </button>
                    </form>
                </Modal>
            </div>
        );
    }

    // Role: Service Boy View
    if (isServiceBoy) {
        return (
            <div className="max-w-7xl mx-auto space-y-10 pb-12">
                <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group text-white">
                    <div className="absolute top-0 right-0 p-20 bg-indigo-500/20 blur-[100px] rounded-full"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl font-black tracking-tight underline decoration-indigo-400">Worker <span className="text-indigo-400">Dashboard</span></h1>
                        <p className="text-slate-400 font-medium mt-1 uppercase tracking-widest text-[10px]">Welcome, {user?.name} ({user?.serviceBoyId})</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-slate-900">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                           <h2 className="text-xl font-black uppercase tracking-tighter">Assigned Duties</h2>
                           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">Today: {format(new Date(), 'dd MMM yyyy')}</div>
                        </div>

                        {myDuties.length === 0 ? (
                            <div className="bg-white p-20 rounded-[3rem] border border-slate-100 shadow-premium flex flex-col items-center justify-center text-center opacity-40">
                                <Calendar size={60} className="mb-4 text-slate-300" />
                                <p className="font-black uppercase tracking-widest text-xs">No assignments found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myDuties.map((duty, idx) => (
                                    <motion.div 
                                        key={duty._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-premium group"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-start space-x-5">
                                                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                                                    <Briefcase size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black tracking-tight uppercase tracking-tighter">{duty.eventName || duty.booking?.title}</h3>
                                                    <div className="flex items-center text-slate-500 text-xs font-bold mt-1 space-x-4">
                                                        <span className="flex items-center"><MapPin size={14} className="mr-1 text-indigo-400"/> {duty.location}</span>
                                                        <span className="flex items-center"><Clock size={14} className="mr-1 text-indigo-400"/> {duty.reportingTime}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-3">
                                                {duty.verificationStatus === 'verified' ? (
                                                    <div className="flex flex-col items-end text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-xl">
                                                        <ShieldCheck size={16} className="mr-2" />
                                                        Verified by All
                                                    </div>
                                                ) : duty.venuePhotoProof ? (
                                                    <div className="flex flex-col items-end">
                                                        <div className="flex space-x-2">
                                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${duty.adminVerified ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>Admin</span>
                                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${duty.clientVerified ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>Client</span>
                                                        </div>
                                                        <p className="text-[9px] font-bold text-slate-400 mt-2 bg-slate-50 px-2 py-1 rounded-md">Pending full verification</p>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => { setSelectedDutyForUpload(duty); setIsUploadModalOpen(true); }}
                                                        className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl uppercase text-xs tracking-widest shadow-lg hover:bg-black transition-all flex items-center"
                                                    >
                                                        <Camera size={18} className="mr-3" />
                                                        Check In
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-premium">
                            <h2 className="text-lg font-black uppercase tracking-tighter mb-6">Your Earnings</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl text-emerald-600">
                                    <p className="text-[10px] font-black uppercase tracking-widest">Total Earned</p>
                                    <p className="font-black">₹{user?.totalEarnings || 0}</p>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl text-amber-600">
                                    <p className="text-[10px] font-black uppercase tracking-widest">Pending Payout</p>
                                    <p className="font-black">₹{user?.pendingBalance || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Proof">
                    <form onSubmit={handleUploadProof} className="space-y-6 text-center">
                        <input 
                            required 
                            type="text" 
                            placeholder="Proof URL (Image link)..." 
                            value={photoUrl}
                            onChange={e => setPhotoUrl(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-xs"
                        />
                        <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl uppercase text-xs tracking-widest shadow-lg">Send for Verification</button>
                    </form>
                </Modal>
            </div>
        );
    }

    // Default: Admin Dashboard
    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-12 text-slate-900">
             {/* Admin Dashboard */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group text-white">
                <div className="absolute top-0 right-0 p-20 bg-accent/20 blur-[100px] rounded-full group-hover:bg-accent/30 transition-all duration-700"></div>
                <div className="relative z-10">
                   <h1 className="text-3xl font-black tracking-tight underline decoration-accent/40 italic">Welcome, <span className="text-accent">{user?.name}</span> 👋</h1>
                   <p className="text-slate-400 font-medium mt-1">Here's a quick overview of your business performance today.</p>
                </div>
            </div>

            {/* Pending Verifications Alert */}
            {isAdmin && pendingVerifications > 0 && (
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-amber-600 p-6 rounded-[2.5rem] shadow-lg flex items-center justify-between text-white"
                >
                    <div className="flex items-center space-x-6">
                        <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md animate-pulse">
                            <Camera size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter">Attendance Alerts</h3>
                            <p className="text-amber-100 text-xs font-semibold mt-1">There are {pendingVerifications} service boys waiting for verification.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/staff/assignments')}
                        className="px-8 py-4 bg-white text-amber-600 font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-sm hover:bg-slate-50 transition-all active:scale-95"
                    >
                        Verify Now
                    </button>
                </motion.div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard title="Total Revenue" value={stats.revenue || 0} change="12" icon={IndianRupee} isPositive={true} index={0} />
                <StatCard title="Total Expenses" value={stats.expenses || 0} change="3.2" icon={TrendingDown} index={1} colorClass="bg-rose-50 text-rose-600" />
                <StatCard title="Profit Margin" value={stats.profit || 0} change="18" icon={TrendingUp} isPositive={true} index={2} />
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
                        </div>
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
                                        padding: '16px'
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
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Activity</h2>
                        <History size={20} className="text-slate-300" />
                    </div>
                    <div className="space-y-8 flex-1">
                        {recentPayments.map((pay, i) => (
                            <div key={pay._id} className="group relative flex items-start space-x-4">
                                <div className={`mt-1 h-3 w-3 rounded-full ring-4 ring-white ${pay.type === 'incoming' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                <div className="flex-1 border-b border-slate-50 pb-4 last:border-0">
                                    <p className="text-sm font-black text-slate-900 hover:text-accent transition-colors">{pay.note || 'Recorded Payment'}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{pay.partyType} • {pay.method}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
