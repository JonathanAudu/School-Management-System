'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from '../lib/axios';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'staff' | 'student' | 'parent' | 'teacher';
    profile_picture?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isLoading: true,
    login: () => {},
    logout: () => {},
    updateUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const tokenRef = useRef<string | null>(null);
    useEffect(() => {
        tokenRef.current = token;
    }, [token]);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            axios.get('/api/user', {
                headers: { Authorization: `Bearer ${storedToken}` }
            })
            .then(res => {
                const userData = res.data;
                if (userData && userData.role === 'teacher') {
                    userData.role = 'staff';
                }
                setUser(userData);
            })
            .catch(() => {
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            })
            .finally(() => {
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        const userToSet = { ...newUser };
        if (userToSet.role === 'teacher') {
            userToSet.role = 'staff';
        }
        setUser(userToSet);
    };

    const logout = useCallback(() => {
        if (tokenRef.current) {
            axios.post('/api/logout', {}, {
                headers: { Authorization: `Bearer ${tokenRef.current}` }
            }).catch(console.error);
        }
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    }, []);

    const updateUser = (updatedUser: User) => {
        const userToSet = { ...updatedUser };
        if (userToSet.role === 'teacher') {
            userToSet.role = 'staff';
        }
        setUser(userToSet);
    };

    // Inactivity timeout logic
    useEffect(() => {
        let lastActivity = Date.now();
        let intervalId: NodeJS.Timeout;
        const INACTIVITY_LIMIT = 3 * 60 * 60 * 1000; // 3 hours in ms

        const handleActivity = () => {
            lastActivity = Date.now();
        };

        // Attach event listeners for activity
        if (typeof window !== 'undefined') {
            window.addEventListener('mousemove', handleActivity);
            window.addEventListener('keydown', handleActivity);
            window.addEventListener('scroll', handleActivity);
            window.addEventListener('click', handleActivity);

            intervalId = setInterval(() => {
                if (tokenRef.current && Date.now() - lastActivity >= INACTIVITY_LIMIT) {
                    logout();
                }
            }, 60000); // Check every minute
        }

        return () => {
            if (typeof window !== 'undefined') {
                clearInterval(intervalId);
                window.removeEventListener('mousemove', handleActivity);
                window.removeEventListener('keydown', handleActivity);
                window.removeEventListener('scroll', handleActivity);
                window.removeEventListener('click', handleActivity);
            }
        };
    }, [logout]);

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
