import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import type {
  LeadType,
  ActivityRecord,
  TaskType,
  ProposalType,
  ProposalTemplateType,
  OnboardingChecklistType,
  PipelineSummary,
  DiscoveryData,
  AnalysisData,
  StageGuidance,
  StageHistoryEntry,
} from '@steward/shared';

export const crmKeys = {
  leads: ['crm', 'leads'] as const,
  lead: (id: string) => ['crm', 'leads', id] as const,
  pipeline: ['crm', 'pipeline'] as const,
  stageProgress: (id: string) => ['crm', 'stage-progress', id] as const,
  activities: (params?: Record<string, string>) => ['crm', 'activities', params] as const,
  tasks: (completed?: boolean) => ['crm', 'tasks', { completed }] as const,
  proposals: ['crm', 'proposals'] as const,
  proposal: (id: string) => ['crm', 'proposals', id] as const,
  proposalTemplates: ['crm', 'proposal-templates'] as const,
  proposalTemplate: (id: string) => ['crm', 'proposal-templates', id] as const,
  onboarding: (clientId: string) => ['crm', 'onboarding', clientId] as const,
};

// ── Leads ──────────────────────────────────────────────────────

export function useLeads(stage?: string, source?: string) {
  return useQuery({
    queryKey: [...crmKeys.leads, { stage, source }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (stage) params.set('stage', stage);
      if (source) params.set('source', source);
      const { data } = await api.get<LeadType[]>(`/leads?${params}`);
      return data;
    },
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: crmKeys.lead(id),
    queryFn: async () => {
      const { data } = await api.get<LeadType>(`/leads/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function usePipeline() {
  return useQuery({
    queryKey: crmKeys.pipeline,
    queryFn: async () => {
      const { data } = await api.get<PipelineSummary[]>('/leads/pipeline');
      return data;
    },
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: Partial<LeadType>) => {
      const { data } = await api.post<LeadType>('/leads', dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmKeys.leads });
      qc.invalidateQueries({ queryKey: crmKeys.pipeline });
      toast.success('Lead created');
    },
    onError: () => toast.error('Failed to create lead'),
  });
}

export function useUpdateLead(id?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<LeadType> | { id: string; dto: Partial<LeadType> }) => {
      const leadId = 'dto' in input ? input.id : id!;
      const dto = 'dto' in input ? input.dto : input;
      const { data } = await api.patch<LeadType>(`/leads/${leadId}`, dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmKeys.leads });
      if (id) {
        qc.invalidateQueries({ queryKey: crmKeys.lead(id) });
        qc.invalidateQueries({ queryKey: crmKeys.stageProgress(id) });
      }
      qc.invalidateQueries({ queryKey: crmKeys.pipeline });
      toast.success('Lead updated');
    },
    onError: () => toast.error('Failed to update lead'),
  });
}

export function useConvertLead(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/leads/${id}/convert`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmKeys.leads });
      qc.invalidateQueries({ queryKey: crmKeys.pipeline });
      qc.invalidateQueries({ queryKey: crmKeys.lead(id) });
      qc.invalidateQueries({ queryKey: crmKeys.stageProgress(id) });
      toast.success('Lead converted to client');
    },
    onError: () => toast.error('Failed to convert lead'),
  });
}

// ── Stage Progress ─────────────────────────────────────────────

export interface StageProgressResponse {
  current_stage: string;
  guidance: StageGuidance;
  progress: { completed: number; total: number; pct: number; completedKeys: string[] };
  time_in_stage_days: number;
  stage_tasks: { total: number; completed: number };
  stage_history: StageHistoryEntry[];
}

export function useStageProgress(id: string) {
  return useQuery({
    queryKey: crmKeys.stageProgress(id),
    queryFn: async () => {
      const { data } = await api.get<StageProgressResponse>(`/leads/${id}/stage-progress`);
      return data;
    },
    enabled: !!id,
  });
}

export function useUpdateDiscoveryData(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (discovery_data: DiscoveryData) => {
      const { data } = await api.patch<LeadType>(`/leads/${id}`, { discovery_data });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmKeys.lead(id) });
      qc.invalidateQueries({ queryKey: crmKeys.stageProgress(id) });
      toast.success('Discovery data saved');
    },
    onError: () => toast.error('Failed to save discovery data'),
  });
}

export function useUpdateAnalysisData(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (analysis_data: AnalysisData) => {
      const { data } = await api.patch<LeadType>(`/leads/${id}`, { analysis_data });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmKeys.lead(id) });
      qc.invalidateQueries({ queryKey: crmKeys.stageProgress(id) });
      toast.success('Analysis data saved');
    },
    onError: () => toast.error('Failed to save analysis data'),
  });
}

// ── Activities ─────────────────────────────────────────────────

export function useActivities(leadId?: string, clientId?: string) {
  return useQuery({
    queryKey: crmKeys.activities({ lead_id: leadId || '', client_id: clientId || '' }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (leadId) params.set('lead_id', leadId);
      if (clientId) params.set('client_id', clientId);
      const { data } = await api.get<ActivityRecord[]>(`/activities?${params}`);
      return data;
    },
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: Partial<ActivityRecord>) => {
      const { data } = await api.post<ActivityRecord>('/activities', dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm', 'activities'] });
      toast.success('Activity logged');
    },
    onError: () => toast.error('Failed to log activity'),
  });
}

export function useCompleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/activities/${id}/complete`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm', 'activities'] });
      toast.success('Activity completed');
    },
  });
}

// ── Tasks ──────────────────────────────────────────────────────

export function useTasks(completed?: boolean) {
  return useQuery({
    queryKey: crmKeys.tasks(completed),
    queryFn: async () => {
      const params = completed !== undefined ? `?completed=${completed}` : '';
      const { data } = await api.get<TaskType[]>(`/tasks${params}`);
      return data;
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: Partial<TaskType>) => {
      const { data } = await api.post<TaskType>('/tasks', dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm', 'tasks'] });
      toast.success('Task created');
    },
    onError: () => toast.error('Failed to create task'),
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/tasks/${id}/complete`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm', 'tasks'] });
      toast.success('Task completed');
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm', 'tasks'] });
      toast.success('Task deleted');
    },
  });
}

// ── Proposals ──────────────────────────────────────────────────

export function useProposals() {
  return useQuery({
    queryKey: crmKeys.proposals,
    queryFn: async () => {
      const { data } = await api.get<ProposalType[]>('/proposals');
      return data;
    },
  });
}

export function useProposal(id: string) {
  return useQuery({
    queryKey: crmKeys.proposal(id),
    queryFn: async () => {
      const { data } = await api.get<ProposalType>(`/proposals/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: Partial<ProposalType>) => {
      const { data } = await api.post<ProposalType>('/proposals', dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmKeys.proposals });
      toast.success('Proposal created');
    },
    onError: () => toast.error('Failed to create proposal'),
  });
}

export function useUpdateProposal(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: Partial<ProposalType>) => {
      const { data } = await api.patch<ProposalType>(`/proposals/${id}`, dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmKeys.proposals });
      qc.invalidateQueries({ queryKey: crmKeys.proposal(id) });
      toast.success('Proposal updated');
    },
  });
}

export function useSendProposal(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/proposals/${id}/send`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmKeys.proposals });
      qc.invalidateQueries({ queryKey: crmKeys.proposal(id) });
      toast.success('Proposal sent');
    },
  });
}

// ── Proposal Templates ─────────────────────────────────────────

export function useProposalTemplates() {
  return useQuery({
    queryKey: crmKeys.proposalTemplates,
    queryFn: async () => {
      const { data } = await api.get<ProposalTemplateType[]>('/proposal-templates');
      return data;
    },
  });
}

export function useProposalTemplate(id: string) {
  return useQuery({
    queryKey: crmKeys.proposalTemplate(id),
    queryFn: async () => {
      const { data } = await api.get<ProposalTemplateType>(`/proposal-templates/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateProposalTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: Partial<ProposalTemplateType>) => {
      const { data } = await api.post<ProposalTemplateType>('/proposal-templates', dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmKeys.proposalTemplates });
      toast.success('Template created');
    },
    onError: () => toast.error('Failed to create template'),
  });
}

export function useUpdateProposalTemplate(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: Partial<ProposalTemplateType>) => {
      const { data } = await api.patch<ProposalTemplateType>(`/proposal-templates/${id}`, dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmKeys.proposalTemplates });
      toast.success('Template updated');
    },
  });
}

export function useDeleteProposalTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/proposal-templates/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmKeys.proposalTemplates });
      toast.success('Template deleted');
    },
  });
}

// ── Logo Upload ────────────────────────────────────────────────

export function useUploadLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/advisors/me/logo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['advisor', 'me'] });
      toast.success('Logo uploaded');
    },
    onError: () => toast.error('Failed to upload logo'),
  });
}

// ── Onboarding ─────────────────────────────────────────────────

export function useOnboarding(clientId: string) {
  return useQuery({
    queryKey: crmKeys.onboarding(clientId),
    queryFn: async () => {
      const { data } = await api.get<OnboardingChecklistType>(`/clients/${clientId}/onboarding`);
      return data;
    },
    enabled: !!clientId,
  });
}

export function useCreateOnboarding(clientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<OnboardingChecklistType>(`/clients/${clientId}/onboarding`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmKeys.onboarding(clientId) });
      toast.success('Onboarding started');
    },
  });
}

export function useUpdateOnboardingItem(clientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, completed }: { key: string; completed: boolean }) => {
      const { data } = await api.patch(`/clients/${clientId}/onboarding/${key}`, { completed });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmKeys.onboarding(clientId) });
    },
  });
}
