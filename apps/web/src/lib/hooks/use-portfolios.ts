import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';

export interface Portfolio {
  id: string;
  name: string;
  client_id: string;
  value?: number;
  inception_date?: string;
  mandate_type?: string;
  created_at: string;
}

export interface CreatePortfolioDto {
  name: string;
  client_id: string;
  mandate_type?: string;
  inception_date?: string;
}

export const portfolioKeys = {
  all: ['portfolios'] as const,
  detail: (id: string) => ['portfolios', id] as const,
  byClient: (clientId: string) => ['portfolios', 'client', clientId] as const,
};

export function usePortfolios() {
  return useQuery({
    queryKey: portfolioKeys.all,
    queryFn: async () => {
      const { data } = await api.get<Portfolio[]>('/portfolios');
      return data;
    },
  });
}

export function useClientPortfolios(clientId: string) {
  return useQuery({
    queryKey: portfolioKeys.byClient(clientId),
    queryFn: async () => {
      const { data } = await api.get<Portfolio[]>(`/portfolios/client/${clientId}`);
      return data;
    },
    enabled: !!clientId,
  });
}

export function useCreatePortfolio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreatePortfolioDto) => {
      const { data } = await api.post<Portfolio>('/portfolios', dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.all });
      toast.success('Portfolio created successfully');
    },
    onError: () => {
      toast.error('Failed to create portfolio');
    },
  });
}
