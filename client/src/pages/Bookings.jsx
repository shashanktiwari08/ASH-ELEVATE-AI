import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Plus, Search, Calendar, MapPin, ChevronRight,
    CheckCircle2, Clock, User, DollarSign, Filter, Layers, Trash2, Edit3, X, Info, ShoppingBag, Truck, Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

const BookingCard = ({ booking, index, onEdit, onDelete, onViewDetails }) => (
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
            <button onClick={() => onViewDetails(booking)} className="h-10 w-10 flex items-center justify-center bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all active:scale-95 shadow-lg group-hover:animate-pulse">
                <ChevronRight size={20} />
            </button>
        </div>
    </motion.div>
);

const Bookings = () => {
    const { api } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [clients, setClients] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [staff, setStaff] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const [formData, setFormData] = useState({
        clientId: '',
        title: '',
        eventDate: '',
        location: '',
        status: 'pending',
        services: [],
        ingredients: []
    });

    const [editData, setEditData] = useState({
        title: '',
        eventDate: '',
        location: '',
        status: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [bRes, cRes, vRes, sRes] = await Promise.all([
                api.get('/bookings'),
                api.get('/clients'),
                api.get('/vendors'),
                api.get('/staff')
            ]);
            setBookings(bRes.data);
            setClients(cRes.data);
            setVendors(vRes.data);
            setStaff(sRes.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to sync booking data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [api]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/bookings', formData);
            toast.success('Event scheduled successfully!');
            setIsAddModalOpen(false);
            setFormData({ clientId: '', title: '', eventDate: '', location: '', status: 'pending', services: [], ingredients: [] });
            fetchData();
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
            fetchData();
        } catch (err) {
            toast.error('Update synchronization failed');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/bookings/${selectedBooking._id}`);
            toast.success('Booking purged');
            setIsDeleteModalOpen(false);
            fetchData();
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

    const openDetailsModal = (booking) => {
        setSelectedBooking({
            ...booking,
            ingredients: booking.ingredients || [],
            services: booking.services || []
        });
        setIsDetailsModalOpen(true);
    };

    // Helpers to manage arrays in Add Modal
    const addIngredient = () => {
        setFormData(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, { name: '', quantity: '', cost: 0 }]
        }));
    };

    const updateIngredient = (index, field, value) => {
        const newIng = [...formData.ingredients];
        newIng[index][field] = value;
        setFormData({ ...formData, ingredients: newIng });
    };

    const removeIngredient = (index) => {
        const newIng = [...formData.ingredients];
        newIng.splice(index, 1);
        setFormData({ ...formData, ingredients: newIng });
    };

    const addService = () => {
        setFormData(prev => ({
            ...prev,
            services: [...prev.services, { vendor: '', staffAssigned: [], serviceType: '', amount: 0 }]
        }));
    };

    const updateService = (index, field, value) => {
        const newSvcs = [...formData.services];
        newSvcs[index][field] = value;
        setFormData({ ...formData, services: newSvcs });
    };
    
    // Manage multiple staff selection using primitive multi-select
    const updateServiceStaff = (index, staffId) => {
        const newSvcs = [...formData.services];
        const assigned = newSvcs[index].staffAssigned;
        if(assigned.includes(staffId)){
            newSvcs[index].staffAssigned = assigned.filter(id => id !== staffId);
        } else {
            newSvcs[index].staffAssigned.push(staffId);
        }
        setFormData({ ...formData, services: newSvcs });
    };

    const removeService = (index) => {
        const newSvcs = [...formData.services];
        newSvcs.splice(index, 1);
        setFormData({ ...formData, services: newSvcs });
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
                        <p className="text-slate-500 font-medium">Coordinate logistics, ingredients, vendors and manpower assignments.</p>
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
                        <BookingCard key={booking._id} booking={booking} index={i} onEdit={openEditModal} onDelete={(b) => { setSelectedBooking(b); setIsDeleteModalOpen(true); }} onViewDetails={openDetailsModal} />
                    ))
                )}
            </div>

            {/* Event Details Modal */}
            <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title="Event Operational Details">
                {selectedBooking && (
                    <div className="space-y-8 p-2 max-h-[80vh] overflow-y-auto custom-scrollbar">
                        <div className="glass p-6 rounded-3xl border border-slate-100 bg-white sticky top-0 z-10 shadow-sm">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{selectedBooking.title}</h2>
                            <div className="flex items-center text-slate-500 mt-2 text-sm font-bold">
                                <Calendar size={14} className="mr-2"/> 
                                {selectedBooking.eventDate ? format(new Date(selectedBooking.eventDate), 'PPP') : 'TBD'} 
                                <span className="mx-3">•</span> 
                                <MapPin size={14} className="mr-2"/> 
                                {selectedBooking.location}
                            </div>
                        </div>

                        {/* Ingredients List */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 text-indigo-600 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-xl"><ShoppingBag size={20} /></div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Ingredients & Requirements</h3>
                            </div>
                            
                            {(!selectedBooking.ingredients || selectedBooking.ingredients.length === 0) ? (
                                <p className="text-sm font-medium text-slate-500 italic p-4 bg-slate-50 rounded-2xl">No ingredients logged for this event.</p>
                            ) : (
                                <div className="space-y-3">
                                    {selectedBooking.ingredients.map((ing, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                            <div>
                                                <p className="font-bold text-slate-900 capitalize">{ing.name}</p>
                                                <p className="text-xs font-semibold text-slate-400 mt-0.5">{ing.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Cost</p>
                                                <p className="font-black text-slate-900 tracking-tighter">₹{ing.cost || 0}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-end p-4 border-t-2 border-dashed border-slate-100 mt-2">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Ingredients Cost</p>
                                            <p className="text-xl font-black text-indigo-600 tracking-tighter">
                                                ₹{selectedBooking.ingredients.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Vendors & Services */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 text-emerald-600 mb-4">
                                <div className="p-2 bg-emerald-50 rounded-xl"><Truck size={20} /></div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Vendors & Contracts</h3>
                            </div>
                            
                            {(!selectedBooking.services || selectedBooking.services.length === 0) ? (
                                <p className="text-sm font-medium text-slate-500 italic p-4 bg-slate-50 rounded-2xl">No vendor services attached.</p>
                            ) : (
                                <div className="space-y-4">
                                    {selectedBooking.services.map((svc, idx) => (
                                        <div key={idx} className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-emerald-200 transition-colors">
                                            <div className="flex justify-between items-start mb-4 border-b border-slate-50 pb-4">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">{svc.serviceType || 'General Service'}</p>
                                                    <p className="font-black text-slate-900 text-lg uppercase tracking-tighter">{svc.vendor?.name || 'Unassigned Vendor'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Service Amount</p>
                                                    <p className="font-black text-slate-900">₹{svc.amount || 0}</p>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center"><Users size={12} className="mr-1"/> Service Boys Assigned</p>
                                                {(!svc.staffAssigned || svc.staffAssigned.length === 0) ? (
                                                    <span className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-lg">Pending Allocation</span>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {svc.staffAssigned.map((staffMember, i) => (
                                                            <div key={i} className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                                                                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[8px] font-black">
                                                                    {staffMember.name ? staffMember.name.charAt(0) : 'S'}
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-700">{staffMember.name || 'Unknown Staff'}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="pt-6 border-t border-slate-100 flex justify-end">
                            <button onClick={() => setIsDetailsModalOpen(false)} className="px-8 py-4 bg-slate-100 text-slate-600 hover:bg-slate-200 font-black text-xs uppercase tracking-widest rounded-2xl transition-all">Close Details</button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Add Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="New Project Reservation">
                <form onSubmit={handleAdd} className="space-y-6 p-2 max-h-[75vh] overflow-y-auto custom-scrollbar pr-4">
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
                        
                        {/* Dynamic Ingredients Editor */}
                        <div className="col-span-2 mt-4">
                            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ingredient Requirements</label>
                                <button type="button" onClick={addIngredient} className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg flex items-center font-bold hover:bg-indigo-100"><Plus size={12} className="mr-1"/> Add Item</button>
                            </div>
                            <div className="space-y-3">
                                {formData.ingredients.map((ing, idx) => (
                                    <div key={idx} className="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                                        <input type="text" placeholder="Item Name" value={ing.name} onChange={e => updateIngredient(idx, 'name', e.target.value)} className="w-1/3 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 text-xs font-bold" />
                                        <input type="text" placeholder="Qty (e.g. 5 KG)" value={ing.quantity} onChange={e => updateIngredient(idx, 'quantity', e.target.value)} className="w-1/3 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 text-xs font-bold" />
                                        <input type="number" placeholder="Cost (₹)" value={ing.cost} onChange={e => updateIngredient(idx, 'cost', e.target.value)} className="w-1/4 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 text-xs font-bold" />
                                        <button type="button" onClick={() => removeIngredient(idx)} className="p-3 text-slate-400 hover:text-rose-500"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                                {formData.ingredients.length === 0 && <p className="text-xs text-slate-400 font-medium italic p-2">No ingredients added yet.</p>}
                            </div>
                        </div>

                        {/* Dynamic Vendors & Staff Editor */}
                        <div className="col-span-2 mt-4">
                            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vendors & Service Boys</label>
                                <button type="button" onClick={addService} className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg flex items-center font-bold hover:bg-emerald-100"><Plus size={12} className="mr-1"/> Add Service</button>
                            </div>
                            <div className="space-y-4">
                                {formData.services.map((svc, idx) => (
                                    <div key={idx} className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-200 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 mr-4 space-y-4">
                                                <input type="text" placeholder="Service Type (e.g. Catering, Decoration)" value={svc.serviceType} onChange={e => updateService(idx, 'serviceType', e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600/20 text-xs font-bold" />
                                                <div className="flex space-x-4">
                                                    <select value={svc.vendor} onChange={e => updateService(idx, 'vendor', e.target.value)} className="w-1/2 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600/20 text-xs font-bold appearance-none">
                                                        <option value="">Select Vendor...</option>
                                                        {vendors.map(v => <option key={v._id} value={v._id}>{v.name} ({v.businessType})</option>)}
                                                    </select>
                                                    <input type="number" placeholder="Cost (₹)" value={svc.amount} onChange={e => updateService(idx, 'amount', e.target.value)} className="w-1/2 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600/20 text-xs font-bold" />
                                                </div>
                                                <div className="pt-2 border-t border-slate-200 mb-2">
                                                    <label className="text-[9px] font-black text-slate-400 flex mb-2 uppercase tracking-widest">Assign Service Boys</label>
                                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                                        {staff.map(s => (
                                                            <button 
                                                                type="button"
                                                                key={s._id} 
                                                                onClick={() => updateServiceStaff(idx, s._id)}
                                                                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${svc.staffAssigned.includes(s._id) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                                                            >
                                                                {s.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => removeService(idx)} className="p-3 bg-white text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl shadow-sm border border-slate-100 transition-colors"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                ))}
                                {formData.services.length === 0 && <p className="text-xs text-slate-400 font-medium italic p-2">No vendors or services added yet.</p>}
                            </div>
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
