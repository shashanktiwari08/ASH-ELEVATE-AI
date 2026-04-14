import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Plus, Search, FileText, Download, Share2,
    CheckCircle2, Clock, AlertCircle, User,
    ArrowUpRight, MessageCircle, Wallet
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const InvoiceCard = ({ invoice, index, onStatusUpdate }) => {
    const { api } = useAuth();
    
    const shareToWhatsApp = () => {
        const text = `Hi ${invoice.client?.name}, your invoice ${invoice.invoiceNumber} for ₹${invoice.totalAmount} is ready.`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const downloadPDF = () => {
        // Use the API baseURL to construct the PDF link
        const baseUrl = api.defaults.baseURL.replace('/api', '');
        window.open(`${baseUrl}/api/invoices/${invoice._id}/pdf`, '_blank');
    };

    const markAsPaid = async () => {
        try {
            await api.patch(`/invoices/${invoice._id}/status`, { status: 'paid' });
            toast.success('Invoice marked as paid');
            onStatusUpdate();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:border-accent hover:shadow-premium transition-all overflow-hidden"
        >
            <div className={`absolute top-0 right-0 px-6 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-white ${
                invoice.status === 'paid' ? 'bg-emerald-500 shadow-glow/20' : 'bg-rose-500'
            }`}>
                {invoice.status}
            </div>
            
            <div className="flex items-center space-x-4 mb-6 pt-4">
                <div className="h-14 w-14 rounded-[1.25rem] bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <FileText size={28} />
                </div>
                <div>
                   <h3 className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tighter">{invoice.invoiceNumber}</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{format(new Date(invoice.issueDate || Date.now()), 'dd MMM yyyy')}</p>
                </div>
            </div>

            <div className="space-y-4 mb-8 bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                <div className="flex items-center text-xs font-bold text-slate-600">
                    <User size={14} className="mr-3 text-slate-400" />
                    <span className="truncate">{invoice.client?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center text-xs font-bold text-slate-600">
                    <ArrowUpRight size={14} className="mr-3 text-slate-400" />
                    <span className="truncate">{invoice.client?.companyName || 'Individual'}</span>
                </div>
            </div>

            <div className="flex items-center justify-between mb-8 px-2">
                <div>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Grand Total</p>
                   <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{invoice.totalAmount?.toLocaleString()}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Type</p>
                   <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest px-2 py-1 bg-indigo-50 rounded-md">GST 18%</p>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <button 
                    onClick={downloadPDF}
                    className="flex-1 px-4 py-3.5 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-95"
                >
                    <Download size={14} />
                    <span>PDF</span>
                </button>
                {invoice.status !== 'paid' && (
                    <button 
                        onClick={markAsPaid}
                        className="p-3.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all shadow-sm group-hover:shadow-emerald-200"
                        title="Mark as Paid"
                    >
                        <Wallet size={18} />
                    </button>
                )}
                <button 
                    onClick={shareToWhatsApp}
                    className="p-3.5 bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-2xl transition-all shadow-sm"
                    title="Share to WhatsApp"
                >
                    <MessageCircle size={18} />
                </button>
            </div>
        </motion.div>
    );
};

const Invoices = () => {
    const { api } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchInvoices = async () => {
        try {
            const res = await api.get('/invoices');
            setInvoices(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [api]);

    const filtered = invoices.filter(inv => 
        inv.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.client?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = invoices.reduce((acc, inv) => {
        if (inv.status === 'paid') acc.paid += inv.totalAmount;
        else acc.pending += inv.totalAmount;
        return acc;
    }, { paid: 0, pending: 0 });

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-6 md:space-y-0 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                <div className="flex items-center space-x-6">
                    <div className="p-5 bg-accent/10 rounded-[1.5rem] text-accent">
                       <FileText size={36} />
                    </div>
                    <div>
                       <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial <span className="text-accent underline decoration-accent/20">Archive</span></h1>
                       <p className="text-slate-500 font-medium mt-1">Legally compliant GST invoices and billing history.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 px-8 py-4 bg-slate-900 hover:bg-black text-white text-[10px] font-black rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-widest">
                        <Plus size={18} />
                        <span>Manual Invoice</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100 gap-4">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 w-full md:w-96 focus-within:ring-2 focus-within:ring-accent/20 transition-all">
                    <Search size={18} className="text-slate-400 mr-2" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter by ID or client..." 
                        className="bg-transparent border-none outline-none text-sm w-full font-bold text-slate-700 placeholder:text-slate-400" 
                    />
                </div>
                <div className="flex items-center space-x-4">
                    <div className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl flex flex-col items-end">
                         <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Revenue Secured</span>
                         <span className="text-xs font-black">₹{stats.paid.toLocaleString()}</span>
                    </div>
                    <div className="px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl flex flex-col items-end">
                         <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Outstanding</span>
                         <span className="text-xs font-black">₹{stats.pending.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {loading ? (
                    [1,2,3,4].map(i => (
                        <div key={i} className="animate-pulse bg-white h-72 rounded-[2.5rem] border border-slate-100 p-8">
                            <div className="h-10 bg-slate-100 rounded-2xl w-1/2 mb-6"></div>
                            <div className="h-20 bg-slate-100 rounded-2xl w-full"></div>
                        </div>
                    ))
                ) : filtered.length === 0 ? (
                    <div className="col-span-full py-32 text-center">
                        <div className="inline-flex flex-col items-center justify-center opacity-20">
                            <FileText size={80} className="text-slate-200 mb-6" />
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">No Match Found</h3>
                            <p className="text-sm font-medium text-slate-500 mt-2">Try searching with a different term or ID.</p>
                        </div>
                    </div>
                ) : (
                    filtered.map((inv, i) => (
                        <InvoiceCard key={inv._id} invoice={inv} index={i} onStatusUpdate={fetchInvoices} />
                    ))
                )}
            </div>
        </div>
    );
};

export default Invoices;
