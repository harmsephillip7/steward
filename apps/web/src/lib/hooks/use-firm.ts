import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { FirmType, FirmMemberType, TeamType } from '@steward/shared';

export const firmKeys = {
  firm: ['firm'] as const,
  teams: ['firm', 'teams'] as const,
};

export function useFirm() {
  return useQuery({
    queryKey: firmKeys.firm,
    queryFn: async () => {
      const { data } = await api.get<FirmType>('/firm');
      return data;
    },
    retry: false,
  });
}

export function useCreateFirm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: Partial<FirmType>) => {
      const { data } = await api.post<FirmType>('/firm', dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: firmKeys.firm });
      toast.success('Firm created');
    },
    onError: () => toast.error('Failed to create firm'),
  });
}

export function useUpdateFirm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: Partial<FirmType>) => {
      const { data } = await api.patch<FirmType>('/firm', dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: firmKeys.firm });
      toast.success('Firm updated');
    },
    onError: () => toast.error('Failed to update firm'),
  });
}

export function useAddMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { advisor_id: string; role: string }) => {
      const { data } = await api.post<FirmMemberType>('/firm/members', dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: firmKeys.firm });
      toast.success('Member added');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to add member'),
  });
}

export function useUpdateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...dto }: { id: string; role?: string; is_active?: boolean }) => {
      const { data } = await api.patch(`/firm/members/${id}`, dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: firmKeys.firm });
      toast.success('Member updated');
    },
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/firm/members/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: firmKeys.firm });
      toast.success('Member removed');
    },
  });
}

export function useTeams() {
  return useQuery({
    queryKey: firmKeys.teams,
    queryFn: async () => {
      const { data } = await api.get<TeamType[]>('/firm/teams');
      return data;
    },
  });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { name: string; lead_advisor_id?: string }) => {
      const { data } = await api.post<TeamType>('/firm/teams', dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: firmKeys.teams });
      toast.success('Team created');
    },
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/firm/teams/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: firmKeys.teams });
      toast.success('Team deleted');
    },
  });
}
