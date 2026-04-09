import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface ComplianceRecord {
  id: string;
  client_id: string;
  fica_status?: string;
  fais_status?: string;
  kyc_verified?: boolean;
  last_reviewed?: string;
  notes?: string;
}

export const complianceKeys = {
  byClient: (clientId: string) => ['compliance', clientId] as const,
};

export function useClientCompliance(clientId: string) {
  return useQuery({
    queryKey: complianceKeys.byClient(clientId),
    queryFn: async () => {
      const { data } = await api.get<ComplianceRecord>(`/clients/${clientId}/compliance`);
      return data;
    },
    enabled: !!clientId,
  });
}
