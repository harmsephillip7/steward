import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import portalApi from '@/app/client-portal/portal-api';
import { toast } from 'sonner';

export function usePortalBudget() {
  return useQuery({
    queryKey: ['portal', 'budget'],
    queryFn: () => portalApi.get('/portal/budget').then(r => r.data),
  });
}

export function useUploadStatement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { file: File; statement_month: string; account_type: string }) => {
      const fd = new FormData();
      fd.append('file', payload.file);
      fd.append('statement_month', payload.statement_month);
      fd.append('account_type', payload.account_type);
      return portalApi
        .post('/portal/budget/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then(r => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal', 'budget'] });
      toast.success('Statement uploaded');
    },
    onError: () => toast.error('Upload failed — please check the file and try again'),
  });
}

export function useAnalyseBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => portalApi.post('/portal/budget/analyse').then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal', 'budget'] });
      toast.success('Analysis complete!');
    },
    onError: () => toast.error('Analysis failed — ensure at least one statement is uploaded'),
  });
}

export function useDeleteStatement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      portalApi.delete(`/portal/budget/statements/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal', 'budget'] });
      toast.success('Statement removed');
    },
    onError: () => toast.error('Failed to remove statement'),
  });
}

export function useToggleBudgetVisibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => portalApi.patch('/portal/budget/visibility').then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portal', 'budget'] }),
  });
}
