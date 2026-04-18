'use client';

import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save } from 'lucide-react';
import type { AnalysisData } from '@steward/shared';

interface AnalysisFormProps {
  defaultValues: AnalysisData;
  onSubmit: (data: AnalysisData) => void;
  isPending: boolean;
}

const RISK_LEVELS = ['Conservative', 'Moderate-Conservative', 'Moderate', 'Moderate-Aggressive', 'Aggressive'] as const;
const ESTATE_STATUSES = ['Not Started', 'In Progress', 'Up to Date', 'Needs Review'] as const;

export function AnalysisForm({ defaultValues, onSubmit, isPending }: AnalysisFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm<AnalysisData>({
    defaultValues,
  });

  const hasEmergencyFund = watch('has_emergency_fund');

  const formatR = (value: number | undefined) => (value != null ? `R ${value.toLocaleString()}` : '');

  // Calculate derived fields
  const monthlyGross = watch('monthly_gross_income') || 0;
  const monthlyNet = watch('monthly_net_income') || 0;
  const monthlyExpenses = watch('monthly_total_expenses') || 0;
  const totalAssets = watch('total_assets') || 0;
  const totalLiabilities = watch('total_liabilities') || 0;
  const surplus = monthlyNet - monthlyExpenses;
  const netWorth = totalAssets - totalLiabilities;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Risk Profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Risk Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Preliminary Risk Tolerance</Label>
            <Select defaultValue={defaultValues.risk_tolerance_preliminary || ''} onValueChange={v => setValue('risk_tolerance_preliminary', v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {RISK_LEVELS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Income & Expenses */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Monthly Income & Expenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="monthly_gross_income">Gross Income (R)</Label>
              <Input id="monthly_gross_income" type="number" min={0} {...register('monthly_gross_income', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly_net_income">Net Income (R)</Label>
              <Input id="monthly_net_income" type="number" min={0} {...register('monthly_net_income', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly_total_expenses">Total Expenses (R)</Label>
              <Input id="monthly_total_expenses" type="number" min={0} {...register('monthly_total_expenses', { valueAsNumber: true })} />
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 px-3 py-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Monthly Surplus / Deficit</span>
            <span className={surplus >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              R {surplus.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Balance Sheet */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Balance Sheet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="total_assets">Total Assets (R)</Label>
              <Input id="total_assets" type="number" min={0} {...register('total_assets', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_liabilities">Total Liabilities (R)</Label>
              <Input id="total_liabilities" type="number" min={0} {...register('total_liabilities', { valueAsNumber: true })} />
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 px-3 py-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated Net Worth</span>
            <span className={netWorth >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              R {netWorth.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Existing Cover */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Existing Cover</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="existing_life_cover">Life Cover (R)</Label>
            <Input id="existing_life_cover" type="number" min={0} {...register('existing_life_cover', { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="existing_disability_cover">Disability Cover (R)</Label>
            <Input id="existing_disability_cover" type="number" min={0} {...register('existing_disability_cover', { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="existing_dread_disease_cover">Dread Disease Cover (R)</Label>
            <Input id="existing_dread_disease_cover" type="number" min={0} {...register('existing_dread_disease_cover', { valueAsNumber: true })} />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Fund & Retirement */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Emergency Fund & Retirement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={hasEmergencyFund || false}
              onCheckedChange={v => setValue('has_emergency_fund', v)}
            />
            <Label>Has an emergency fund</Label>
          </div>
          {hasEmergencyFund && (
            <div className="space-y-2">
              <Label htmlFor="emergency_fund_months">Months of expenses covered</Label>
              <Input id="emergency_fund_months" type="number" min={0} step={0.5} {...register('emergency_fund_months', { valueAsNumber: true })} />
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="retirement_fund_value">Retirement Fund Value (R)</Label>
              <Input id="retirement_fund_value" type="number" min={0} {...register('retirement_fund_value', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retirement_monthly_contribution">Monthly Retirement Contribution (R)</Label>
              <Input id="retirement_monthly_contribution" type="number" min={0} {...register('retirement_monthly_contribution', { valueAsNumber: true })} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gap Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Gap Analysis & Opportunities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="insurance_gaps">Insurance Gaps</Label>
            <Textarea id="insurance_gaps" placeholder="Identified gaps in risk cover..." {...register('insurance_gaps')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="investment_gaps">Investment Gaps</Label>
            <Textarea id="investment_gaps" placeholder="Gaps in savings and investments..." {...register('investment_gaps')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax_opportunities">Tax Opportunities</Label>
            <Textarea id="tax_opportunities" placeholder="Potential tax optimisations..." {...register('tax_opportunities')} />
          </div>
          <div className="space-y-2">
            <Label>Estate Planning Status</Label>
            <Select defaultValue={defaultValues.estate_planning_status || ''} onValueChange={v => setValue('estate_planning_status', v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {ESTATE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Preliminary Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Preliminary Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preliminary_recommendations">Recommendations</Label>
            <Textarea id="preliminary_recommendations" rows={4} placeholder="High-level recommendations based on analysis..." {...register('preliminary_recommendations')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="analysis_notes">Analysis Notes</Label>
            <Textarea id="analysis_notes" rows={3} placeholder="Additional notes..." {...register('analysis_notes')} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save Analysis Data
      </Button>
    </form>
  );
}
