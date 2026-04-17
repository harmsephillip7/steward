import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { ComplianceReviewType, ConflictOfInterestType, RegulatoryReturnType2, ComplianceDashboard } from '@steward/shared';

export const enhancedCompKeys = {
  dashboard: ['compliance', 'dashboard'] as const,
  reviews: ['compliance', 'reviews'] as const,
  overdue: ['compliance', 'reviews', 'overdue'] as const,
  conflicts: ['compliance', 'conflicts'] as const,
  returns: ['compliance', 'returns'] as const,
};

export function useComplianceDashboard() {
  return useQuery({
    queryKey: enhancedCompKeys.dashboard,
    queryFn: async () => {
      const { data } = await api.get<ComplianceDashboard>('/compliance/dashboard');
      return data;
    },
  });
}

export function useComplianceReviews(clientId?: string) {
  return useQuery({
    queryKey: [...enhancedCompKeys.reviews, { clientId }],
    queryFn: async () => {
      const params = clientId ? `?client_id=${clientId}` : '';
      const { data } = await api.get<ComplianceReviewType[]>(`/compliance/reviews${params}`);
      return data;
    },
  });
}

export function useOverdueReviews() {
  return useQuery({
    queryKey: enhancedCompKeys.overdue,
    queryFn: async () => {
      const { data } = await api.get<ComplianceReviewType[]>('/compliance/reviews/overdue');
      return data;
    },
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: Partial<ComplianceReviewType>) => {
      const { data } = await api.post<ComplianceReviewType>('/compliance/reviews', dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: enhancedCompKeys.reviews });
      qc.invalidateQueries({ queryKey: enhancedCompKeys.dashboard });
      toast.success('Review created');
    },
    onError: () => toast.error('Failed to create review'),
  });
}

export function useCompleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...dto }: { id: string; findings?: string }) => {
      const { data } = await api.patch(`/compliance/reviews/${id}/complete`, dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: enhancedCompKeys.reviews });
      qc.invalidateQueries({ queryKey: enhancedCompKeys.overdue });
      qc.invalidateQueries({ queryKey: enhancedCompKeys.dashboard });
      toast.success('Review completed');
    },
  });
}

export function useConflicts() {
  return useQuery({
    queryKey: enhancedCompKeys.conflicts,
    queryFn: async () => {
      const { data } = await api.get<ConflictOfInterestType[]>('/compliance/conflicts');
      return data;
    },
  });
}

export function useCreateConflict() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: Partial<ConflictOfInterestType>) => {
      const { data } = await api.post<ConflictOfInterestType>('/compliance/conflicts', dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: enhancedCompKeys.conflicts });
      qc.invalidateQueries({ queryKey: enhancedCompKeys.dashboard });
      toast.success('Conflict recorded');
    },
  });
}

export function useRegulatoryReturns() {
  return useQuery({
    queryKey: enhancedCompKeys.returns,
    queryFn: async () => {
      const { data } = await api.get<RegulatoryReturnType2[]>('/compliance/returns');
      return data;
    },
  });
}

export function useCreateReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: Partial<RegulatoryReturnType2>) => {
      const { data } = await api.post<RegulatoryReturnType2>('/compliance/returns', dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: enhancedCompKeys.returns });
      qc.invalidateQueries({ queryKey: enhancedCompKeys.dashboard });
      toast.success('Return filed');
    },
  });
}

export function useUpdateReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...dto }: { id: string } & Partial<RegulatoryReturnType2>) => {
      const { data } = await api.patch(`/compliance/returns/${id}`, dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: enhancedCompKeys.returns });
      qc.invalidateQueries({ queryKey: enhancedCompKeys.dashboard });
      toast.success('Return updated');
    },
  });
}
