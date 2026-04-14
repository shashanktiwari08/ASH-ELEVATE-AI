import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Plus, Search, Briefcase, Mail, Phone, Filter,
    Download, ChevronRight, MapPin, AlertCircle, Edit3, Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

const VendorCard = ({ vendor, index, onEdit, onDelete }) => {
    const totalPayable = vendor.assignedWork?.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0) || 0;
    
    return (
        <motion.tr 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-all cursor-pointer"
        >
            <td className="py-5 px-6">
                <div className="flex items-center">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Briefcase size={18} />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-slate-900 leading-tight tracking-tight">{vendor.name}</p>
                       <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-0.5">{vendor.serviceType}</p>
                    </div>
                </div>
            </td>
            <td className="py-5 px-6">
                 <div className="flex flex-col space-y-1">
                    <div className="flex items-center text-xs font-semibold text-slate-500">
                        <Mail size={12} className="mr-2 opacity-50" />
                        <span>{vendor.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-xs font-semibold text-slate-500">
                        <Phone size={12} className="mr-2 opacity-50" />
                        <span>{vendor.phone}</span>
                    </div>
                 </div>
            </td>
            <td className="py-5 px-6">
                <div>
                   <p className="text-sm font-bold text-slate-900">₹{totalPayable.toLocaleString()}</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">Assigned Work</p>
                </div>
            </td>
            <td className="py-5 px-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${vendor.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {vendor.status}
                </span>
            </td>
            <td className="py-5 px-6 text-right">
                 <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(vendor); }} className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"><Edit3 size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(vendor); }} className="p-2 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-lg transition-all"><Trash2 size={16} /></button>
                    <button className="p-2 hover:bg-slate-200 text-slate-400 rounded-lg transition-all"><ChevronRight size={16} /></button>
                 </div>
            </td>
        </motion.tr>
    );
};

const Vendors = () => {
    const { api } = useAuth();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);

    const [formData, setFormData] = useState({ name: '', serviceType: '', email: '', phone: '', status: 'active' });

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const res = await api.get('/vendors');
                setVendors(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchVendors();
    }, [api]);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/vendors', formData);
            setVendors([res.data, ...vendors]);
            setIsAddModalOpen(false);
            setFormData({ name: '', serviceType: '', email: '', phone: '', status: 'active' });
            toast.success('Vendor onboarded successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error adding vendor');
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/vendors/${selectedVendor._id}`, formData);
            setVendors(vendors.map(v => v._id === selectedVendor._id ? res.data : v));
            setIsEditModalOpen(false);
            setSelectedVendor(null);
            toast.success('Vendor updated successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error updating vendor');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/vendors/${selectedVendor._id}`);
            setVendors(vendors.filter(v => v._id !== selectedVendor._id));
            toast.success('Vendor removed successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error deleting vendor');
        }
    };

    const openEdit = (vendor) => {
        setSelectedVendor(vendor);
        setFormData({ name: vendor.name, serviceType: vendor.serviceType, email: vendor.email || '', phone: vendor.phone, status: vendor.status });
        setIsEditModalOpen(true);
    };

    const openDelete = (vendor) => {
        setSelectedVendor(vendor);
        setIsDeleteModalOpen(true);
    };

    const exportCSV = () => {
        const headers = "Name,Service Type,Email,Phone,Status\n";
        const csv = vendors.map(v => `${v.name},${v.serviceType},${v.email || ''},${v.phone},${v.status}`).join('\n');
        const blob = new Blob([headers + csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vendors.csv';
        a.click();
    };

    const filteredVendors = vendors.filter(v => 
        (v.name && v.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.serviceType && v.serviceType.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-6 md:space-y-0 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div>
                   <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vendor <span className="text-indigo-600 underline decoration-indigo-600/20">Partners</span></h1>
                   <p className="text-slate-500 font-medium mt-1">Manage external service providers and payables.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={exportCSV} className="flex items-center space-x-2 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-sm font-bold rounded-2xl transition-all">
                        <Download size={18} />
                        <span>Export CSV</span>
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl transition-all shadow-glow hover:shadow-indigo-600/40 active:scale-95">
                        <Plus size={18} />
                        <span>Onboard Vendor</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center justify-between bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-indigo-600/20 transition-all">
                    <Search size={18} className="text-slate-400 mr-2" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search service type or name..." 
                        className="bg-transparent border-none outline-none text-sm w-full font-medium" 
                    />
                </div>
                <div className="flex items-center space-x-4 pr-2">
                    <div className="flex items-center space-x-2">
                       <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Status</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] shadow-premium overflow-hidden border border-slate-100/50">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="py-5 px-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Service Provider</th>
                            <th className="py-5 px-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Contact Details</th>
                            <th className="py-5 px-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Total Payable</th>
                            <th className="py-5 px-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                            <th className="py-5 px-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Settings</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                             [1,2].map(i => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan="5" className="py-10 px-6"><div className="h-8 bg-slate-100 rounded-2xl w-full"></div></td>
                                </tr>
                             ))
                        ) : filteredVendors.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-24 text-center">
                                    <div className="flex flex-col items-center justify-center opacity-40">
                                        <Briefcase size={48} className="text-slate-300 mb-4" />
                                        <h3 className="text-lg font-bold text-slate-900">No vendors registered</h3>
                                        <p className="text-sm font-medium">Add your first service provider to start assigning work.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredVendors.map((vendor, i) => (
                                <VendorCard key={vendor._id} vendor={vendor} index={i} onEdit={openEdit} onDelete={openDelete} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Onboard Vendor">
                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Vendor Name *</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Service Type *</label>
                            <select required name="serviceType" value={formData.serviceType} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all">
                                <option value="">Select type...</option>
                                <option value="Catering">Catering</option>
                                <option value="Decoration">Decoration</option>
                                <option value="Photography">Photography</option>
                                <option value="Venue">Venue</option>
                                <option value="Entertainment">Entertainment</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Phone Number *</label>
                            <input required type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all" />
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-glow hover:shadow-indigo-600/40">Save Vendor</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Vendor">
                <form onSubmit={handleEdit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Vendor Name *</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Service Type *</label>
                            <select required name="serviceType" value={formData.serviceType} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all">
                                <option value="">Select type...</option>
                                <option value="Catering">Catering</option>
                                <option value="Decoration">Decoration</option>
                                <option value="Photography">Photography</option>
                                <option value="Venue">Venue</option>
                                <option value="Entertainment">Entertainment</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Phone Number *</label>
                            <input required type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                            <select name="status" value={formData.status} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all" />
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-glow hover:shadow-indigo-600/40">Update Vendor</button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={handleDelete}
                title="Remove Vendor"
                message={`Are you sure you want to remove ${selectedVendor?.name}? This action cannot be undone.`}
            />
        </div>
    );
};

export default Vendors;
