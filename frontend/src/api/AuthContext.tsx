import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from './api.ts';
import type {AuthResponse, UserProfile} from "./mappers.ts";

interface AuthContextType {
    user: UserProfile | null;
    isAuthenticated: boolean;
    loading: boolean;
    handleAuthSuccess: (data: AuthResponse) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const initAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const userData = await authApi.refresh();
            setUser(userData);
        } catch (error) {
            console.error("Сессия устарела:", error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initAuth();
    }, []);

    const handleAuthSuccess = (data: AuthResponse) => {
        localStorage.setItem('token', data.accessToken);
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, handleAuthSuccess, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};