import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

const nKeys = { all: ['notifications'] as const };

export function useNotifications() {
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: nKeys.all,
    queryFn: async () => {
      try {
        const { data } = await api.get('/notifications');
        return data;
      } catch {
        return [];
      }
    },
    refetchInterval: 60_000,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount };
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: nKeys.all }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: nKeys.all }),
  });
}
