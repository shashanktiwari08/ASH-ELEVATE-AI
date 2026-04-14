import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
    Mail, 
    Lock, 
    ArrowRight, 
    Loader2,
    ShieldCheck,
    Briefcase,
    Users,
    Building2,
    UserCheck,
    Phone,
    KeyRound,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userType, setUserType] = useState('Admin');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [serviceBoyId, setServiceBoyId] = useState('');
    const [pin, setPin] = useState('');
    const { login, register, user, setUser, api } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user) navigate('/');
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (userType === 'Admin') {
                if (isRegistering) {
                    await register(name, email, password, 'admin', businessName);
                    toast.success('Your business is registered!');
                } else {
                    await login(email, password);
                    toast.success('Welcome back!');
                }
            } else {
                // PIN Login for others
                const res = await api.post('/auth/verify-pin', {
                    userType,
                    phoneNumber,
                    pin,
                    serviceBoyId: userType === 'ServiceBoy' ? serviceBoyId : undefined
                });
                
                // Update local state and headers
                const userData = res.data;
                setUser(userData);
                if (userData.token) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
                }
                
                toast.success(`Welcome ${userData.name}!`);
            }
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-inter">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 right-0 h-96 w-96 bg-accent/20 blur-[120px] rounded-full -mr-48 -mt-48 transition-all"></div>
            <div className="absolute bottom-0 left-0 h-[600px] w-[600px] bg-primary-800/10 blur-[150px] rounded-full -ml-80 -mb-80 transition-all"></div>
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg glass-dark p-10 rounded-[3rem] shadow-2xl relative z-10 border-slate-800/50"
            >
                {/* Header / Logo */}
                <div className="mb-10 text-center">
                    <img src="/logo.png" alt="ASH ELEVATE AI" className="h-24 w-24 mx-auto mb-6 drop-shadow-glow animate-float" />
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase">
                        ASH <span className="text-accent underline decoration-amber-200">ELEVATE AI</span>
                    </h1>
                    <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase">
                        {isRegistering ? 'Start your registration' : 'Intelligent Business Management'}
                    </p>
                </div>

                {/* User Type Selection */}
                {!isRegistering && (
                    <div className="mb-8">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 mb-4 block">
                            Login As
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setUserType('Admin')}
                                className={`p-4 rounded-2xl border-2 transition-all ${userType === 'Admin' ? 'border-accent bg-accent/10' : 'border-slate-800 hover:border-slate-700'}`}
                            >
                                <ShieldCheck className={`mx-auto mb-2 ${userType === 'Admin' ? 'text-accent' : 'text-slate-500'}`} size={24} />
                                <span className={`font-bold text-sm ${userType === 'Admin' ? 'text-white' : 'text-slate-400'}`}>Admin</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setUserType('Client')}
                                className={`p-4 rounded-2xl border-2 transition-all ${userType === 'Client' ? 'border-accent bg-accent/10' : 'border-slate-800 hover:border-slate-700'}`}
                            >
                                <Users className={`mx-auto mb-2 ${userType === 'Client' ? 'text-accent' : 'text-slate-500'}`} size={24} />
                                <span className={`font-bold text-sm ${userType === 'Client' ? 'text-white' : 'text-slate-400'}`}>Client</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setUserType('Vendor')}
                                className={`p-4 rounded-2xl border-2 transition-all ${userType === 'Vendor' ? 'border-accent bg-accent/10' : 'border-slate-800 hover:border-slate-700'}`}
                            >
                                <Building2 className={`mx-auto mb-2 ${userType === 'Vendor' ? 'text-accent' : 'text-slate-500'}`} size={24} />
                                <span className={`font-bold text-sm ${userType === 'Vendor' ? 'text-white' : 'text-slate-400'}`}>Vendor</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setUserType('ServiceBoy')}
                                className={`p-4 rounded-2xl border-2 transition-all ${userType === 'ServiceBoy' ? 'border-accent bg-accent/10' : 'border-slate-800 hover:border-slate-700'}`}
                            >
                                <UserCheck className={`mx-auto mb-2 ${userType === 'ServiceBoy' ? 'text-accent' : 'text-slate-500'}`} size={24} />
                                <span className={`font-bold text-sm ${userType === 'ServiceBoy' ? 'text-white' : 'text-slate-400'}`}>Service Boy</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {userType === 'Admin' || isRegistering ? (
                        <>
                            {isRegistering && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Business Name</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-accent transition-colors">
                                                <Briefcase size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                value={businessName}
                                                onChange={(e) => setBusinessName(e.target.value)}
                                                className="block w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all font-medium"
                                                placeholder="Tiwari Events Pvt Ltd"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Your Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-accent transition-colors">
                                                <ShieldCheck size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="block w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all font-medium"
                                                placeholder="Shashank Tiwari"
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-accent transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all font-medium"
                                        placeholder="name@company.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Password</label>
                                    {!isRegistering && (
                                        <a href="#" className="text-xs font-bold text-accent hover:text-white transition-colors">Forgot Password?</a>
                                    )}
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-accent transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all font-medium"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {userType === 'ServiceBoy' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Service Boy ID</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-accent transition-colors">
                                            <UserCheck size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={serviceBoyId}
                                            onChange={(e) => setServiceBoyId(e.target.value)}
                                            className="block w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all font-medium"
                                            placeholder="SB0001"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-accent transition-colors">
                                        <Phone size={18} />
                                    </div>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all font-medium"
                                        placeholder="9876543210"
                                        required={userType !== 'ServiceBoy' || !serviceBoyId}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Secure PIN</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-accent transition-colors">
                                        <KeyRound size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                                        maxLength={4}
                                        className="block w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all font-medium tracking-[0.5em] text-lg"
                                        placeholder="••••"
                                        required
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 ml-1">Enter the 4-digit PIN assigned by your administrator.</p>
                            </div>
                        </>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-accent hover:bg-amber-600 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center space-x-2 transition-all transform active:scale-95 shadow-glow hover:shadow-accent/40 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>{userType === 'Admin' && isRegistering ? 'Create Account' : 'Secure Login'}</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </div>

                    {userType === 'Admin' && (
                        <div className="text-center pt-4">
                            <button 
                                type="button"
                                onClick={() => setIsRegistering(!isRegistering)}
                                className="text-xs font-bold text-slate-500 hover:text-accent transition-colors"
                            >
                                {isRegistering ? 'Already have an account? Sign In.' : "Don't have an account? Sign up your business."}
                            </button>
                        </div>
                    )}
                </form>

                <div className="flex items-center justify-center space-x-2 pt-6">
                    <ShieldCheck size={14} className="text-slate-600" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pt-0.5">Secure Encrypted Session</span>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
