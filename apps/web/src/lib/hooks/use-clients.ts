import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';

export interface Client {
  id: string;
  advisor_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  id_number?: string;
  dob?: string;
  risk_profile?: string;
  tax_number?: string;
  tax_residency?: string;
  kyc_complete: boolean;
  fica_complete: boolean;
  source_of_wealth_declared: boolean;
  risk_profile_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientPortfolio {
  id: string;
  client_id: string;
  name: string;
  total_value: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface RecordOfAdvice {
  id: string;
  client_id: string;
  advisor_id: string;
  advice_date: string;
  advice_summary: string;
  pdf_url: string | null;
  signed_at: string | null;
  created_at: string;
}

export interface ClientDetail extends Client {
  portfolios: ClientPortfolio[];
  records_of_advice: RecordOfAdvice[];
}

export interface CreateClientDto {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  id_number?: string;
  date_of_birth?: string;
  risk_profile?: string;
  tax_number?: string;
}

export const clientKeys = {
  all: ['clients'] as const,
  detail: (id: string) => ['clients', id] as const,
};

export function useClients() {
  return useQuery({
    queryKey: clientKeys.all,
    queryFn: async () => {
      const { data } = await api.get<Client[]>('/clients');
      return data;
    },
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<ClientDetail>(`/clients/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateClientDto) => {
      const { data } = await api.post<Client>('/clients', dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      toast.success('Client created successfully');
    },
    onError: () => {
      toast.error('Failed to create client');
    },
  });
}
