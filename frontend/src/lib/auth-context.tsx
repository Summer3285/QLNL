'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '../types/index';
import { api } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isHR: boolean;
  isEmployee: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const res = await api.get<User>('/api/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('nexnova_auth_user', JSON.stringify(res.data));
      }
    } catch (err: any) {
      // Token expired or invalid — clear stale session
      console.error('Session expired or invalid, logging out.', err);
      setUser(null);
      setToken(null);
      localStorage.removeItem('nexnova_auth_token');
      localStorage.removeItem('nexnova_auth_user');
      router.push('/login');
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('nexnova_auth_token');
    const savedUser = localStorage.getItem('nexnova_auth_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify token is still valid with the backend
        refreshUser().finally(() => setIsLoading(false));
        return;
      } catch (e) {
        console.error('Error parsing stored session', e);
        localStorage.removeItem('nexnova_auth_token');
        localStorage.removeItem('nexnova_auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, passwordPlain: string) => {
    setIsLoading(true);
    try {
      const res = await api.post<{ token: string; user: User }>('/api/auth/login', {
        email,
        password: passwordPlain,
      });

      if (res.success && res.data) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('nexnova_auth_token', res.data.token);
        localStorage.setItem('nexnova_auth_user', JSON.stringify(res.data.user));
        router.push('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nexnova_auth_token');
    localStorage.removeItem('nexnova_auth_user');
    router.push('/login');
  };

  const role = user?.role;
  const isAdmin = role === 'ADMIN';
  const isHR = role === 'HR_MANAGER' || isAdmin;
  const isEmployee = role === 'EMPLOYEE';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        isHR,
        isEmployee,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
