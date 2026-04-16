import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Plus, Search, CreditCard, ArrowUpRight, ArrowDownLeft,
    FileText, TrendingUp, Download, Clock, CheckCircle2, XCircle, Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const TransactionCard = ({ tx, index, onVerify, isAdmin }) => (
    <motion.tr 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-all"
    >
        <td className="py-5 px-6">
            <div className="flex items-center">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mr-4 transition-all ${
                    tx.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                    tx.type === 'incoming' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                    {tx.status === 'pending' ? <Clock size={20} /> : tx.type === 'incoming' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-900 leading-tight tracking-tight capitalize">{tx.partyType}</p>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{format(new Date(tx.date || Date.now()), 'dd MMM yyyy')}</p>
                </div>
            </div>
        </td>
        <td className="py-5 px-6">
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                tx.status === 'verified' ? 'bg-emerald-500 text-white' :
                tx.status === 'rejected' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
            }`}>
                {tx.status}
            </span>
        </td>
        <td className="py-5 px-6">
            <div>
               <p className="text-sm font-black text-slate-900 leading-tight tracking-tight truncate max-w-[200px]">{tx.note || 'General Transaction'}</p>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{tx.method || 'cash'}</p>
            </div>
        </td>
        <td className="py-5 px-6">
            <p className={`text-base font-black tracking-tight ${tx.type === 'incoming' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {tx.type === 'incoming' ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
            </p>
        </td>
        <td className="py-5 px-6 text-right">
            <div className="flex items-center justify-end space-x-2">
                {tx.screenshot && (
                    <a href={tx.screenshot} target="_blank" rel="noreferrer" className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                        <Eye size={16} />
                    </a>
                )}
                {isAdmin && tx.status === 'pending' && (
                    <>
                        <button onClick={() => onVerify(tx._id, 'verified')} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"><CheckCircle2 size={16} /></button>
                        <button onClick={() => onVerify(tx._id, 'rejected')} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><XCircle size={16} /></button>
                    </>
                )}
            </div>
        </td>
    </motion.tr>
);

const Payments = () => {
    const { user, api } = useAuth();
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState({ revenue: 0, expenses: 0, profit: 0 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending'

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        partyType: 'client',
        type: 'incoming',
        amount: '',
        method: 'cash',
        note: ''
    });

    const isAdmin = user?.role === 'admin' || user?.role === 'manager';
    const isClient = user?.role === 'client';

    useEffect(() => {
        fetchData();
    }, [api, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'pending' ? '/payments/pending' : '/payments';
            const res = await api.get(endpoint);
            const summary = await api.get('/payments/summary');
            
            // If client, filter to only show THEIR payments
            let filteredPayments = res.data;
            if (isClient) {
                filteredPayments = res.data.filter(p => p.partyId === user?._id || p.partyId?._id === user?._id);
            }
            
            setPayments(filteredPayments);
            setStats(summary.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/payments', formData);
            setPayments([res.data, ...payments]);
            setIsAddModalOpen(false);
            setFormData({ partyType: 'client', type: 'incoming', amount: '', method: 'cash', note: '' });
            toast.success('Payment recorded successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error recording payment');
        }
    };

    const handleVerify = async (id, status) => {
        try {
            await api.patch(`/payments/${id}/verify`, { status });
            toast.success(`Payment ${status}`);
            fetchData();
        } catch (err) {
            toast.error('Verification failed');
        }
    };

    const exportCSV = () => {
        const headers = "Date,Type,Party,Amount,Method,Status,Note\n";
        const csv = payments.map(p => `${p.date || new Date().toISOString()},${p.type},${p.partyType},${p.amount},${p.method || 'cash'},${p.status},${p.note || ''}`).join('\n');
        const blob = new Blob([headers + csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'payments.csv';
        a.click();
    };

    const filtered = payments.filter(p => 
        (p.note && p.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.partyType && p.partyType.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 text-slate-900">
            {/* Stats Header (Admin Only) */}
            {isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-emerald-500 p-8 rounded-[2.5rem] shadow-glow/10 text-white relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 h-48 w-48 bg-white/10 rounded-full blur-2xl transition-transform duration-500"></div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-70">Total Verified Revenue</p>
                        <h2 className="text-4xl font-black tracking-tight italic tracking-tighter">₹{stats.revenue?.toLocaleString() || 0}</h2>
                        <div className="mt-8 flex items-center text-[10px] font-black opacity-80 uppercase tracking-widest"><TrendingUp size={14} className="mr-2" /> Real-time Verified Inflow</div>
                    </div>
                    <div className="bg-rose-500 p-8 rounded-[2.5rem] shadow-glow/10 text-white relative overflow-hidden group">
                        <p className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-70">Total Expenses</p>
                        <h2 className="text-4xl font-black tracking-tight italic tracking-tighter">₹{stats.expenses?.toLocaleString() || 0}</h2>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium relative overflow-hidden group">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-emerald-500 italic">Net Profit</p>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight italic tracking-tighter">₹{stats.profit?.toLocaleString() || 0}</h2>
                    </div>
                </div>
            )}

            {/* Client Friendly Header */}
            {isClient && (
                <div className="bg-indigo-600 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden text-white mb-8">
                     <h1 className="text-4xl font-black tracking-tight leading-none uppercase tracking-tighter italic">Payment <span className="text-white/40">History</span></h1>
                     <p className="text-indigo-100 font-bold mt-2 uppercase tracking-widest text-[10px]">Track all your verified payments and pending reports.</p>
                </div>
            )}

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-6 md:space-y-0 bg-white p-6 rounded-[2.5rem] shadow-premium border border-slate-100">
                <div className="flex items-center space-x-4">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                        <button 
                            onClick={() => setActiveTab('all')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            History
                        </button>
                        {isAdmin && (
                            <button 
                                onClick={() => setActiveTab('pending')}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Pending Verification
                            </button>
                        )}
                    </div>
                    
                    <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2 w-72 focus-within:ring-2 focus-within:ring-indigo-600/10 transition-all">
                        <Search size={16} className="text-slate-400 mr-2" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find transaction..." 
                            className="bg-transparent border-none outline-none text-[10px] w-full font-black uppercase tracking-widest" 
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button onClick={exportCSV} className="p-3 bg-white hover:bg-slate-50 border border-slate-100 text-slate-600 rounded-2xl transition-all"><Download size={20} /></button>
                    {isAdmin && (
                        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2 px-8 py-4 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-glow active:scale-95">
                            <Plus size={18} />
                            <span>Record Payment</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[3rem] shadow-premium overflow-hidden border border-slate-100/50">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Transaction</th>
                            <th className="py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                            <th className="py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Details</th>
                            <th className="py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Amount</th>
                            <th className="py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                             [1,2,3].map(i => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan="5" className="p-8"><div className="h-4 bg-slate-50 rounded-full w-full"></div></td>
                                </tr>
                             ))
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-32 text-center">
                                    <div className="flex flex-col items-center justify-center opacity-30">
                                        <CreditCard size={60} className="mb-4 text-slate-200" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">No Payments Found</h3>
                                        <p className="text-[10px] font-bold uppercase tracking-tighter mt-2">Any transactions will show up here.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((p, i) => (
                                <TransactionCard key={p._id} tx={p} index={i} onVerify={handleVerify} isAdmin={isAdmin} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Record Payment">
                <form onSubmit={handleAdd} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Party Type</label>
                            <select name="partyType" value={formData.partyType} onChange={e => setFormData({...formData, partyType: e.target.value})} className="w-full mt-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs">
                                <option value="client">Client</option>
                                <option value="vendor">Vendor</option>
                                <option value="staff">Staff</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Transaction Type</label>
                            <select name="type" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full mt-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs">
                                <option value="incoming">Incoming (Revenue)</option>
                                <option value="outgoing">Outgoing (Expense)</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Amount (₹)</label>
                             <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-lg text-emerald-600" />
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Payment Method</label>
                             <select name="method" value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs">
                                <option value="cash">Cash</option>
                                <option value="upi">UPI</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="cheque">Cheque</option>
                                 <option value="online_banking">Net Banking</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Note / Reference</label>
                             <input type="text" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs placeholder:text-slate-300" placeholder="e.g. Booking ID or Staff Name" />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-3xl hover:bg-black transition-all shadow-glow active:scale-95">Save Transaction</button>
                </form>
            </Modal>
        </div>
    );
};

export default Payments;
