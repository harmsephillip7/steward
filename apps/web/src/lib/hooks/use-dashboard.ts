import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface DashboardSummary {
  clients: { count: number };
  funds: { count: number };
  portfolios: { count: number; totalAUM: number };
  pipeline: { stage: string; count: number; total_value: number }[];
  tasks: { id: string; title: string; priority: string; due_date: string | null; completed_at: string | null }[];
  commissions: {
    totalReceived: number;
    totalExpected: number;
    totalVAT: number;
    byType: Record<string, number>;
  };
  advisory: { total: number; pending: number; critical: number; implemented: number };
  compliance: {
    pendingReviews: number;
    overdueReviews: number;
    reviewsDue30Days: number;
    openConflicts: number;
    upcomingReturns: number;
  };
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const { data } = await api.get<DashboardSummary>('/dashboard/summary');
      return data;
    },
    staleTime: 60 * 1000,
  });
}
