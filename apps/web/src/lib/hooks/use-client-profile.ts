import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import type {
  ClientFullProfile,
  ClientDependent,
  ClientAssetType,
  ClientLiability,
  ClientInsurancePolicy,
  ClientFinancialGoal,
  ClientLifeEvent,
  ClientIncomeExpense,
  NetWorthSummary,
  CashFlowSummary,
} from '@steward/shared';

export const profileKeys = {
  profile: (id: string) => ['clients', id, 'profile'] as const,
  netWorth: (id: string) => ['clients', id, 'net-worth'] as const,
  cashFlow: (id: string) => ['clients', id, 'cash-flow'] as const,
  dependents: (id: string) => ['clients', id, 'dependents'] as const,
  assets: (id: string) => ['clients', id, 'assets'] as const,
  liabilities: (id: string) => ['clients', id, 'liabilities'] as const,
  insurance: (id: string) => ['clients', id, 'insurance'] as const,
  goals: (id: string) => ['clients', id, 'goals'] as const,
  lifeEvents: (id: string) => ['clients', id, 'life-events'] as const,
  incomeExpenses: (id: string) => ['clients', id, 'income-expenses'] as const,
};

export function useClientProfile(id: string) {
  return useQuery({
    queryKey: profileKeys.profile(id),
    queryFn: async () => {
      const { data } = await api.get<ClientFullProfile>(`/clients/${id}/profile`);
      return data;
    },
    enabled: !!id,
  });
}

export function useNetWorth(id: string) {
  return useQuery({
    queryKey: profileKeys.netWorth(id),
    queryFn: async () => {
      const { data } = await api.get<NetWorthSummary>(`/clients/${id}/net-worth`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCashFlow(id: string) {
  return useQuery({
    queryKey: profileKeys.cashFlow(id),
    queryFn: async () => {
      const { data } = await api.get<CashFlowSummary>(`/clients/${id}/cash-flow`);
      return data;
    },
    enabled: !!id,
  });
}

// ── Mutation factories ─────────────────────────────────────────────

function useSubEntityMutation<TDto>(
  clientId: string,
  endpoint: string,
  queryKey: readonly unknown[],
  successMsg: string,
) {
  const qc = useQueryClient();
  return {
    add: useMutation({
      mutationFn: async (dto: TDto) => {
        const { data } = await api.post(`/clients/${clientId}/${endpoint}`, dto);
        return data;
      },
      onSuccess: () => { qc.invalidateQueries({ queryKey }); qc.invalidateQueries({ queryKey: profileKeys.profile(clientId) }); toast.success(successMsg + ' added'); },
      onError: () => { toast.error('Failed to add ' + successMsg.toLowerCase()); },
    }),
    remove: useMutation({
      mutationFn: async (itemId: string) => {
        await api.delete(`/clients/${clientId}/${endpoint}/${itemId}`);
      },
      onSuccess: () => { qc.invalidateQueries({ queryKey }); qc.invalidateQueries({ queryKey: profileKeys.profile(clientId) }); toast.success(successMsg + ' removed'); },
      onError: () => { toast.error('Failed to remove ' + successMsg.toLowerCase()); },
    }),
    update: useMutation({
      mutationFn: async ({ itemId, dto }: { itemId: string; dto: Partial<TDto> }) => {
        const { data } = await api.patch(`/clients/${clientId}/${endpoint}/${itemId}`, dto);
        return data;
      },
      onSuccess: () => { qc.invalidateQueries({ queryKey }); qc.invalidateQueries({ queryKey: profileKeys.profile(clientId) }); toast.success(successMsg + ' updated'); },
      onError: () => { toast.error('Failed to update ' + successMsg.toLowerCase()); },
    }),
  };
}

export function useDependents(clientId: string) {
  const query = useQuery({
    queryKey: profileKeys.dependents(clientId),
    queryFn: async () => { const { data } = await api.get<ClientDependent[]>(`/clients/${clientId}/dependents`); return data; },
    enabled: !!clientId,
  });
  const mutations = useSubEntityMutation<any>(clientId, 'dependents', profileKeys.dependents(clientId), 'Dependent');
  return { ...query, ...mutations };
}

export function useClientAssets(clientId: string) {
  const query = useQuery({
    queryKey: profileKeys.assets(clientId),
    queryFn: async () => { const { data } = await api.get<ClientAssetType[]>(`/clients/${clientId}/assets`); return data; },
    enabled: !!clientId,
  });
  const mutations = useSubEntityMutation<any>(clientId, 'assets', profileKeys.assets(clientId), 'Asset');
  return { ...query, ...mutations };
}

export function useClientLiabilities(clientId: string) {
  const query = useQuery({
    queryKey: profileKeys.liabilities(clientId),
    queryFn: async () => { const { data } = await api.get<ClientLiability[]>(`/clients/${clientId}/liabilities`); return data; },
    enabled: !!clientId,
  });
  const mutations = useSubEntityMutation<any>(clientId, 'liabilities', profileKeys.liabilities(clientId), 'Liability');
  return { ...query, ...mutations };
}

export function useClientInsurance(clientId: string) {
  const query = useQuery({
    queryKey: profileKeys.insurance(clientId),
    queryFn: async () => { const { data } = await api.get<ClientInsurancePolicy[]>(`/clients/${clientId}/insurance`); return data; },
    enabled: !!clientId,
  });
  const mutations = useSubEntityMutation<any>(clientId, 'insurance', profileKeys.insurance(clientId), 'Insurance policy');
  return { ...query, ...mutations };
}

export function useClientGoals(clientId: string) {
  const query = useQuery({
    queryKey: profileKeys.goals(clientId),
    queryFn: async () => { const { data } = await api.get<ClientFinancialGoal[]>(`/clients/${clientId}/goals`); return data; },
    enabled: !!clientId,
  });
  const mutations = useSubEntityMutation<any>(clientId, 'goals', profileKeys.goals(clientId), 'Goal');
  return { ...query, ...mutations };
}

export function useClientLifeEvents(clientId: string) {
  const query = useQuery({
    queryKey: profileKeys.lifeEvents(clientId),
    queryFn: async () => { const { data } = await api.get<ClientLifeEvent[]>(`/clients/${clientId}/life-events`); return data; },
    enabled: !!clientId,
  });
  const mutations = useSubEntityMutation<any>(clientId, 'life-events', profileKeys.lifeEvents(clientId), 'Life event');
  return { ...query, ...mutations };
}

export function useClientIncomeExpenses(clientId: string) {
  const query = useQuery({
    queryKey: profileKeys.incomeExpenses(clientId),
    queryFn: async () => { const { data } = await api.get<ClientIncomeExpense[]>(`/clients/${clientId}/income-expenses`); return data; },
    enabled: !!clientId,
  });
  const mutations = useSubEntityMutation<any>(clientId, 'income-expenses', profileKeys.incomeExpenses(clientId), 'Income/expense');
  return { ...query, ...mutations };
}

export function useUpdateClient(clientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: Record<string, any>) => {
      const { data } = await api.patch(`/clients/${clientId}`, dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.profile(clientId) });
      qc.invalidateQueries({ queryKey: ['clients', clientId] });
      toast.success('Client updated');
    },
    onError: () => { toast.error('Failed to update client'); },
  });
}
