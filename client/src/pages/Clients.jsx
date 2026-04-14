import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Plus, Search, MoreVertical, Mail, Phone, Building2,
    Calendar, ChevronRight, Filter, Download, Trash2, Edit3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

const ClientCard = ({ client, index, onEdit, onDelete }) => (
    <motion.tr 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-all cursor-pointer"
    >
        <td className="py-5 px-6">
            <div className="flex items-center">
                <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold text-sm mr-4 group-hover:bg-accent group-hover:text-white transition-all">
                    {client.name.charAt(0)}
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-900 leading-tight tracking-tight">{client.name}</p>
                   <p className="text-xs text-slate-500 font-medium mt-0.5">{client.companyName || 'N/A'}</p>
                </div>
            </div>
        </td>
        <td className="py-5 px-6">
             <div className="flex flex-col space-y-1">
                <div className="flex items-center text-xs font-semibold text-slate-500">
                    <Mail size={12} className="mr-2" />
                    <span>{client.email || 'N/A'}</span>
                </div>
                <div className="flex items-center text-xs font-semibold text-slate-500">
                    <Phone size={12} className="mr-2" />
                    <span>{client.phone}</span>
                </div>
             </div>
        </td>
        <td className="py-5 px-6">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${client.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                {client.status}
            </span>
        </td>
        <td className="py-5 px-6">
            <p className="text-xs font-bold text-slate-900">{client.gstNumber || 'N/A'}</p>
        </td>
        <td className="py-5 px-6 text-right">
             <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); onEdit(client); }} className="p-2 hover:bg-accent/10 text-slate-400 hover:text-accent rounded-lg transition-all"><Edit3 size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(client); }} className="p-2 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-lg transition-all"><Trash2 size={16} /></button>
                <button className="p-2 hover:bg-slate-200 text-slate-400 rounded-lg transition-all"><ChevronRight size={16} /></button>
             </div>
        </td>
    </motion.tr>
);

const Clients = () => {
    const { api } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    
    const [formData, setFormData] = useState({ name: '', companyName: '', email: '', phone: '', gstNumber: '', address: '' });

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await api.get('/clients');
                setClients(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchClients();
    }, [api]);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/clients', formData);
            setClients([res.data, ...clients]);
            setIsAddModalOpen(false);
            setFormData({ name: '', companyName: '', email: '', phone: '', gstNumber: '', address: '' });
            toast.success('Client added successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error adding client');
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/clients/${selectedClient._id}`, formData);
            setClients(clients.map(c => c._id === selectedClient._id ? res.data : c));
            setIsEditModalOpen(false);
            setSelectedClient(null);
            toast.success('Client updated successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error updating client');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/clients/${selectedClient._id}`);
            setClients(clients.filter(c => c._id !== selectedClient._id));
            toast.success('Client deleted successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error deleting client');
        }
    };

    const openEdit = (client) => {
        setSelectedClient(client);
        setFormData({ name: client.name || '', companyName: client.companyName || '', email: client.email || '', phone: client.phone || '', gstNumber: client.gstNumber || '', address: client.address || '' });
        setIsEditModalOpen(true);
    };

    const openDelete = (client) => {
        setSelectedClient(client);
        setIsDeleteModalOpen(true);
    };
    
    const exportCSV = () => {
        const headers = "Name,Company,Email,Phone,GST,Status\n";
        const csv = clients.map(c => `${c.name},${c.companyName || ''},${c.email || ''},${c.phone || ''},${c.gstNumber || ''},${c.status}`).join('\n');
        const blob = new Blob([headers + csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'clients.csv';
        a.click();
    };

    const filteredClients = clients.filter(c => 
        (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.companyName && c.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-6 md:space-y-0 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div>
                   <h1 className="text-3xl font-black text-slate-900 tracking-tight">Client <span className="text-accent underline decoration-accent/20">Directory</span></h1>
                   <p className="text-slate-500 font-medium mt-1">Manage your business partners and history.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={exportCSV} className="flex items-center space-x-2 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-sm font-bold rounded-2xl transition-all">
                        <Download size={18} />
                        <span>Export</span>
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2 px-6 py-3 bg-accent hover:bg-indigo-600 text-white text-sm font-bold rounded-2xl transition-all shadow-glow hover:shadow-glow/40 active:scale-95">
                        <Plus size={18} />
                        <span>Add New Client</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center justify-between bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-accent/20 transition-all">
                    <Search size={18} className="text-slate-400 mr-2" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter by name, email or company..." 
                        className="bg-transparent border-none outline-none text-sm w-full font-medium" 
                    />
                </div>
                <div className="flex items-center space-x-3">
                    <button className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all text-slate-500"><Filter size={18} /></button>
                    <div className="h-4 w-px bg-slate-200"></div>
                    <span className="text-xs font-bold text-slate-400 px-2 tracking-tight">SORT BY: <span className="text-slate-900 uppercase">Most Recent</span></span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2.5rem] shadow-premium overflow-hidden border border-slate-100/50">
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="py-5 px-8 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Client Info</th>
                                <th className="py-5 px-8 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Contact</th>
                                <th className="py-5 px-8 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                                <th className="py-5 px-8 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">GST No.</th>
                                <th className="py-5 px-8 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                 [1,2,3].map(i => (
                                    <tr key={i} className="animate-pulse border-b border-slate-100 last:border-0 transition-all">
                                        <td colSpan="5" className="py-10 px-8"><div className="h-8 bg-slate-50 rounded-2xl w-full"></div></td>
                                    </tr>
                                 ))
                            ) : filteredClients.length === 0 ? (
                                <tr className="h-96">
                                    <td colSpan="5" className="text-center">
                                        <EmptyState onAdd={() => setIsAddModalOpen(true)} />
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client, i) => (
                                    <ClientCard key={client._id} client={client} index={i} onEdit={openEdit} onDelete={openDelete} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View Omitted to save space but handled similarly if needed */}
                <div className="lg:hidden p-4 space-y-4 bg-slate-50/30">
                    {/* mobile layout kept brief for simplicity */}
                    <div className="text-center p-8 text-slate-400">Mobile view available via desktop layout resize</div>
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Client">
                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Client Name *</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent/20 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Company Name</label>
                            <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent/20 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Phone Number *</label>
                            <input required type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent/20 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent/20 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">GST Number</label>
                            <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent/20 outline-none transition-all" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
                            <textarea name="address" value={formData.address} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent/20 outline-none transition-all" rows="2"></textarea>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button type="submit" className="px-6 py-3 bg-accent text-white font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-glow hover:shadow-glow/40">Save Client</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Client">
                <form onSubmit={handleEdit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Client Name *</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent/20 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Company Name</label>
                            <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent/20 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Phone Number *</label>
                            <input required type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent/20 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent/20 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">GST Number</label>
                            <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent/20 outline-none transition-all" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
                            <textarea name="address" value={formData.address} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent/20 outline-none transition-all" rows="2"></textarea>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button type="submit" className="px-6 py-3 bg-accent text-white font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-glow hover:shadow-glow/40">Update Client</button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={handleDelete}
                title="Delete Client"
                message={`Are you sure you want to delete ${selectedClient?.name}? This action cannot be undone.`}
            />
        </div>
    );
};

const EmptyState = ({ onAdd }) => (
    <div className="flex flex-col items-center justify-center py-12">
        <div className="p-8 bg-slate-50 rounded-[2rem] mb-6 animate-float"><Building2 size={60} className="text-slate-200" /></div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">No connections yet</h3>
        <p className="text-slate-500 text-sm font-medium mt-2 max-w-[240px] text-center">Your directory is empty. Add your first business partner to get started.</p>
        <button onClick={onAdd} className="mt-8 flex items-center space-x-2 px-8 py-3.5 bg-accent text-white font-bold rounded-2xl shadow-glow hover:shadow-glow/40 transition-all active:scale-95">
            <Plus size={20} />
            <span>Add New Entry</span>
        </button>
    </div>
);

export default Clients;
