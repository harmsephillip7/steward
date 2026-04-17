import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { CommissionRecord, CommissionSummary, IntegrationRecord } from '@steward/shared';

export const commKeys = {
  all: ['commissions'] as const,
  summary: (year?: number) => ['commissions', 'summary', year] as const,
  integrations: ['integrations'] as const,
};

export function useCommissions(status?: string) {
  return useQuery({
    queryKey: [...commKeys.all, { status }],
    queryFn: async () => {
      const params = status ? `?status=${status}` : '';
      const { data } = await api.get<CommissionRecord[]>(`/commissions${params}`);
      return data;
    },
  });
}

export function useCommissionSummary(year?: number) {
  return useQuery({
    queryKey: commKeys.summary(year),
    queryFn: async () => {
      const params = year ? `?year=${year}` : '';
      const { data } = await api.get<CommissionSummary>(`/commissions/summary${params}`);
      return data;
    },
    staleTime: 3 * 60 * 1000,
  });
}

export function useCreateCommission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: Partial<CommissionRecord>) => {
      const { data } = await api.post<CommissionRecord>('/commissions', dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commKeys.all });
      qc.invalidateQueries({ queryKey: commKeys.summary() });
      toast.success('Commission recorded');
    },
    onError: () => toast.error('Failed to record commission'),
  });
}

export function useUpdateCommission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...dto }: { id: string } & Partial<CommissionRecord>) => {
      const { data } = await api.patch(`/commissions/${id}`, dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commKeys.all });
      qc.invalidateQueries({ queryKey: commKeys.summary() });
      toast.success('Commission updated');
    },
  });
}

export function useIntegrations() {
  return useQuery({
    queryKey: commKeys.integrations,
    queryFn: async () => {
      const { data } = await api.get<IntegrationRecord[]>('/integrations');
      return data;
    },
  });
}

export function useCreateIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: Partial<IntegrationRecord>) => {
      const { data } = await api.post<IntegrationRecord>('/integrations', dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commKeys.integrations });
      toast.success('Integration created');
    },
  });
}
