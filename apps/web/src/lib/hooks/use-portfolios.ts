import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { Portfolio, CreatePortfolioDto, PortfolioFundAllocation } from '@steward/shared';

export type { Portfolio, CreatePortfolioDto, PortfolioFundAllocation };

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

export function usePortfolio(id: string) {
  return useQuery({
    queryKey: portfolioKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<Portfolio>(`/portfolios/${id}`);
      return data;
    },
    enabled: !!id,
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
