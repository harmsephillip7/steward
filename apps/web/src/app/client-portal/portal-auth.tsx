'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '@/lib/api';

interface PortalUser {
  id: string;
  email: string;
  client_id: string;
  display_name?: string;
}

interface PortalAuthContextType {
  user: PortalUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const PortalAuthContext = createContext<PortalAuthContextType>({
  user: null, token: null, login: async () => {}, logout: () => {}, isLoading: true,
});

export function usePortalAuth() { return useContext(PortalAuthContext); }

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('portal_token') : null;
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('portal_user') : null;
    if (saved && savedUser) {
      setToken(saved);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/portal/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('portal_token', data.token);
    localStorage.setItem('portal_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_user');
  };

  return (
    <PortalAuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </PortalAuthContext.Provider>
  );
}
