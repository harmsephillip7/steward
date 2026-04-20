import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { DocumentRecord, DocumentStats } from '@steward/shared';

export const docKeys = {
  all: ['documents'] as const,
  byClient: (clientId: string) => ['documents', 'client', clientId] as const,
  one: (id: string) => ['documents', id] as const,
  stats: ['documents', 'stats'] as const,
};

export function useDocuments(clientId?: string, type?: string) {
  return useQuery({
    queryKey: [...docKeys.all, { clientId, type }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (clientId) params.set('client_id', clientId);
      if (type) params.set('type', type);
      const { data } = await api.get<DocumentRecord[]>(`/documents?${params}`);
      return data;
    },
  });
}

export function useClientDocuments(clientId: string) {
  return useQuery({
    queryKey: docKeys.byClient(clientId),
    queryFn: async () => {
      const { data } = await api.get<DocumentRecord[]>(`/documents?client_id=${clientId}`);
      return data;
    },
    enabled: !!clientId,
  });
}

export function useDocumentStats() {
  return useQuery({
    queryKey: docKeys.stats,
    queryFn: async () => {
      const { data } = await api.get<DocumentStats>('/documents/stats');
      return data;
    },
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: Partial<DocumentRecord>) => {
      const { data } = await api.post<DocumentRecord>('/documents', dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: docKeys.all });
      qc.invalidateQueries({ queryKey: docKeys.stats });
      toast.success('Document uploaded');
    },
    onError: () => toast.error('Failed to upload document'),
  });
}

export function useFileUpload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post<DocumentRecord>('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: docKeys.all });
      qc.invalidateQueries({ queryKey: docKeys.stats });
      const clientId = variables.get('client_id') as string | null;
      if (clientId) qc.invalidateQueries({ queryKey: docKeys.byClient(clientId) });
      toast.success('File uploaded successfully');
    },
    onError: () => toast.error('Failed to upload file'),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: docKeys.all });
      qc.invalidateQueries({ queryKey: docKeys.stats });
      toast.success('Document deleted');
    },
  });
}
