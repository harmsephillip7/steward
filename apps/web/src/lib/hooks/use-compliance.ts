import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { clientKeys } from './use-clients';

export interface ComplianceStatus {
  passed: boolean;
  failed_checks: string[];
}

export interface UpdateComplianceDto {
  kyc_complete?: boolean;
  fica_complete?: boolean;
  source_of_wealth_declared?: boolean;
  risk_profile?: string;
}

export interface RecordOfAdvice {
  id: string;
  client_id: string;
  advisor_id: string;
  advice_date: string;
  advice_summary: string;
  pdf_url: string | null;
  signed_at: string | null;
  client_signature: string | null;
  created_at: string;
}

export const complianceKeys = {
  byClient: (clientId: string) => ['compliance', clientId] as const,
  roa: (clientId: string) => ['roa', clientId] as const,
};

export function useClientCompliance(clientId: string) {
  return useQuery({
    queryKey: complianceKeys.byClient(clientId),
    queryFn: async () => {
      const { data } = await api.get<ComplianceStatus>(`/clients/${clientId}/compliance`);
      return data;
    },
    enabled: !!clientId,
  });
}

export function useUpdateCompliance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clientId, dto }: { clientId: string; dto: UpdateComplianceDto }) => {
      const { data } = await api.patch(`/clients/${clientId}/compliance`, dto);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.byClient(variables.clientId) });
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(variables.clientId) });
      toast.success('Compliance updated');
    },
    onError: () => {
      toast.error('Failed to update compliance');
    },
  });
}

export function useROAHistory(clientId: string) {
  return useQuery({
    queryKey: complianceKeys.roa(clientId),
    queryFn: async () => {
      const { data } = await api.get<RecordOfAdvice[]>(`/compliance/roa/client/${clientId}`);
      return data;
    },
    enabled: !!clientId,
  });
}

export function useCreateROA() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ client_id, advice_summary }: { client_id: string; advice_summary: string }) => {
      const { data } = await api.post<RecordOfAdvice>('/compliance/roa', { client_id, advice_summary });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.roa(variables.client_id) });
      toast.success('Record of Advice created');
    },
    onError: () => {
      toast.error('Failed to create Record of Advice');
    },
  });
}

export function useSignROA() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ roaId }: { roaId: string; clientId: string }) => {
      const { data } = await api.patch<RecordOfAdvice>(`/compliance/roa/${roaId}/sign`, {});
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.roa(variables.clientId) });
      toast.success('Record of Advice signed');
    },
    onError: () => {
      toast.error('Failed to sign Record of Advice');
    },
  });
}
