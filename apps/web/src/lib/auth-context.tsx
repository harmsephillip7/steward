'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const COOKIE_NAME = 'steward_auth';

export interface Advisor {
  id: string;
  name: string;
  email: string;
  firm_name: string;
  fsp_number?: string | null;
  logo_url?: string | null;
}

interface AuthState {
  advisor: Advisor | null;
  token: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Cookie helpers ─────────────────────────────────────────────────────────
function readCookie(): AuthState {
  try {
    const raw = document.cookie
      .split('; ')
      .find((r) => r.startsWith(COOKIE_NAME + '='))
      ?.split('=')
      .slice(1)
      .join('=');
    if (!raw) return { advisor: null, token: null };
    return JSON.parse(decodeURIComponent(raw)) as AuthState;
  } catch {
    return { advisor: null, token: null };
  }
}

function writeCookie(state: AuthState) {
  const value = encodeURIComponent(JSON.stringify(state));
  // 8-hour session; SameSite=Strict prevents CSRF
  const expires = new Date(Date.now() + 8 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE_NAME}=${value}; path=/; expires=${expires}; SameSite=Strict`;
}

function clearCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
}

// ── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ advisor: null, token: null });
  const router = useRouter();

  // Hydrate from cookie on mount (handles page refresh)
  useEffect(() => {
    const saved = readCookie();
    if (saved.token) setState(saved);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error('Invalid email or password');

    const data = await res.json();
    const next: AuthState = { token: data.access_token, advisor: data.advisor };
    setState(next);
    writeCookie(next);
  }, []);

  const logout = useCallback(() => {
    setState({ advisor: null, token: null });
    clearCookie();
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isAuthenticated: !!state.token }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

// ── Token helper for api.ts (synchronous — no HTTP round-trip) ────────────
export function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const raw = document.cookie
      .split('; ')
      .find((r) => r.startsWith(COOKIE_NAME + '='))
      ?.split('=')
      .slice(1)
      .join('=');
    if (!raw) return null;
    const state = JSON.parse(decodeURIComponent(raw)) as AuthState;
    return state.token ?? null;
  } catch {
    return null;
  }
}
