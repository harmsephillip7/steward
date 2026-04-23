import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import axios from 'axios';

// ── Types ────────────────────────────────────────────────────────────────────

export interface OnboardingLink {
  id: string;
  token: string;
  url: string;
  steps: string[];
  completed_steps: string[];
  expires_at: string;
  is_used: boolean;
  completed_at: string | null;
  created_at: string;
  client?: { id: string; first_name: string; last_name: string };
}

export interface OnboardingSession {
  client_name: string;
  steps: string[];
  completed_steps: string[];
  expires_at: string;
}

export const STEP_LABELS: Record<string, string> = {
  kyc: 'Identity Verification (KYC)',
  fica: 'FICA Compliance',
  source_of_wealth: 'Source of Wealth Declaration',
  risk_profile: 'Risk Profile Assessment',
  personal_details: 'Personal Details',
};

// ── Advisor hooks ─────────────────────────────────────────────────────────────

export function useOnboardingLinks() {
  return useQuery<OnboardingLink[]>({
    queryKey: ['onboarding-links'],
    queryFn: () => api.get('/portal/onboarding-links').then(r => r.data),
  });
}

export function useOutstandingSteps(clientId: string | undefined) {
  return useQuery<{ steps: string[] }>({
    queryKey: ['outstanding-steps', clientId],
    queryFn: () => api.get(`/portal/onboarding-links/outstanding/${clientId}`).then(r => r.data),
    enabled: !!clientId,
  });
}

export function useCreateOnboardingLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { client_id: string; steps: string[]; expiry_days?: number }) =>
      api.post<OnboardingLink>('/portal/onboarding-links', payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['onboarding-links'] });
      toast.success('Onboarding link created');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create link';
      toast.error(typeof msg === 'string' ? msg : 'Failed to create link');
    },
  });
}

export function useRevokeOnboardingLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/portal/onboarding-links/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['onboarding-links'] });
      toast.success('Link revoked');
    },
    onError: () => toast.error('Failed to revoke link'),
  });
}

// ── Public (client-facing) hooks ──────────────────────────────────────────────

// Public API instance without auth header
const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
});

export function useOnboardingSession(token: string | undefined) {
  return useQuery<OnboardingSession>({
    queryKey: ['onboarding-session', token],
    queryFn: () => publicApi.get(`/portal/onboarding/${token}`).then(r => r.data),
    enabled: !!token,
    retry: false,
  });
}

export function useSubmitOnboardingStep(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { step: string; data: Record<string, any> }) =>
      publicApi.post(`/portal/onboarding/${token}/submit`, payload).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['onboarding-session', token] }),
    onError: () => toast.error('Failed to submit step. Please try again.'),
  });
}
