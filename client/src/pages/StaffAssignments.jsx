import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, 
    Search, 
    Calendar, 
    User, 
    MapPin, 
    Clock, 
    DollarSign, 
    CheckCircle2, 
    X,
    ArrowLeft,
    Filter,
    Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const StaffAssignments = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const [duties, setDuties] = useState([]);
    const [staff, setStaff] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dutiesRes, staffRes, bookingsRes] = await Promise.all([
                    api.get(`/staff/report?startDate=${selectedDate}&endDate=${selectedDate}`),
                    api.get('/staff'),
                    api.get('/bookings')
                ]);
                setDuties(dutiesRes.data);
                setStaff(staffRes.data);
                setBookings(bookingsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedDate]);

    const handleAddDuty = async (data) => {
        try {
            await api.post('/staff/duty', data);
            toast.success('Duty assigned successfully!');
            setIsModalOpen(false);
            // Refresh
            const dutiesRes = await api.get(`/staff/report?startDate=${selectedDate}&endDate=${selectedDate}`);
            setDuties(dutiesRes.data);
        } catch (err) {
            toast.error('Failed to assign duty');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-6 md:space-y-0 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex items-center space-x-6">
                    <button onClick={() => navigate('/staff')} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Daily <span className="text-accent underline decoration-accent/20">Duty registry</span></h1>
                        <p className="text-slate-500 font-medium">Assign and track manpower for the day.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2">
                        <Calendar size={18} className="text-accent mr-3" />
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-transparent border-none outline-none font-bold text-slate-900" 
                        />
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center space-x-2 px-8 py-4 bg-accent hover:bg-indigo-600 text-white font-black rounded-2xl transition-all shadow-glow hover:shadow-accent/40 active:scale-95 uppercase text-xs tracking-widest"
                    >
                        <Plus size={18} />
                        <span>Book Assignment</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-[2.5rem] shadow-premium overflow-hidden border border-slate-100">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Manpower Status ({format(new Date(selectedDate), 'dd MMM')})</h2>
                    <button className="flex items-center space-x-2 text-xs font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest">
                        <Download size={16} />
                        <span>Daily Report</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">
                            <tr>
                                <th className="px-8 py-5">Assigned Service Boy</th>
                                <th className="px-8 py-5">Project / Event</th>
                                <th className="px-8 py-5">Shift Time</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Wage (₹)</th>
                                <th className="px-8 py-5 text-right font-black text-slate-900">Total Bill</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1,2,3].map(i => (
                                    <tr key={i} className="animate-pulse border-b border-slate-50">
                                        <td colSpan="6" className="py-10 px-8"><div className="h-8 bg-slate-50 rounded-2xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : duties.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-30">
                                            <Calendar size={60} className="text-slate-200 mb-6" />
                                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Day is Open</h3>
                                            <p className="text-sm font-medium text-slate-500 mt-2">No service boys assigned for this date yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                duties.map((duty, i) => (
                                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center font-bold text-xs">
                                                    {duty.staff?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 tracking-tight">{duty.staff?.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{duty.staff?.serviceBoyId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-[13px] font-black text-slate-700 leading-tight uppercase tracking-tighter">{duty.eventName || duty.booking?.title}</p>
                                            <p className="text-[10px] font-bold text-accent uppercase tracking-widest mt-1">{duty.location || 'N/A'}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col space-y-1">
                                                <span className="text-[11px] font-bold text-slate-400 px-2 py-0.5 bg-slate-100 rounded-md w-fit">IN: {duty.reportingTime || '--'}</span>
                                                <span className="text-[11px] font-bold text-slate-400 px-2 py-0.5 bg-slate-100 rounded-md w-fit">OUT: {duty.endTime || '--'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col items-start space-y-1.5">
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                    duty.attendanceStatus === 'present' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                                }`}>
                                                    {duty.attendanceStatus}
                                                </span>
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                    duty.paymentStatus === 'paid' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'
                                                }`}>
                                                    {duty.paymentStatus}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex flex-col items-end">
                                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate: ₹{duty.rateApplied}</span>
                                               <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">OT: ₹{duty.overtimeAmount}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right font-black text-slate-900 tracking-tighter text-base">
                                            ₹{duty.totalAmount}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AssignmentModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                staff={staff} 
                bookings={bookings} 
                onAdd={handleAddDuty}
                defaultDate={selectedDate}
            />
        </div>
    );
};

const AssignmentModal = ({ isOpen, onClose, staff, bookings, onAdd, defaultDate }) => {
    const [formData, setFormData] = useState({
        date: defaultDate,
        staff: '',
        booking: '',
        clientName: '',
        eventName: '',
        location: '',
        reportingTime: '09:00',
        endTime: '18:00',
        attendanceStatus: 'present',
        rateApplied: 0,
        overtimeAmount: 0,
        supervisorName: ''
    });

    useEffect(() => {
        if (formData.staff) {
            const selectedStaff = staff.find(s => s._id === formData.staff);
            if (selectedStaff) {
                setFormData(prev => ({ ...prev, rateApplied: selectedStaff.baseRate }));
            }
        }
    }, [formData.staff]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const totalAmount = Number(formData.rateApplied) + Number(formData.overtimeAmount);
        onAdd({ ...formData, totalAmount });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden min-h-fit my-auto">
                        <div className="p-8 bg-slate-50 flex items-center justify-between border-b border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-tighter">Duty Assignment</h2>
                            <button onClick={onClose} className="p-3 bg-white rounded-2xl border border-slate-100 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 grid grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                           <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Duty Date</label>
                                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 transition-all font-bold text-slate-900" />
                           </div>
                           <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assign Service Boy</label>
                                <select required value={formData.staff} onChange={(e) => setFormData({...formData, staff: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 transition-all font-bold text-slate-900 appearance-none">
                                    <option value="">Select Worker...</option>
                                    {staff.map(s => (
                                        <option key={s._id} value={s._id}>{s.name} ({s.serviceBoyId})</option>
                                    ))}
                                </select>
                           </div>

                           <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Link to Event / Project (Optional)</label>
                                <select value={formData.booking} onChange={(e) => {
                                    const booking = bookings.find(b => b._id === e.target.value);
                                    setFormData({
                                        ...formData, 
                                        booking: e.target.value,
                                        eventName: booking ? booking.title : '',
                                        clientName: booking ? booking.client?.name : '',
                                        location: booking ? booking.location : ''
                                    });
                                }} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 transition-all font-bold text-slate-900 appearance-none">
                                    <option value="">Manual Entry (No link to booking)</option>
                                    {bookings.map(b => (
                                        <option key={b._id} value={b._id}>{b.title} - {b.client?.name}</option>
                                    ))}
                                </select>
                           </div>

                           {!formData.booking && (
                               <>
                                <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Event Name</label>
                                        <input value={formData.eventName} onChange={(e) => setFormData({...formData, eventName: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 transition-all font-bold text-slate-900" />
                                </div>
                                <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Location / Venue</label>
                                        <input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 transition-all font-bold text-slate-900" />
                                </div>
                               </>
                           )}

                           <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Reporting Time</label>
                                <input type="time" value={formData.reportingTime} onChange={(e) => setFormData({...formData, reportingTime: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 transition-all font-bold text-slate-900" />
                           </div>
                           <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Duty End Time</label>
                                <input type="time" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 transition-all font-bold text-slate-900" />
                           </div>

                           <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rate for this Duty (₹)</label>
                                <input type="number" value={formData.rateApplied} onChange={(e) => setFormData({...formData, rateApplied: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 transition-all font-bold text-emerald-600" />
                           </div>
                           <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Overtime Bill (₹)</label>
                                <input type="number" value={formData.overtimeAmount} onChange={(e) => setFormData({...formData, overtimeAmount: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 transition-all font-bold text-rose-500" />
                           </div>

                           <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Attendance</label>
                                <select value={formData.attendanceStatus} onChange={(e) => setFormData({...formData, attendanceStatus: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 transition-all font-bold text-slate-900 appearance-none">
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                    <option value="half day">Half Day</option>
                                    <option value="overtime">Overtime</option>
                                </select>
                           </div>
                           <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Supervisor Name</label>
                                <input value={formData.supervisorName} onChange={(e) => setFormData({...formData, supervisorName: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 transition-all font-bold text-slate-900" placeholder="On-site lead..." />
                           </div>

                           <button type="submit" className="col-span-2 mt-4 py-4 bg-slate-900 hover:bg-black text-white font-black rounded-2xl transition-all shadow-lg uppercase text-xs tracking-widest">
                                Confirm assignment
                           </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default StaffAssignments;
