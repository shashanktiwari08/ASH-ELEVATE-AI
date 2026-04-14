import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Plus, Search, Calendar, MapPin, ChevronRight,
    CheckCircle2, Clock, User, DollarSign, Filter, Layers, Trash2, Edit3, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

const BookingCard = ({ booking, index, onEdit, onDelete }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="glass p-8 rounded-[2.5rem] border border-slate-100 hover:border-indigo-200 hover:shadow-premium transition-all group relative bg-white"
    >
        <div className="flex items-start justify-between mb-8">
            <div className="flex items-center space-x-5">
                <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-2xl shadow-sm border border-indigo-100/50">
                    {booking.eventDate ? format(new Date(booking.eventDate), 'dd') : '--'}
                </div>
                <div>
                   <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tighter">{booking.title}</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">{booking.eventDate ? format(new Date(booking.eventDate), 'MMMM yyyy') : 'No Date'}</p>
                </div>
            </div>
            <div className="flex flex-col items-end space-y-3">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    booking.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                    booking.status === 'confirmed' ? 'bg-indigo-100 text-indigo-600' : 
                    booking.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-rose-100 text-rose-600'
                }`}>
                    {booking.status}
                </span>
                <div className="flex bg-slate-50 rounded-xl p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(booking)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"><Edit3 size={16}/></button>
                    <button onClick={() => onDelete(booking)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all"><Trash2 size={16}/></button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8 bg-slate-50/50 p-5 rounded-2xl border border-slate-50">
            <div className="flex items-center text-xs font-bold text-slate-600">
                <div className="p-2 bg-white rounded-lg mr-3 shadow-sm"><MapPin size={14} className="text-indigo-400" /></div>
                <span className="truncate">{booking.location || 'Not set'}</span>
            </div>
            <div className="flex items-center text-xs font-bold text-slate-600">
                <div className="p-2 bg-white rounded-lg mr-3 shadow-sm"><User size={14} className="text-indigo-400" /></div>
                <span className="truncate">{booking.client?.name || 'Manual Entry'}</span>
            </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <div>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Contract Value</p>
                <div className="flex items-baseline space-x-1">
                    <span className="text-xs font-black text-slate-400">₹</span>
                    <span className="text-xl font-black text-slate-900 tracking-tighter">{booking.totalAmount?.toLocaleString() || '0'}</span>
                </div>
            </div>
            <button className="h-10 w-10 flex items-center justify-center bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all active:scale-95 shadow-lg">
                <ChevronRight size={20} />
            </button>
        </div>
    </motion.div>
);

const Bookings = () => {
    const { api } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const [formData, setFormData] = useState({
        clientId: '',
        title: '',
        eventDate: '',
        location: '',
        status: 'pending',
        services: []
    });

    const [editData, setEditData] = useState({
        title: '',
        eventDate: '',
        location: '',
        status: ''
    });

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const [bRes, cRes] = await Promise.all([
                api.get('/bookings'),
                api.get('/clients')
            ]);
            setBookings(bRes.data);
            setClients(cRes.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to sync booking data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [api]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/bookings', formData);
            toast.success('Event scheduled successfully!');
            setIsAddModalOpen(false);
            setFormData({ clientId: '', title: '', eventDate: '', location: '', status: 'pending', services: [] });
            fetchBookings();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error scheduling event');
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/bookings/${selectedBooking._id}`, editData);
            toast.success('Changes archived!');
            setIsEditModalOpen(false);
            fetchBookings();
        } catch (err) {
            toast.error('Update synchronization failed');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/bookings/${selectedBooking._id}`);
            toast.success('Booking purged');
            setIsDeleteModalOpen(false);
            fetchBookings();
        } catch (err) {
            toast.error('Could not cancel booking');
        }
    };

    const openEditModal = (booking) => {
        setSelectedBooking(booking);
        setEditData({
            title: booking.title,
            eventDate: booking.eventDate ? format(new Date(booking.eventDate), 'yyyy-MM-dd') : '',
            location: booking.location,
            status: booking.status
        });
        setIsEditModalOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-6 md:space-y-0 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                <div className="flex items-center space-x-6">
                    <div className="p-5 bg-indigo-50 rounded-[1.5rem] text-indigo-600">
                        <Calendar size={36} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase tracking-tighter">Event <span className="text-indigo-600 underline decoration-indigo-200">Execution</span></h1>
                        <p className="text-slate-500 font-medium">Coordinate logistics and site manpower assignments.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-4 px-10 py-5 bg-slate-900 border border-slate-900 text-white text-[10px] font-black rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-[0.2em]">
                        <Plus size={20} />
                        <span>Reserve Project</span>
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {loading ? (
                    [1,2,3].map(i => (
                        <div key={i} className="animate-pulse bg-white h-72 rounded-[2.5rem] border border-slate-100" />
                    ))
                ) : bookings.length === 0 ? (
                    <div className="col-span-full py-40 text-center">
                        <div className="inline-flex flex-col items-center justify-center opacity-20">
                            <Layers size={80} className="text-slate-200 mb-6" />
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Reservations Empty</h3>
                            <p className="text-sm font-medium text-slate-500 mt-2">No active projects detected in your region.</p>
                        </div>
                    </div>
                ) : (
                    bookings.map((booking, i) => (
                        <BookingCard key={booking._id} booking={booking} index={i} onEdit={openEditModal} onDelete={(b) => { setSelectedBooking(b); setIsDeleteModalOpen(true); }} />
                    ))
                )}
            </div>

            {/* Add Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="New Project Reservation">
                <form onSubmit={handleAdd} className="space-y-6 p-2">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Project Name *</label>
                            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600/20 font-bold" placeholder="e.g. Wedding at Maratha Mahal" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Party / Client *</label>
                            <select required value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600/20 font-bold appearance-none">
                                <option value="">Link to Client Registry...</option>
                                {clients.map(c => <option key={c._id} value={c._id}>{c.name} ({c.companyName || 'Individual'})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Launch Date *</label>
                            <input required type="date" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600/20 font-bold text-slate-700" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Geographic Location *</label>
                            <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600/20 font-bold" placeholder="Venue or Address" />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-[1.5rem] transition-all shadow-lg active:scale-[0.98] uppercase tracking-[0.2em] text-[10px] mt-4">Confirm Reservation</button>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Project Scope">
                <form onSubmit={handleEdit} className="space-y-6 p-2">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Title</label>
                            <input type="text" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Status</label>
                            <select value={editData.status} onChange={e => setEditData({...editData, status: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold appearance-none">
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Due Date</label>
                            <input type="date" value={editData.eventDate} onChange={e => setEditData({...editData, eventDate: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Location</label>
                            <input type="text" value={editData.location} onChange={e => setEditData({...editData, location: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-5 bg-slate-900 border-2 border-slate-900 text-white font-black rounded-[1.5rem] transition-all uppercase tracking-[0.2em] text-[10px] mt-4 hover:bg-black">Sync Changes</button>
                </form>
            </Modal>

            <ConfirmModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={handleDelete}
                title="Cancel Project"
                message={`This will permanently remove ${selectedBooking?.title}. This action cannot be undone.`}
            />
        </div>
    );
};

export default Bookings;
