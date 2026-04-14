import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Plus, Search, CreditCard, ArrowUpRight, ArrowDownLeft,
    FileText, TrendingUp, Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const TransactionCard = ({ tx, index }) => (
    <motion.tr 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-all cursor-pointer"
    >
        <td className="py-5 px-6">
            <div className="flex items-center">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mr-4 transition-all ${
                    tx.type === 'incoming' ? 'bg-emerald-50 text-emerald-600 scale-105' : 'bg-rose-50 text-rose-600'
                }`}>
                    {tx.type === 'incoming' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-900 leading-tight tracking-tight capitalize">{tx.partyType}</p>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{format(new Date(tx.date || Date.now()), 'dd MMM yyyy, HH:mm')}</p>
                </div>
            </div>
        </td>
        <td className="py-5 px-6">
            <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase text-slate-400">VIA</span>
                <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">{tx.method || 'cash'}</p>
            </div>
        </td>
        <td className="py-5 px-6">
            <div>
               <p className="text-sm font-black text-slate-900 leading-tight tracking-tight">{tx.note || 'General Transaction'}</p>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">Note/Ref</p>
            </div>
        </td>
        <td className="py-5 px-6">
            <p className={`text-base font-black tracking-tight ${tx.type === 'incoming' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {tx.type === 'incoming' ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
            </p>
        </td>
        <td className="py-5 px-6 text-right">
             <button className="p-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all"><FileText size={18} /></button>
        </td>
    </motion.tr>
);

const Payments = () => {
    const { api } = useAuth();
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState({ revenue: 0, expenses: 0, profit: 0 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        partyType: 'client',
        type: 'incoming',
        amount: '',
        method: 'cash',
        note: ''
    });

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await api.get('/payments');
                const summary = await api.get('/payments/summary');
                setPayments(res.data);
                setStats(summary.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, [api]);

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

    const exportCSV = () => {
        const headers = "Date,Type,Party,Amount,Method,Note\n";
        const csv = payments.map(p => `${p.date || new Date().toISOString()},${p.type},${p.partyType},${p.amount},${p.method || 'cash'},${p.note || ''}`).join('\n');
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
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header / Stats Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-4">
                 <div className="bg-emerald-500 p-8 rounded-[2.5rem] shadow-glow/10 text-white relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 h-48 w-48 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
                     <p className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-70">Total Revenue</p>
                    <h2 className="text-4xl font-black tracking-tight">₹{stats.revenue?.toLocaleString() || 0}</h2>
                    <div className="mt-8 flex items-center text-xs font-bold opacity-80 uppercase tracking-widest"><TrendingUp size={14} className="mr-2" /> Inflow Trend: Up 12%</div>
                 </div>
                 <div className="bg-rose-500 p-8 rounded-[2.5rem] shadow-glow/10 text-white relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 h-48 w-48 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-70">Total Expenses</p>
                    <h2 className="text-4xl font-black tracking-tight">₹{stats.expenses?.toLocaleString() || 0}</h2>
                    <div className="mt-8 flex items-center text-xs font-bold opacity-80 uppercase tracking-widest">Outflow Trend: Mid 5%</div>
                 </div>
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium relative overflow-hidden group">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Net Profit</p>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">₹{stats.profit?.toLocaleString() || 0}</h2>
                    <div className="mt-8 flex items-center justify-between">
                         <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-3 py-1 bg-emerald-50 rounded-full ring-4 ring-emerald-50/50">+18% Margin</span>
                         <div className="flex h-8 w-24 bg-slate-50 rounded-full overflow-hidden p-1">
                             <div className="h-full bg-indigo-500 rounded-full" style={{ width: '65%' }}></div>
                         </div>
                    </div>
                 </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-6 md:space-y-0 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mt-12">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-indigo-600/20 transition-all">
                    <Search size={18} className="text-slate-400 mr-2" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search party or reference..." 
                        className="bg-transparent border-none outline-none text-sm w-full font-medium" 
                    />
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={exportCSV} className="flex items-center space-x-2 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-sm font-bold rounded-2xl transition-all">
                        <Download size={18} />
                        <span>Export CSV</span>
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2 px-6 py-3 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-2xl transition-all shadow-glow hover:shadow-black/40 active:scale-95">
                        <Plus size={18} />
                        <span>Record Payment</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] shadow-premium overflow-hidden border border-slate-100/50">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="py-5 px-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Transaction Status</th>
                            <th className="py-5 px-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Channel</th>
                            <th className="py-5 px-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Details / Ref</th>
                            <th className="py-5 px-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Amount</th>
                            <th className="py-5 px-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Slip</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                             [1,2,3].map(i => (
                                <tr key={i} className="animate-pulse px-6 py-10">
                                    <td colSpan="5"><div className="h-8 bg-slate-100 rounded-2xl w-full"></div></td>
                                </tr>
                             ))
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-24 text-center">
                                    <div className="flex flex-col items-center justify-center opacity-40">
                                        <CreditCard size={48} className="text-slate-300 mb-4" />
                                        <h3 className="text-lg font-bold text-slate-900">No transactions recorded</h3>
                                        <p className="text-sm font-medium">Recorded payments will appear here.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((p, i) => (
                                <TransactionCard key={p._id} tx={p} index={i} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Record Payment">
                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Party Type *</label>
                            <select name="partyType" value={formData.partyType} onChange={e => setFormData({...formData, partyType: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20">
                                <option value="client">Client</option>
                                <option value="vendor">Vendor</option>
                                <option value="staff">Staff</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Transaction Type *</label>
                            <select name="type" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20">
                                <option value="incoming">Incoming (Revenue)</option>
                                <option value="outgoing">Outgoing (Expense)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Amount (₹) *</label>
                            <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Payment Method *</label>
                            <select name="method" value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20">
                                <option value="cash">Cash</option>
                                <option value="upi">UPI</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="card">Card</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Note / Reference</label>
                            <input type="text" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20" />
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button type="submit" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-glow hover:shadow-black/40">Save Transaction</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Payments;
