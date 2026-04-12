'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useRiskQuestions,
  useBehaviourQuestions,
  useCreatePlan,
  type RiskAnswer,
  type BehaviourAnswer,
  type Financials,
  type FinancialPlan,
} from '@/lib/hooks/use-fna';
import { useClient } from '@/lib/hooks/use-clients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ArrowRight, Check, User, Brain, Calculator, DollarSign, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { label: 'Risk Profile', icon: User },
  { label: 'Behaviour', icon: Brain },
  { label: 'Financials', icon: DollarSign },
  { label: 'Summary', icon: FileText },
];

const LIKERT_OPTIONS = [
  'Strongly disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly agree',
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPct(value: number | null | undefined) {
  if (value == null) return '—';
  return `${(value * 100).toFixed(1)}%`;
}

const RISK_LABELS: Record<string, string> = {
  conservative: 'Conservative',
  moderate_conservative: 'Moderate Conservative',
  moderate: 'Moderate',
  moderate_aggressive: 'Moderate Aggressive',
  aggressive: 'Aggressive',
};

export default function FNAWizardPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const router = useRouter();
  const { data: client, isLoading: clientLoading } = useClient(clientId);
  const { data: riskQuestions, isLoading: riskLoading } = useRiskQuestions();
  const { data: behaviourQuestions, isLoading: behaviourLoading } = useBehaviourQuestions();
  const createPlan = useCreatePlan();

  const [step, setStep] = useState(0);
  const [riskAnswers, setRiskAnswers] = useState<Record<number, number>>({});
  const [behaviourAnswers, setBehaviourAnswers] = useState<Record<number, number>>({});
  const [financials, setFinancials] = useState<Financials>({});
  const [result, setResult] = useState<FinancialPlan | null>(null);

  const isLoading = clientLoading || riskLoading || behaviourLoading;

  const riskComplete = riskQuestions ? Object.keys(riskAnswers).length === riskQuestions.length : false;
  const behaviourComplete = behaviourQuestions ? Object.keys(behaviourAnswers).length === behaviourQuestions.length : false;

  const canProceed = [riskComplete, behaviourComplete, true, true][step];

  async function handleSubmit() {
    const riskArr: RiskAnswer[] = Object.entries(riskAnswers).map(([qId, val]) => ({
      question_id: Number(qId),
      answer_value: val,
    }));
    const behaviourArr: BehaviourAnswer[] = Object.entries(behaviourAnswers).map(([qId, val]) => ({
      question_id: Number(qId),
      answer_value: val,
    }));

    const plan = await createPlan.mutateAsync({
      clientId,
      dto: { risk_answers: riskArr, behaviour_answers: behaviourArr, financials },
    });
    setResult(plan);
    setStep(3);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Client not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push('/fna')}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/fna"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Financial Planning
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          FNA — {client.first_name} {client.last_name}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Financial Needs Analysis Wizard</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isDone = i < step || result != null;
          return (
            <div key={s.label} className="flex items-center gap-2">
              {i > 0 && <div className={cn('h-px w-8', isDone ? 'bg-primary' : 'bg-gray-200')} />}
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : isDone
                    ? 'bg-primary/10 text-primary'
                    : 'bg-gray-100 text-gray-400',
                )}
              >
                {isDone && !isActive ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Step 0: Risk Questionnaire */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Risk Profile Questionnaire</CardTitle>
            <p className="text-sm text-muted-foreground">
              Answer all 10 questions. Select the option that best describes your client.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {riskQuestions?.map((q) => (
              <div key={q.id} className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  {q.id}. {q.question}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {q.options.map((opt, oi) => {
                    const val = oi + 1;
                    const selected = riskAnswers[q.id] === val;
                    return (
                      <button
                        key={oi}
                        type="button"
                        onClick={() => setRiskAnswers((prev) => ({ ...prev, [q.id]: val }))}
                        className={cn(
                          'text-xs px-3 py-2 rounded-md border text-left transition-colors',
                          selected
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600',
                        )}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 1: Behaviour Questionnaire */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Behavioural Bias Assessment</CardTitle>
            <p className="text-sm text-muted-foreground">
              Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree).
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {behaviourQuestions?.map((q) => (
              <div key={q.id} className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  {q.id}. {q.question}
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {LIKERT_OPTIONS.map((opt, oi) => {
                    const val = oi + 1;
                    const selected = behaviourAnswers[q.id] === val;
                    return (
                      <button
                        key={oi}
                        type="button"
                        onClick={() => setBehaviourAnswers((prev) => ({ ...prev, [q.id]: val }))}
                        className={cn(
                          'text-xs px-3 py-2 rounded-md border text-center transition-colors',
                          selected
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600',
                        )}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Financial Inputs */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financial Information</CardTitle>
            <p className="text-sm text-muted-foreground">
              Provide financial details for tax calculations. All fields are optional.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="monthly_income">Monthly Income (R)</Label>
                <Input
                  id="monthly_income"
                  type="number"
                  placeholder="e.g. 45000"
                  value={financials.monthly_income ?? ''}
                  onChange={(e) =>
                    setFinancials((f) => ({ ...f, monthly_income: e.target.value ? Number(e.target.value) : undefined }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="monthly_expenses">Monthly Expenses (R)</Label>
                <Input
                  id="monthly_expenses"
                  type="number"
                  placeholder="e.g. 30000"
                  value={financials.monthly_expenses ?? ''}
                  onChange={(e) =>
                    setFinancials((f) => ({ ...f, monthly_expenses: e.target.value ? Number(e.target.value) : undefined }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="taxable_income">Annual Taxable Income (R)</Label>
                <Input
                  id="taxable_income"
                  type="number"
                  placeholder="e.g. 540000"
                  value={financials.taxable_income ?? ''}
                  onChange={(e) =>
                    setFinancials((f) => ({ ...f, taxable_income: e.target.value ? Number(e.target.value) : undefined }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="disposal_gain">Capital Disposal Gain (R)</Label>
                <Input
                  id="disposal_gain"
                  type="number"
                  placeholder="e.g. 200000"
                  value={financials.disposal_gain ?? ''}
                  onChange={(e) =>
                    setFinancials((f) => ({ ...f, disposal_gain: e.target.value ? Number(e.target.value) : undefined }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="estate_value">Estate Value (R)</Label>
                <Input
                  id="estate_value"
                  type="number"
                  placeholder="e.g. 5000000"
                  value={financials.estate_value ?? ''}
                  onChange={(e) =>
                    setFinancials((f) => ({ ...f, estate_value: e.target.value ? Number(e.target.value) : undefined }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="spouse_rebate">Spouse Rebate (R)</Label>
                <Input
                  id="spouse_rebate"
                  type="number"
                  placeholder="e.g. 0"
                  value={financials.spouse_rebate ?? ''}
                  onChange={(e) =>
                    setFinancials((f) => ({ ...f, spouse_rebate: e.target.value ? Number(e.target.value) : undefined }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="liquidity_needs">Liquidity Needs (R)</Label>
                <Input
                  id="liquidity_needs"
                  type="number"
                  placeholder="e.g. 100000"
                  value={financials.liquidity_needs ?? ''}
                  onChange={(e) =>
                    setFinancials((f) => ({ ...f, liquidity_needs: e.target.value ? Number(e.target.value) : undefined }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Summary / Result */}
      {step === 3 && result && (
        <div className="space-y-6">
          {/* Risk Result */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Risk Profile Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Profile</p>
                  <Badge className="mt-1 text-sm">{RISK_LABELS[result.risk_profile] ?? result.risk_profile}</Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Risk Score</p>
                  <p className="text-2xl font-bold mt-1">{result.risk_score} / 50</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Behaviour Result */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Behavioural Bias Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {[
                  { label: 'Loss Aversion', value: result.behaviour_profile.loss_aversion },
                  { label: 'Herding', value: result.behaviour_profile.herding },
                  { label: 'Recency Bias', value: result.behaviour_profile.recency_bias },
                  { label: 'Overconfidence', value: result.behaviour_profile.overconfidence },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            value > 60 ? 'bg-red-500' : value > 40 ? 'bg-amber-500' : 'bg-green-500',
                          )}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-10 text-right">{value.toFixed(0)}</span>
                    </div>
                  </div>
                ))}
              </div>
              {result.behaviour_profile.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  <p className="font-medium mb-1">Advisor Notes</p>
                  <p className="whitespace-pre-line">{result.behaviour_profile.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tax Calculations */}
          {result.tax_calculation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Tax Calculations ({result.tax_calculation.tax_year ?? 'N/A'})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {result.tax_calculation.income_tax != null && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Income Tax</p>
                      <p className="text-xl font-bold mt-1">{formatCurrency(result.tax_calculation.income_tax)}</p>
                      <p className="text-xs text-gray-400">
                        Marginal: {formatPct(result.tax_calculation.marginal_rate)} | Effective: {formatPct(result.tax_calculation.effective_rate)}
                      </p>
                    </div>
                  )}
                  {result.tax_calculation.cgt_liability != null && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Capital Gains Tax</p>
                      <p className="text-xl font-bold mt-1">{formatCurrency(result.tax_calculation.cgt_liability)}</p>
                    </div>
                  )}
                  {result.tax_calculation.estate_duty != null && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Estate Duty</p>
                      <p className="text-xl font-bold mt-1">{formatCurrency(result.tax_calculation.estate_duty)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Financials snapshot */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Monthly Income</p>
                  <p className="font-medium mt-0.5">{result.monthly_income ? formatCurrency(result.monthly_income) : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Monthly Expenses</p>
                  <p className="font-medium mt-0.5">{result.monthly_expenses ? formatCurrency(result.monthly_expenses) : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Estate Value</p>
                  <p className="font-medium mt-0.5">{result.estate_value ? formatCurrency(result.estate_value) : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Liquidity Needs</p>
                  <p className="font-medium mt-0.5">{result.liquidity_needs ? formatCurrency(result.liquidity_needs) : '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => router.push(`/clients/${clientId}`)}>
              Back to Client <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      {!(step === 3 && result) && (
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {step < 2 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : step === 2 ? (
            <Button onClick={handleSubmit} disabled={createPlan.isPending}>
              {createPlan.isPending ? 'Generating Plan...' : 'Generate Plan'}
              <Check className="ml-2 h-4 w-4" />
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
