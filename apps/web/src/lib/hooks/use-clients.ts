import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { Client, ClientDetail, CreateClientDto } from '@steward/shared';

export type { Client, ClientDetail, CreateClientDto };

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
