import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CompanyProvider } from './contexts/CompanyContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Vendors from './pages/Vendors';
import Staff from './pages/Staff';
import StaffDetails from './pages/StaffDetails';
import StaffAssignments from './pages/StaffAssignments';
import Bookings from './pages/Bookings';
import Payments from './pages/Payments';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import SystemAccess from './pages/SystemAccess';
import Login from './pages/Login';
import { Toaster } from 'react-hot-toast';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="h-screen w-screen bg-slate-50 flex items-center justify-center font-black text-accent text-3xl animate-pulse tracking-tighter">ASH <span className="text-slate-900 underline">ELEVATE AI</span></div>;
    return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

const App = () => {
    return (
        <AuthProvider>
            <CompanyProvider>
                <Toaster position="top-right" reverseOrder={false} />
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                        <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
                        <Route path="/vendors" element={<PrivateRoute><Vendors /></PrivateRoute>} />
                        <Route path="/staff" element={<PrivateRoute><Staff /></PrivateRoute>} />
                        <Route path="/staff/:id" element={<PrivateRoute><StaffDetails /></PrivateRoute>} />
                        <Route path="/staff/assignments" element={<PrivateRoute><StaffAssignments /></PrivateRoute>} />
                        <Route path="/bookings" element={<PrivateRoute><Bookings /></PrivateRoute>} />
                        <Route path="/payments" element={<PrivateRoute><Payments /></PrivateRoute>} />
                        <Route path="/invoices" element={<PrivateRoute><Invoices /></PrivateRoute>} />
                        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
                        <Route path="/system-access" element={<PrivateRoute><SystemAccess /></PrivateRoute>} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Router>
            </CompanyProvider>
        </AuthProvider>
    );
};

export default App;
