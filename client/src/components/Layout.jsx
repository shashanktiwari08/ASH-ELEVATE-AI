import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { Menu, X } from 'lucide-react';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            {/* Mobile Menu Button */}
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed top-6 right-6 z-[60] p-3 bg-slate-900 text-white rounded-full shadow-lg active:scale-95 transition-transform"
            >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            {/* Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 w-full min-h-screen lg:min-w-0 overflow-x-hidden px-4 sm:px-8 lg:px-10 py-6 transition-all duration-300 scroll-smooth">
                <TopNav />
                {children}
            </main>
        </div>
    );
};

export default Layout;
