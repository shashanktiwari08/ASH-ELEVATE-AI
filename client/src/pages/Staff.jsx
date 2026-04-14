import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, Search, UserPlus, Mail, Phone, Calendar,
    ChevronRight, UserCheck, Download, X, CreditCard,
    MapPin, Briefcase, Zap, Edit3, Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

const StaffMemberCard = ({ staff, index, onView, onEdit, onDelete }) => (
    <motion.tr 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-all cursor-pointer"
        onClick={() => onView(staff)}
    >
        <td className="py-5 px-8">
            <div className="flex items-center">
                <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold text-sm mr-4 group-hover:bg-accent group-hover:text-white transition-all">
                    {staff.name.charAt(0)}
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-900 leading-tight tracking-tight">{staff.name}</p>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{staff.serviceBoyId}</p>
                </div>
            </div>
        </td>
        <td className="py-5 px-8">
             <div className="flex flex-col space-y-1">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{staff.skillCategory}</span>
                <div className="flex items-center text-xs font-semibold text-slate-500">
                    <Phone size={12} className="mr-2 opacity-50" />
                    <span>{staff.phone}</span>
                </div>
             </div>
        </td>
        <td className="py-5 px-8">
            <div className="flex items-center space-x-2">
               <span className="text-xs font-bold text-slate-700">{staff.rateType}</span>
               <div className="h-4 w-px bg-slate-200"></div>
               <span className="text-sm font-black text-slate-900">₹{staff.baseRate}</span>
            </div>
        </td>
        <td className="py-5 px-8">
            <div className="flex flex-col">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Earned</p>
                <p className="text-sm font-bold text-slate-900">₹{staff.totalEarnings.toLocaleString()}</p>
            </div>
        </td>
        <td className="py-5 px-8 text-right">
             <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); onEdit(staff); }} className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"><Edit3 size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(staff); }} className="p-2 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-lg transition-all"><Trash2 size={16} /></button>
                <button className="p-2 hover:bg-slate-200 text-slate-400 rounded-lg transition-all"><ChevronRight size={16} /></button>
             </div>
        </td>
    </motion.tr>
);

const Staff = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    const [formData, setFormData] = useState({
        name: '', phone: '', address: '', idProofDetails: '',
        skillCategory: 'waiter', rateType: 'per day', baseRate: 0, overtimeRate: 0
    });

    const fetchStaff = async () => {
        try {
            const res = await api.get('/staff');
            setStaff(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, [api]);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            await api.post('/staff', formData);
            toast.success('Service boy onboarded successfully!');
            setIsAddModalOpen(false);
            setFormData({ name: '', phone: '', address: '', idProofDetails: '', skillCategory: 'waiter', rateType: 'per day', baseRate: 0, overtimeRate: 0 });
            fetchStaff();
        } catch (err) {
            toast.error('Failed to onboard service boy');
        }
    };

    const handleEditStaff = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/staff/${selectedStaff._id}`, formData);
            toast.success('Personnel record updated!');
            setIsEditModalOpen(false);
            fetchStaff();
        } catch (err) {
            toast.error('Failed to update record');
        }
    };

    const handleDeleteStaff = async () => {
        try {
            await api.delete(`/staff/${selectedStaff._id}`);
            toast.success('Personnel record removed');
            setIsDeleteModalOpen(false);
            fetchStaff();
        } catch (err) {
            toast.error('Failed to delete record');
        }
    };

    const openEdit = (s) => {
        setSelectedStaff(s);
        setFormData({
            name: s.name, phone: s.phone, address: s.address || '', 
            idProofDetails: s.idProofDetails || '', skillCategory: s.skillCategory,
            rateType: s.rateType, baseRate: s.baseRate, overtimeRate: s.overtimeRate
        });
        setIsEditModalOpen(true);
    };

    const filteredStaff = staff.filter(s => 
        (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.serviceBoyId && s.serviceBoyId.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const exportCSV = () => {
        const headers = "Name,SB_ID,Phone,Skill,Rate_Type,Rate\n";
        const csv = staff.map(s => `${s.name},${s.serviceBoyId},${s.phone},${s.skillCategory},${s.rateType},${s.baseRate}`).join('\n');
        const blob = new Blob([headers + csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'staff_registry.csv';
        a.click();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-6 md:space-y-0 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex items-center space-x-6">
                    <div className="p-4 bg-accent/10 rounded-3xl text-accent hidden sm:block">
                        <Zap size={32} />
                    </div>
                    <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Service <span className="text-accent underline decoration-accent/20">Boys</span></h1>
                    <p className="text-slate-500 font-medium mt-1">Total database of specialized event manpower.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={exportCSV} className="flex items-center space-x-2 px-6 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-black rounded-2xl transition-all uppercase tracking-widest shadow-sm">
                        <Download size={18} />
                        <span>Export</span>
                    </button>
                    <button 
                        onClick={() => navigate('/staff/assignments')}
                        className="flex items-center space-x-2 px-6 py-4 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-2xl transition-all shadow-lg uppercase tracking-widest"
                    >
                        <UserCheck size={18} />
                        <span>Work Registry</span>
                    </button>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center space-x-2 px-6 py-4 bg-accent hover:bg-indigo-600 text-white text-xs font-black rounded-2xl transition-all shadow-glow hover:shadow-accent/40 active:scale-95 uppercase tracking-widest"
                    >
                        <Plus size={18} />
                        <span>Hire Entry</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-3xl shadow-sm border border-slate-100 gap-4">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 w-full sm:w-96 focus-within:ring-2 focus-within:ring-accent/20 transition-all">
                    <Search size={18} className="text-slate-400 mr-2" />
                    <input 
                        type="text" 
                        placeholder="Search by name or SB ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm w-full font-bold text-slate-700" 
                    />
                </div>
                <div className="flex items-center space-x-3 text-slate-400 text-[10px] font-black uppercase tracking-widest pr-4">
                    <span className="text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg">Database: {staff.length}</span>
                    <div className="h-4 w-px bg-slate-200"></div>
                </div>
            </div>

            {/* Main Content: Table and Cards */}
            <div className="bg-white rounded-[2.5rem] shadow-premium overflow-hidden border border-slate-100/50">
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Profile</th>
                                <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Skill / Contact</th>
                                <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Rate Setup</th>
                                <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Cumulative Stat</th>
                                <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                 [1,2,3].map(i => (
                                    <tr key={i} className="animate-pulse border-b border-slate-100 transition-all">
                                        <td colSpan="5" className="py-10 px-8"><div className="h-8 bg-slate-50 rounded-2xl w-full"></div></td>
                                    </tr>
                                 ))
                            ) : filteredStaff.length === 0 ? (
                                <tr className="h-96">
                                    <td colSpan="5" className="text-center">
                                        <EmptyState onAdd={() => setIsAddModalOpen(true)} />
                                    </td>
                                </tr>
                            ) : (
                                filteredStaff.map((s, i) => (
                                    <StaffMemberCard key={s._id} staff={s} index={i} onView={(s) => navigate(`/staff/${s._id}`)} onEdit={openEdit} onDelete={(s) => { setSelectedStaff(s); setIsDeleteModalOpen(true); }} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="lg:hidden p-4 space-y-4 bg-slate-50/20">
                    {filteredStaff.map((s, i) => (
                        <div key={s._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm" onClick={() => navigate(`/staff/${s._id}`)}>
                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 rounded-2xl bg-accent text-white flex items-center justify-center font-bold text-lg">
                                    {s.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black text-slate-900">{s.name}</h3>
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{s.skillCategory}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={(e) => { e.stopPropagation(); openEdit(s); }} className="p-2 bg-slate-50 rounded-lg text-slate-400"><Edit3 size={14}/></button>
                                </div>
                            </div>
                            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Phone</p>
                                    <p className="text-sm font-bold text-slate-700">{s.phone}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Rate</p>
                                    <p className="text-sm font-black text-slate-900">₹{s.baseRate}/{s.rateType === 'per day' ? 'day' : 'evt'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Onboard Service Boy">
                <form onSubmit={handleAddStaff} className="space-y-4 px-2 pb-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name *</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent/20 font-bold" placeholder="Enter name..." />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number *</label>
                            <input required type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent/20 font-bold" placeholder="9876543210" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Skill Category</label>
                            <select name="skillCategory" value={formData.skillCategory} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent/20 font-bold appearance-none">
                                <option value="waiter">Waiter</option>
                                <option value="helper">Helper</option>
                                <option value="cleaner">Cleaner</option>
                                <option value="decorator helper">Decorator Helper</option>
                                <option value="loader">Loader</option>
                                <option value="kitchen helper">Kitchen Helper</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Home Address</label>
                        <textarea name="address" value={formData.address} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent/20 font-bold h-20" placeholder="Complete residential address..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rate Type</label>
                            <select name="rateType" value={formData.rateType} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent/20 font-bold appearance-none">
                                <option value="per day">Per Day</option>
                                <option value="per event">Per Event</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Base Rate (₹) *</label>
                            <input required type="number" name="baseRate" value={formData.baseRate} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent/20 font-bold" />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-4 bg-accent hover:bg-indigo-600 text-white font-black rounded-2xl transition-all shadow-glow hover:shadow-accent/40 active:scale-[0.98] uppercase tracking-widest">Complete Onboarding</button>
                </form>
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Staff Record">
                <form onSubmit={handleEditStaff} className="space-y-4 px-2 pb-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name *</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent/20 font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone *</label>
                            <input required type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent/20 font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Skill</label>
                            <select name="skillCategory" value={formData.skillCategory} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent/20 font-bold appearance-none">
                                <option value="waiter">Waiter</option>
                                <option value="helper">Helper</option>
                                <option value="cleaner">Cleaner</option>
                                <option value="decorator helper">Decorator Helper</option>
                                <option value="loader">Loader</option>
                                <option value="kitchen helper">Kitchen Helper</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Base Rate (₹)</label>
                            <input required type="number" name="baseRate" value={formData.baseRate} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent/20 font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Overtime (₹/hr)</label>
                            <input required type="number" name="overtimeRate" value={formData.overtimeRate} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent/20 font-bold" />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black rounded-2xl transition-all shadow-lg uppercase tracking-widest">Update Record</button>
                </form>
            </Modal>

            <ConfirmModal 
                isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteStaff}
                title="Remove Personnel" message={`Are you sure you want to remove ${selectedStaff?.name}? All historical data for this worker will be hidden from the active list.`}
            />
        </div>
    );
};

const EmptyState = ({ onAdd }) => (
    <div className="flex flex-col items-center justify-center py-12">
        <div className="p-8 bg-slate-50 rounded-[2rem] mb-6"><UserPlus size={60} className="text-slate-200" /></div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">No Service Boys Found</h3>
        <p className="text-slate-500 text-sm font-medium mt-2 max-w-[280px]">Your manpower database is empty. Add workers to start assigning duties.</p>
        <button onClick={onAdd} className="mt-8 flex items-center space-x-2 px-8 py-3.5 bg-accent text-white font-bold rounded-2xl shadow-glow transition-all active:scale-95 uppercase text-xs tracking-widest">
            <Plus size={16} />
            <span>Add First Entry</span>
        </button>
    </div>
);

export default Staff;
