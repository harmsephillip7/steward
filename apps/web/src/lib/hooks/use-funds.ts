import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface AiScreeningStatus {
  fund_id: string;
  fund_name: string;
  ai_flags: number;
  manual_flags: number;
}

export interface Fund {
  id: string;
  name: string;
  isin?: string;
  provider?: string;
  asset_class?: string;
  region?: string;
  benchmark?: string;
  ter?: string; // PostgreSQL decimal returns as string
  esg_score?: number;
  christian_screen_pass?: boolean;
  morningstar_rating?: number;
  inception_date?: string;
  fact_sheet_url?: string | null;
  holdings_count?: number;
  created_at: string;
  updated_at: string;
}

export const fundKeys = {
  all: ['funds'] as const,
  detail: (id: string) => ['funds', id] as const,
  holdings: (id: string) => ['funds', id, 'holdings'] as const,
  aiStatus: ['ai-screening-status'] as const,
};

export function useFunds() {
  return useQuery({
    queryKey: fundKeys.all,
    queryFn: async () => {
      const { data } = await api.get<Fund[]>('/funds');
      return data;
    },
  });
}

export function useFund(id: string) {
  return useQuery({
    queryKey: fundKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<Fund>(`/funds/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useFundHoldings(id: string) {
  return useQuery({
    queryKey: fundKeys.holdings(id),
    queryFn: async () => {
      const { data } = await api.get(`/funds/${id}/holdings`);
      return data;
    },
    enabled: !!id,
  });
}

export function useAiScreeningStatus() {
  return useQuery({
    queryKey: fundKeys.aiStatus,
    queryFn: async () => {
      const { data } = await api.get<AiScreeningStatus[]>('/ai-screening/status');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
