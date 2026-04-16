import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    X,
    ArrowLeft,
    Download,
    Eye,
    Check,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';

const StaffAssignments = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const [duties, setDuties] = useState([]);
    const [staff, setStaff] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [selectedDuty, setSelectedDuty] = useState(null);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const [verifyData, setVerifyData] = useState({
        status: 'verified',
        attendanceStatus: 'present',
        rateApplied: 0,
        overtimeAmount: 0
    });

    const fetchData = async () => {
        try {
            setLoading(true);
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

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const handleAddDuty = async (data) => {
        try {
            await api.post('/staff/duty', data);
            toast.success('Duty assigned! Service boy will see this in their dashboard.');
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error('Failed to assign duty');
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/staff/duty/${selectedDuty._id}/verify`, verifyData);
            toast.success('Attendance verified and credits applied!');
            setIsVerifyModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error('Failed to verify attendance');
        }
    };

    const openVerifyModal = (duty) => {
        setSelectedDuty(duty);
        setVerifyData({
            status: 'verified',
            attendanceStatus: 'present',
            rateApplied: duty.rateApplied || duty.staff?.baseRate || 0,
            overtimeAmount: 0
        });
        setIsVerifyModalOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-6 md:space-y-0 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                <div className="flex items-center space-x-6">
                    <button onClick={() => navigate('/staff')} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase tracking-tighter">Duty <span className="text-indigo-600 underline">Registry</span></h1>
                        <p className="text-slate-500 font-medium">Coordinate manpower logistics and verify attendance.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2">
                        <Calendar size={18} className="text-indigo-600 mr-3" />
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-transparent border-none outline-none font-bold text-slate-900" 
                        />
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center space-x-2 px-8 py-4 bg-slate-900 hover:bg-black text-white font-black rounded-2xl transition-all shadow-lg active:scale-95 uppercase text-xs tracking-widest"
                    >
                        <Plus size={18} />
                        <span>Book Assignment</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-[2.5rem] shadow-premium overflow-hidden border border-slate-100">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Daily Manpower ({format(new Date(selectedDate), 'dd MMM')})</h2>
                    <button className="flex items-center space-x-2 text-xs font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest">
                        <Download size={16} />
                        <span>Export Report</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">
                            <tr>
                                <th className="px-8 py-5">Service Boy</th>
                                <th className="px-8 py-5">Project / Location</th>
                                <th className="px-8 py-5">Shift Time</th>
                                <th className="px-8 py-5">Status / Proof</th>
                                <th className="px-8 py-5 text-right">Verification</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1,2,3].map(i => (
                                    <tr key={i} className="animate-pulse border-b border-slate-50">
                                        <td colSpan="5" className="py-10 px-8"><div className="h-8 bg-slate-50 rounded-2xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : duties.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-30">
                                            <Calendar size={60} className="text-slate-200 mb-6" />
                                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Day is Open</h3>
                                            <p className="text-sm font-medium text-slate-500 mt-2">No duties assigned for this date yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                duties.map((duty, i) => (
                                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center font-black text-sm">
                                                    {duty.staff?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 tracking-tight">{duty.staff?.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{duty.staff?.serviceBoyId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-[13px] font-black text-slate-900 leading-tight uppercase tracking-tighter">{duty.eventName || duty.booking?.title}</p>
                                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1 flex items-center"><MapPin size={10} className="mr-1"/> {duty.location || 'N/A'}</p>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-xs font-bold text-slate-500">
                                            <div className="flex items-center"><Clock size={12} className="mr-2 text-slate-300"/> {duty.reportingTime} - {duty.endTime}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex flex-col space-y-1">
                                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit ${
                                                        duty.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-600' : 
                                                        duty.venuePhotoProof ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                                                    }`}>
                                                        {duty.verificationStatus === 'verified' ? 'Verified' : duty.venuePhotoProof ? 'Pending Review' : 'No Proof Uploaded'}
                                                    </span>
                                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit ${
                                                        duty.attendanceStatus === 'present' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'
                                                    }`}>
                                                        {duty.attendanceStatus}
                                                    </span>
                                                </div>
                                                {duty.venuePhotoProof && (
                                                    <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200 shadow-sm group/img relative cursor-pointer" onClick={() => window.open(duty.venuePhotoProof, '_blank')}>
                                                        <img src={duty.venuePhotoProof} className="h-full w-full object-cover" alt="Venue Proof" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white"><Eye size={14}/></div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {duty.verificationStatus !== 'verified' ? (
                                                <button 
                                                    onClick={() => openVerifyModal(duty)}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                        duty.venuePhotoProof ? 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    Verify Now
                                                </button>
                                            ) : (
                                                <div className="flex items-center justify-end text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                                                    <CheckCircle2 size={16} className="mr-2" />
                                                    Success
                                                </div>
                                            )}
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

            {/* Verification Modal */}
            <Modal isOpen={isVerifyModalOpen} onClose={() => setIsVerifyModalOpen(false)} title="Verify Attendance Record">
                {selectedDuty && (
                    <div className="space-y-6 p-2">
                        <div className="flex space-x-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                            {selectedDuty.venuePhotoProof ? (
                                <div className="w-1/2 rounded-2xl overflow-hidden border border-slate-200">
                                    <img src={selectedDuty.venuePhotoProof} className="w-full h-auto object-cover max-h-60" alt="Proof" />
                                </div>
                            ) : (
                                <div className="w-1/2 flex flex-col items-center justify-center bg-white rounded-2xl p-8 text-slate-300 border-2 border-dashed border-slate-200">
                                    <AlertCircle size={40} className="mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No photo provided</p>
                                </div>
                            )}
                            <div className="w-1/2 space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Service Boy</p>
                                    <p className="text-xl font-black text-slate-900 tracking-tighter">{selectedDuty.staff?.name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                                        <p className="text-xs font-bold text-slate-700">{format(new Date(selectedDuty.date), 'dd MMM yyyy')}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                                        <p className="text-xs font-bold text-slate-700 truncate">{selectedDuty.location}</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-200">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center text-indigo-600"><Check size={12} className="mr-1"/> Verification Action</p>
                                    <div className="space-y-3">
                                        <select value={verifyData.status} onChange={e => setVerifyData({...verifyData, status: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none text-xs font-bold appearance-none">
                                            <option value="verified">Approve & Verify</option>
                                            <option value="rejected">Reject Proof</option>
                                        </select>
                                        <select value={verifyData.attendanceStatus} onChange={e => setVerifyData({...verifyData, attendanceStatus: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none text-xs font-bold appearance-none">
                                            <option value="present">Mark Present</option>
                                            <option value="half day">Half Day</option>
                                            <option value="overtime">Overtime Earned</option>
                                            <option value="absent">Mark Absent</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Duty Rate (₹)</label>
                                <input type="number" value={verifyData.rateApplied} onChange={e => setVerifyData({...verifyData, rateApplied: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-emerald-600" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Overtime Bill (₹)</label>
                                <input type="number" value={verifyData.overtimeAmount} onChange={e => setVerifyData({...verifyData, overtimeAmount: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-rose-500" />
                            </div>
                        </div>

                        <div className="pt-4 flex space-x-4">
                            <button onClick={() => setIsVerifyModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase text-[10px] tracking-widest transition-all">Cancel</button>
                            <button onClick={handleVerify} className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-200 active:scale-95 transition-all">Submit Verification</button>
                        </div>
                    </div>
                )}
            </Modal>
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
                           <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Duty Date</label>
                                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all font-bold text-slate-900" />
                           </div>
                           <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Service Boy</label>
                                <select required value={formData.staff} onChange={(e) => setFormData({...formData, staff: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all font-bold text-slate-900 appearance-none">
                                    <option value="">Select individual...</option>
                                    {staff.map(s => (
                                        <option key={s._id} value={s._id}>{s.name} ({s.serviceBoyId})</option>
                                    ))}
                                </select>
                           </div>

                           <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Event Project</label>
                                <select value={formData.booking} onChange={(e) => {
                                    const booking = bookings.find(b => b._id === e.target.value);
                                    setFormData({
                                        ...formData, 
                                        booking: e.target.value,
                                        eventName: booking ? booking.title : '',
                                        clientName: booking ? booking.client?.name : '',
                                        location: booking ? booking.location : ''
                                    });
                                }} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all font-bold text-slate-900 appearance-none">
                                    <option value="">Manual Project Entry</option>
                                    {bookings.map(b => (
                                        <option key={b._id} value={b._id}>{b.title} - {b.client?.name}</option>
                                    ))}
                                </select>
                           </div>

                           {!formData.booking && (
                               <>
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project Name</label>
                                        <input value={formData.eventName} onChange={(e) => setFormData({...formData, eventName: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all font-bold text-slate-900" />
                                </div>
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Venue / Specific Room</label>
                                        <input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all font-bold text-slate-900" />
                                </div>
                               </>
                           )}

                           <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Shift Start</label>
                                <input type="time" value={formData.reportingTime} onChange={(e) => setFormData({...formData, reportingTime: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900" />
                           </div>
                           <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Shift End</label>
                                <input type="time" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900" />
                           </div>

                           <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Base Rate (₹)</label>
                                <input type="number" value={formData.rateApplied} onChange={(e) => setFormData({...formData, rateApplied: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900" />
                           </div>
                           <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Supervisor Site Lead</label>
                                <input value={formData.supervisorName} onChange={(e) => setFormData({...formData, supervisorName: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900" placeholder="Lead name..." />
                           </div>

                           <div className="col-span-2 bg-amber-50 rounded-3xl p-5 border border-amber-100 flex items-start space-x-4">
                               <AlertCircle className="text-amber-600 mt-1" size={20} />
                               <div>
                                   <p className="text-xs font-black text-amber-900 uppercase tracking-tighter">New Verification Flow</p>
                                   <p className="text-[10px] font-bold text-amber-700/80 mt-1 leading-relaxed">Attendance won't be marked now. The Service Boy must check-in via their dashboard and upload a venue picture. You will then verify it from here to release credits.</p>
                               </div>
                           </div>

                           <button type="submit" className="col-span-2 mt-4 py-5 bg-slate-900 hover:bg-black text-white font-black rounded-[1.5rem] transition-all shadow-lg active:scale-[0.98] uppercase text-xs tracking-widest">
                                Finalize Duty Booking
                           </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default StaffAssignments;
