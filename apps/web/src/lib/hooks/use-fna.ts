import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';

export interface RiskQuestion {
  id: number;
  question: string;
  options: string[];
}

export interface BehaviourQuestion {
  id: number;
  question: string;
}

export interface RiskAnswer {
  question_id: number;
  answer_value: number;
}

export interface BehaviourAnswer {
  question_id: number;
  answer_value: number;
}

export interface Financials {
  estate_value?: number;
  liquidity_needs?: number;
  monthly_income?: number;
  monthly_expenses?: number;
  taxable_income?: number;
  disposal_gain?: number;
  spouse_rebate?: number;
}

export interface TaxCalculation {
  id: string;
  cgt_liability: number | null;
  income_tax: number | null;
  estate_duty: number | null;
  marginal_rate: number | null;
  effective_rate: number | null;
  tax_year: string | null;
  cgt_breakdown: any;
  income_tax_breakdown: any;
  estate_breakdown: any;
}

export interface FinancialPlan {
  id: string;
  client_id: string;
  advisor_id: string;
  risk_profile: string;
  risk_score: number;
  behaviour_profile: {
    loss_aversion: number;
    herding: number;
    recency_bias: number;
    overconfidence: number;
    notes: string;
  };
  estate_value: number | null;
  liquidity_needs: number | null;
  monthly_income: number | null;
  monthly_expenses: number | null;
  risk_answers: RiskAnswer[];
  behaviour_answers: BehaviourAnswer[];
  tax_calculation: TaxCalculation | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanDto {
  risk_answers: RiskAnswer[];
  behaviour_answers: BehaviourAnswer[];
  financials: Financials;
}

export const fnaKeys = {
  riskQuestions: ['fna', 'risk-questions'] as const,
  behaviourQuestions: ['fna', 'behaviour-questions'] as const,
  plans: (clientId: string) => ['fna', 'plans', clientId] as const,
};

export function useRiskQuestions() {
  return useQuery({
    queryKey: fnaKeys.riskQuestions,
    queryFn: async () => {
      const { data } = await api.get<RiskQuestion[]>('/fna/questions/risk');
      return data;
    },
    staleTime: Infinity,
  });
}

export function useBehaviourQuestions() {
  return useQuery({
    queryKey: fnaKeys.behaviourQuestions,
    queryFn: async () => {
      const { data } = await api.get<BehaviourQuestion[]>('/fna/questions/behaviour');
      return data;
    },
    staleTime: Infinity,
  });
}

export function useClientPlans(clientId: string) {
  return useQuery({
    queryKey: fnaKeys.plans(clientId),
    queryFn: async () => {
      const { data } = await api.get<FinancialPlan[]>(`/fna/clients/${clientId}/plans`);
      return data;
    },
    enabled: !!clientId,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clientId, dto }: { clientId: string; dto: CreatePlanDto }) => {
      const { data } = await api.post<FinancialPlan>(`/fna/clients/${clientId}/plan`, dto);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: fnaKeys.plans(variables.clientId) });
      toast.success('Financial plan created successfully');
    },
    onError: () => {
      toast.error('Failed to create financial plan');
    },
  });
}
