'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import type {
  MessagingConnectionType,
  MessageType,
  MessageTemplateType,
  MessageChannel,
} from '@steward/shared';

export const messagingKeys = {
  connections: ['messaging', 'connections'] as const,
  messages: (params?: Record<string, string | undefined>) =>
    ['messaging', 'messages', params] as const,
  unreadCount: ['messaging', 'unread-count'] as const,
  templates: (channel?: MessageChannel) => ['messaging', 'templates', channel] as const,
};

// ─── Connections ──────────────────────────────────────────────────────────────

export function useMessagingConnections() {
  return useQuery({
    queryKey: messagingKeys.connections,
    queryFn: async () => {
      const { data } = await api.get<MessagingConnectionType[]>('/integrations/connections');
      return data;
    },
  });
}

export function useDisconnectConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/integrations/connections/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messagingKeys.connections });
      toast.success('Disconnected successfully');
    },
    onError: () => toast.error('Failed to disconnect'),
  });
}

// ─── SMTP Setup ───────────────────────────────────────────────────────────────

interface SmtpConnectPayload {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  imap_host?: string;
  imap_port?: number;
}

export function useConnectSmtp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: SmtpConnectPayload) => api.post('/integrations/email/smtp/connect', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messagingKeys.connections });
      toast.success('Email connected successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to connect email');
    },
  });
}

// ─── WhatsApp Setup ───────────────────────────────────────────────────────────

interface WhatsAppConnectPayload {
  provider: 'twilio' | 'meta_whatsapp';
  account_sid: string;
  auth_token: string;
  from_number: string;
}

export function useConnectWhatsApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: WhatsAppConnectPayload) => api.post('/integrations/whatsapp/connect', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messagingKeys.connections });
      toast.success('WhatsApp connected successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to connect WhatsApp');
    },
  });
}

export function useWhatsAppWebhookUrl(connectionId: string) {
  return useQuery({
    queryKey: ['messaging', 'whatsapp-webhook', connectionId],
    queryFn: async () => {
      const { data } = await api.get<{ url: string }>(
        `/integrations/whatsapp/${connectionId}/webhook-url`,
      );
      return data.url;
    },
    enabled: !!connectionId,
  });
}

// ─── Meta/Facebook Setup ──────────────────────────────────────────────────────

export function useMetaPages(connectionId: string, enabled = true) {
  return useQuery({
    queryKey: ['messaging', 'meta-pages', connectionId],
    queryFn: async () => {
      const { data } = await api.get<{ id: string; name: string }[]>(
        `/integrations/meta/${connectionId}/pages`,
      );
      return data;
    },
    enabled: !!connectionId && enabled,
  });
}

export function useSubscribeMetaPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ connectionId, pageId }: { connectionId: string; pageId: string }) =>
      api.post(`/integrations/meta/${connectionId}/subscribe/${pageId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messagingKeys.connections });
      toast.success('Facebook Page connected');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to subscribe page');
    },
  });
}

// ─── Messages ─────────────────────────────────────────────────────────────────

interface ListMessagesParams {
  channel?: MessageChannel;
  lead_id?: string;
  client_id?: string;
  thread_id?: string;
}

export function useMessages(params?: ListMessagesParams) {
  return useQuery({
    queryKey: messagingKeys.messages(params as Record<string, string | undefined>),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.channel) searchParams.set('channel', params.channel);
      if (params?.lead_id) searchParams.set('lead_id', params.lead_id);
      if (params?.client_id) searchParams.set('client_id', params.client_id);
      if (params?.thread_id) searchParams.set('thread_id', params.thread_id);
      const { data } = await api.get<MessageType[]>(`/messages?${searchParams}`);
      return data;
    },
  });
}

export function useUnreadMessageCount() {
  return useQuery({
    queryKey: messagingKeys.unreadCount,
    queryFn: async () => {
      const { data } = await api.get<number>('/messages/unread-count');
      return data;
    },
    refetchInterval: 60_000, // poll every minute
  });
}

export function useMarkMessageRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/messages/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messaging', 'messages'] });
      qc.invalidateQueries({ queryKey: messagingKeys.unreadCount });
    },
  });
}

export function useLinkMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      lead_id,
      client_id,
    }: {
      id: string;
      lead_id?: string;
      client_id?: string;
    }) => api.patch(`/messages/${id}/link`, { lead_id, client_id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messaging', 'messages'] });
      toast.success('Message linked');
    },
    onError: () => toast.error('Failed to link message'),
  });
}

interface SendEmailPayload {
  connection_id: string;
  to: string;
  subject: string;
  body: string;
  in_reply_to?: string;
  thread_id?: string;
  lead_id?: string;
  client_id?: string;
}

export function useSendEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: SendEmailPayload) => api.post('/messages/email/send', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messaging', 'messages'] });
      toast.success('Email sent');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to send email');
    },
  });
}

interface SendWhatsAppPayload {
  connection_id: string;
  to: string;
  body: string;
  lead_id?: string;
  client_id?: string;
}

export function useSendWhatsApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: SendWhatsAppPayload) => api.post('/messages/whatsapp/send', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messaging', 'messages'] });
      toast.success('WhatsApp message sent');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to send WhatsApp message');
    },
  });
}

interface SendMessengerPayload {
  connection_id: string;
  recipient_psid: string;
  text: string;
  lead_id?: string;
  client_id?: string;
}

export function useSendMessenger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: SendMessengerPayload) => api.post('/messages/messenger/send', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messaging', 'messages'] });
      toast.success('Message sent');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to send message');
    },
  });
}

// ─── Templates ────────────────────────────────────────────────────────────────

export function useMessageTemplates(channel?: MessageChannel) {
  return useQuery({
    queryKey: messagingKeys.templates(channel),
    queryFn: async () => {
      const params = channel ? `?channel=${channel}` : '';
      const { data } = await api.get<MessageTemplateType[]>(`/message-templates${params}`);
      return data;
    },
  });
}

interface CreateTemplatePayload {
  name: string;
  channel: MessageChannel;
  template_name: string;
  category: string;
  language?: string;
  body: string;
  header_text?: string;
  footer_text?: string;
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTemplatePayload) => api.post('/message-templates', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messaging', 'templates'] });
      toast.success('Template created');
    },
    onError: () => toast.error('Failed to create template'),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string; name?: string; body?: string }) =>
      api.patch(`/message-templates/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messaging', 'templates'] });
      toast.success('Template updated');
    },
    onError: () => toast.error('Failed to update template'),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/message-templates/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messaging', 'templates'] });
      toast.success('Template deleted');
    },
    onError: () => toast.error('Failed to delete template'),
  });
}
