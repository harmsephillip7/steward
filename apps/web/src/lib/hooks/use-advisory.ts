import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { AdvisoryRecommendationType, AdvisoryDashboard } from '@steward/shared';

export const advisoryKeys = {
  dashboard: ['advisory', 'dashboard'] as const,
  byClient: (clientId: string) => ['advisory', 'client', clientId] as const,
};

export function useAdvisoryDashboard() {
  return useQuery({
    queryKey: advisoryKeys.dashboard,
    queryFn: async () => {
      const { data } = await api.get<AdvisoryDashboard>('/advisory/dashboard');
      return data;
    },
    staleTime: 3 * 60 * 1000,
  });
}

export function useClientAdvisory(clientId: string, status?: string) {
  return useQuery({
    queryKey: [...advisoryKeys.byClient(clientId), status],
    queryFn: async () => {
      const params = status ? `?status=${status}` : '';
      const { data } = await api.get<AdvisoryRecommendationType[]>(`/clients/${clientId}/advisory${params}`);
      return data;
    },
    enabled: !!clientId,
  });
}

export function useGenerateAdvisory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { client_id: string; focus_area?: string }) => {
      const { data } = await api.post('/advisory/generate', dto);
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: advisoryKeys.byClient(vars.client_id) });
      qc.invalidateQueries({ queryKey: advisoryKeys.dashboard });
      toast.success('Advisory recommendations generated');
    },
    onError: () => toast.error('Failed to generate recommendations'),
  });
}

export function useUpdateRecommendation(clientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...dto }: { id: string; status?: string; dismiss_reason?: string; action_items?: any[] }) => {
      const { data } = await api.patch(`/advisory/${id}`, dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: advisoryKeys.byClient(clientId) });
      qc.invalidateQueries({ queryKey: advisoryKeys.dashboard });
      toast.success('Recommendation updated');
    },
  });
}
