import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
        withCredentials: true
    });

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await api.get('/auth/me');
                setUser(res.data);
                // If we have a user from session/cookie, ensure header is set if token is present
                if (res.data.token) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
                }
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        setUser(res.data);
        if (res.data.token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        }
        return res.data;
    };

    const register = async (name, email, password, role, businessName) => {
        const res = await api.post('/auth/register', { name, email, password, role, businessName });
        setUser(res.data);
        if (res.data.token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        }
        return res.data;
    };

    const logout = async () => {
        await api.post('/auth/logout');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, api }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
