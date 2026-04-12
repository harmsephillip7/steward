import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';

export interface CategoryExposure {
  category: string;
  exposure_pct: number;
  affected_funds_count: number;
  affected_funds?: any;
  flagged_companies?: any;
}

export interface FundScreeningResult {
  fund_id: string;
  fund_name: string;
  clean_pct: number;
  compromised_pct: number;
  by_category: CategoryExposure[];
  flagged_holdings_count: number;
}

export interface ScreeningResult {
  id: string;
  portfolio_id: string;
  mode: 'strict' | 'weighted';
  clean_pct: number;
  compromised_pct: number;
  passed_strict_mode: boolean;
  report_json: { fund_results: FundScreeningResult[] };
  category_exposures: CategoryExposure[];
  created_at: string;
}

export interface PortfolioScreeningResult {
  portfolio_id: string;
  mode: 'strict' | 'weighted';
  clean_pct: number;
  compromised_pct: number;
  by_category: CategoryExposure[];
  fund_results: FundScreeningResult[];
  passed_strict_mode: boolean;
}

export interface ReplacementSuggestion {
  id: string;
  screening_result_id: string;
  original_fund_id: string;
  suggested_fund_id: string;
  reason: string;
  similarity_score: number;
  exposure_reduction_pct: number;
  original_fund?: { id: string; name: string; isin?: string };
  suggested_fund?: { id: string; name: string; isin?: string; ter?: string };
}

export const screeningKeys = {
  result: (portfolioId: string) => ['screening', portfolioId] as const,
  history: (portfolioId: string) => ['screening', 'history', portfolioId] as const,
  replacements: (portfolioId: string) => ['replacements', portfolioId] as const,
};

export function useScreenPortfolio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ portfolioId, mode = 'weighted' }: { portfolioId: string; mode?: 'strict' | 'weighted' }) => {
      const { data } = await api.post<PortfolioScreeningResult>(
        `/screening/portfolio/${portfolioId}?mode=${mode}`,
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: screeningKeys.history(variables.portfolioId) });
      toast.success('Screening analysis complete');
    },
    onError: () => {
      toast.error('Failed to run screening');
    },
  });
}

export function useScreeningHistory(portfolioId: string) {
  return useQuery({
    queryKey: screeningKeys.history(portfolioId),
    queryFn: async () => {
      const { data } = await api.get<ScreeningResult[]>(`/screening/portfolio/${portfolioId}/history`);
      return data;
    },
    enabled: !!portfolioId,
  });
}

export function useFindReplacements() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      portfolioId,
      screeningResultId,
      maxExposurePct = 5,
    }: {
      portfolioId: string;
      screeningResultId: string;
      maxExposurePct?: number;
    }) => {
      const { data } = await api.post<ReplacementSuggestion[]>(
        `/portfolios/${portfolioId}/replacements?screening_result_id=${screeningResultId}&max_exposure_pct=${maxExposurePct}`,
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: screeningKeys.replacements(variables.portfolioId) });
      toast.success('Replacement suggestions generated');
    },
    onError: () => {
      toast.error('Failed to generate replacements');
    },
  });
}
