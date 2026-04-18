'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';
import type { AnalysisData } from '@steward/shared';

interface AnalysisFormProps {
  defaultValues: AnalysisData;
  onSubmit: (data: AnalysisData) => void;
  isPending: boolean;
}

const RISK_LEVELS = ['Conservative', 'Moderate-Conservative', 'Moderate', 'Moderate-Aggressive', 'Aggressive'] as const;
const ESTATE_STATUSES = ['Not Started', 'In Progress', 'Up to Date', 'Needs Review'] as const;
const ASSET_CATEGORIES = ['Property', 'Vehicle', 'Investment', 'Retirement Fund', 'TFSA', 'RA', 'Savings', 'Business', 'Collectible', 'Other'] as const;
const LIABILITY_CATEGORIES = ['Mortgage', 'Vehicle Finance', 'Personal Loan', 'Credit Card', 'Student Loan', 'Overdraft', 'Other'] as const;
const RETIREMENT_TYPES = ['Retirement Annuity', 'Pension Fund', 'Provident Fund', 'Preservation Fund'] as const;
const EDUCATION_TYPES = ['Primary', 'Secondary', 'Tertiary', 'Postgraduate'] as const;

export function AnalysisForm({ defaultValues, onSubmit, isPending }: AnalysisFormProps) {
  const { register, handleSubmit, setValue, watch, control } = useForm<AnalysisData>({
    defaultValues: {
      ...defaultValues,
      income_breakdown: defaultValues.income_breakdown || {},
      expense_breakdown: defaultValues.expense_breakdown || {},
      assets_details: defaultValues.assets_details || [],
      liabilities_details: defaultValues.liabilities_details || [],
      education_needs: defaultValues.education_needs || [],
    },
  });

  const assetsArray = useFieldArray({ control, name: 'assets_details' as any });
  const liabilitiesArray = useFieldArray({ control, name: 'liabilities_details' as any });
  const educationArray = useFieldArray({ control, name: 'education_needs' as any });

  const hasEmergencyFund = watch('has_emergency_fund');
  const hasShortTermInsurance = watch('has_short_term_insurance');
  const hasBusinessInterests = watch('has_business_interests');
  const hasWill = watch('has_will');
  const hasTrust = watch('has_trust');

  // Income breakdown auto-totals
  const ib = watch('income_breakdown') || {};
  const totalIncome = (ib.salary || 0) + (ib.bonus_commission || 0) + (ib.rental_income || 0) +
    (ib.investment_income || 0) + (ib.business_income || 0) + (ib.maintenance_received || 0) + (ib.other_income || 0);

  // Expense breakdown auto-totals
  const eb = watch('expense_breakdown') || {};
  const totalExpenses = (eb.housing || 0) + (eb.transport || 0) + (eb.food_groceries || 0) +
    (eb.medical || 0) + (eb.insurance_premiums || 0) + (eb.education_school_fees || 0) +
    (eb.entertainment_lifestyle || 0) + (eb.debt_repayments || 0) + (eb.savings_investments || 0) + (eb.other_expenses || 0);

  const surplus = totalIncome - totalExpenses;

  // Asset totals
  const assetsWatched = watch('assets_details') || [];
  const totalAssets = assetsWatched.reduce((sum: number, a: any) => sum + (Number(a?.current_value) || 0), 0);

  // Liability totals
  const liabilitiesWatched = watch('liabilities_details') || [];
  const totalLiabilities = liabilitiesWatched.reduce((sum: number, l: any) => sum + (Number(l?.outstanding_balance) || 0), 0);

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

      {/* Income Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Monthly Income Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Salary / Wages (R)</Label>
              <Input type="number" min={0} {...register('income_breakdown.salary', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Bonus / Commission (R)</Label>
              <Input type="number" min={0} {...register('income_breakdown.bonus_commission', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Rental Income (R)</Label>
              <Input type="number" min={0} {...register('income_breakdown.rental_income', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Investment Income (R)</Label>
              <Input type="number" min={0} {...register('income_breakdown.investment_income', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Business Income (R)</Label>
              <Input type="number" min={0} {...register('income_breakdown.business_income', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Maintenance Received (R)</Label>
              <Input type="number" min={0} {...register('income_breakdown.maintenance_received', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Other Income (R)</Label>
              <Input type="number" min={0} {...register('income_breakdown.other_income', { valueAsNumber: true })} />
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 px-3 py-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Monthly Income</span>
            <span className="font-medium">R {totalIncome.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Monthly Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Housing (Rent/Bond) (R)</Label>
              <Input type="number" min={0} {...register('expense_breakdown.housing', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Transport (R)</Label>
              <Input type="number" min={0} {...register('expense_breakdown.transport', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Food & Groceries (R)</Label>
              <Input type="number" min={0} {...register('expense_breakdown.food_groceries', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Medical (R)</Label>
              <Input type="number" min={0} {...register('expense_breakdown.medical', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Insurance Premiums (R)</Label>
              <Input type="number" min={0} {...register('expense_breakdown.insurance_premiums', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Education / School Fees (R)</Label>
              <Input type="number" min={0} {...register('expense_breakdown.education_school_fees', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Entertainment & Lifestyle (R)</Label>
              <Input type="number" min={0} {...register('expense_breakdown.entertainment_lifestyle', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Debt Repayments (R)</Label>
              <Input type="number" min={0} {...register('expense_breakdown.debt_repayments', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Savings & Investments (R)</Label>
              <Input type="number" min={0} {...register('expense_breakdown.savings_investments', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Other (R)</Label>
              <Input type="number" min={0} {...register('expense_breakdown.other_expenses', { valueAsNumber: true })} />
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 px-3 py-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Monthly Expenses</span>
            <span className="font-medium">R {totalExpenses.toLocaleString()}</span>
          </div>
          <div className="rounded-lg bg-muted/50 px-3 py-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Monthly Surplus / Deficit</span>
            <span className={surplus >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              R {surplus.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Assets */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Assets</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => assetsArray.append({ description: '', category: '', provider: '', current_value: undefined, monthly_contribution: undefined })}>
            <Plus className="w-3 h-3 mr-1" />Add Asset
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {assetsArray.fields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No assets added yet</p>}
          {assetsArray.fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Asset {index + 1}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => assetsArray.remove(index)}><Trash2 className="w-3 h-3" /></Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Input placeholder="e.g. Primary residence" {...register(`assets_details.${index}.description`)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Category</Label>
                  <Select defaultValue={(defaultValues.assets_details?.[index]?.category) || ''} onValueChange={v => setValue(`assets_details.${index}.category`, v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{ASSET_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Provider</Label>
                  <Input placeholder="Institution" {...register(`assets_details.${index}.provider`)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Current Value (R)</Label>
                  <Input type="number" min={0} {...register(`assets_details.${index}.current_value`, { valueAsNumber: true })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Monthly Contribution (R)</Label>
                  <Input type="number" min={0} {...register(`assets_details.${index}.monthly_contribution`, { valueAsNumber: true })} />
                </div>
              </div>
            </div>
          ))}
          <div className="rounded-lg bg-muted/50 px-3 py-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Assets</span>
            <span className="font-medium">R {totalAssets.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Liabilities */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Liabilities</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => liabilitiesArray.append({ description: '', category: '', provider: '', outstanding_balance: undefined, monthly_repayment: undefined, interest_rate: undefined })}>
            <Plus className="w-3 h-3 mr-1" />Add Liability
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {liabilitiesArray.fields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No liabilities added yet</p>}
          {liabilitiesArray.fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Liability {index + 1}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => liabilitiesArray.remove(index)}><Trash2 className="w-3 h-3" /></Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Input placeholder="e.g. Home loan" {...register(`liabilities_details.${index}.description`)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Category</Label>
                  <Select defaultValue={(defaultValues.liabilities_details?.[index]?.category) || ''} onValueChange={v => setValue(`liabilities_details.${index}.category`, v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{LIABILITY_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Provider</Label>
                  <Input placeholder="Institution" {...register(`liabilities_details.${index}.provider`)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Outstanding Balance (R)</Label>
                  <Input type="number" min={0} {...register(`liabilities_details.${index}.outstanding_balance`, { valueAsNumber: true })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Monthly Repayment (R)</Label>
                  <Input type="number" min={0} {...register(`liabilities_details.${index}.monthly_repayment`, { valueAsNumber: true })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Interest Rate (%)</Label>
                  <Input type="number" min={0} step={0.1} {...register(`liabilities_details.${index}.interest_rate`, { valueAsNumber: true })} />
                </div>
              </div>
            </div>
          ))}
          <div className="rounded-lg bg-muted/50 px-3 py-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Liabilities</span>
            <span className="font-medium">R {totalLiabilities.toLocaleString()}</span>
          </div>
          <div className="rounded-lg bg-muted/50 px-3 py-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Net Worth</span>
            <span className={netWorth >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              R {netWorth.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Existing Risk Cover */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Existing Risk Cover</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Life Cover (R)</Label>
              <Input type="number" min={0} {...register('existing_life_cover', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Disability Cover (R)</Label>
              <Input type="number" min={0} {...register('existing_disability_cover', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Dread Disease Cover (R)</Label>
              <Input type="number" min={0} {...register('existing_dread_disease_cover', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Income Protection (R/month)</Label>
              <Input type="number" min={0} {...register('existing_income_protection', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Funeral Cover (R)</Label>
              <Input type="number" min={0} {...register('existing_funeral_cover', { valueAsNumber: true })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 pt-2 border-t">
            <div className="space-y-2">
              <Label>Medical Aid</Label>
              <Input placeholder="e.g. Discovery, Momentum" {...register('existing_medical_aid')} />
            </div>
            <div className="space-y-2">
              <Label>Plan / Option</Label>
              <Input placeholder="e.g. Executive Plan" {...register('medical_aid_plan')} />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch checked={watch('gap_cover') || false} onCheckedChange={(v: boolean) => setValue('gap_cover', v)} />
              <Label>Has Gap Cover</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Short-Term Insurance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Short-Term Insurance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={hasShortTermInsurance || false} onCheckedChange={(v: boolean) => setValue('has_short_term_insurance', v)} />
            <Label>Has short-term insurance</Label>
          </div>
          {hasShortTermInsurance && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Input placeholder="e.g. Outsurance, Santam" {...register('short_term_provider')} />
              </div>
              <div className="space-y-2">
                <Label>Total Monthly Premium (R)</Label>
                <Input type="number" min={0} {...register('short_term_premiums', { valueAsNumber: true })} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={watch('homeowners_cover') || false} onCheckedChange={(v: boolean) => setValue('homeowners_cover', v)} />
                <Label className="text-sm">Homeowners Cover</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={watch('vehicle_cover') || false} onCheckedChange={(v: boolean) => setValue('vehicle_cover', v)} />
                <Label className="text-sm">Vehicle Cover</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={watch('all_risks_cover') || false} onCheckedChange={(v: boolean) => setValue('all_risks_cover', v)} />
                <Label className="text-sm">All Risks Cover</Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Fund & Retirement */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Emergency Fund</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={hasEmergencyFund || false} onCheckedChange={(v: boolean) => setValue('has_emergency_fund', v)} />
            <Label>Has an emergency fund</Label>
          </div>
          {hasEmergencyFund && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Months of expenses covered</Label>
                <Input type="number" min={0} step={0.5} {...register('emergency_fund_months', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>Emergency Fund Value (R)</Label>
                <Input type="number" min={0} {...register('emergency_fund_value', { valueAsNumber: true })} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Retirement */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Retirement Planning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Primary Retirement Fund Type</Label>
              <Select defaultValue={defaultValues.retirement_fund_type || ''} onValueChange={v => setValue('retirement_fund_type', v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{RETIREMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Total Retirement Fund Value (R)</Label>
              <Input type="number" min={0} {...register('retirement_fund_value', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Monthly Contribution (R)</Label>
              <Input type="number" min={0} {...register('retirement_monthly_contribution', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Employer Contribution (R/month)</Label>
              <Input type="number" min={0} {...register('employer_contribution', { valueAsNumber: true })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">RA Value (R)</Label>
              <Input type="number" min={0} {...register('ra_value', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Pension Value (R)</Label>
              <Input type="number" min={0} {...register('pension_value', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Provident Value (R)</Label>
              <Input type="number" min={0} {...register('provident_value', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Preservation Value (R)</Label>
              <Input type="number" min={0} {...register('preservation_value', { valueAsNumber: true })} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estate Planning */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Estate Planning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Estate Planning Status</Label>
            <Select defaultValue={defaultValues.estate_planning_status || ''} onValueChange={v => setValue('estate_planning_status', v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>{ESTATE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Switch checked={hasWill || false} onCheckedChange={(v: boolean) => setValue('has_will', v)} />
              <Label>Has a valid will</Label>
            </div>
            {hasWill && (
              <div className="space-y-2">
                <Label>Will Last Updated</Label>
                <Input type="date" {...register('will_last_updated')} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Executor Appointed</Label>
              <Input placeholder="Executor name or firm" {...register('executor_appointed')} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={watch('beneficiary_nominations_up_to_date') || false} onCheckedChange={(v: boolean) => setValue('beneficiary_nominations_up_to_date', v)} />
              <Label>Beneficiary Nominations Up to Date</Label>
            </div>
          </div>
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center gap-3">
              <Switch checked={hasTrust || false} onCheckedChange={(v: boolean) => setValue('has_trust', v)} />
              <Label>Has a trust</Label>
            </div>
            {hasTrust && (
              <div className="space-y-2">
                <Label>Trust Details</Label>
                <Textarea placeholder="Trust name, type, purpose..." {...register('trust_details')} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Education Planning */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Education Planning</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => educationArray.append({ dependent_name: '', current_age: undefined, education_type: '', target_year: undefined, estimated_annual_cost: undefined, funding_in_place: undefined })}>
            <Plus className="w-3 h-3 mr-1" />Add Education Need
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {educationArray.fields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No education needs added yet</p>}
          {educationArray.fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Education Need {index + 1}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => educationArray.remove(index)}><Trash2 className="w-3 h-3" /></Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs">Dependent Name</Label>
                  <Input {...register(`education_needs.${index}.dependent_name`)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Current Age</Label>
                  <Input type="number" min={0} {...register(`education_needs.${index}.current_age`, { valueAsNumber: true })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Education Type</Label>
                  <Select defaultValue={(defaultValues.education_needs?.[index]?.education_type) || ''} onValueChange={v => setValue(`education_needs.${index}.education_type`, v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{EDUCATION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Target Year</Label>
                  <Input type="number" min={2024} {...register(`education_needs.${index}.target_year`, { valueAsNumber: true })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Est. Annual Cost (R)</Label>
                  <Input type="number" min={0} {...register(`education_needs.${index}.estimated_annual_cost`, { valueAsNumber: true })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Funding in Place (R)</Label>
                  <Input type="number" min={0} {...register(`education_needs.${index}.funding_in_place`, { valueAsNumber: true })} />
                </div>
              </div>
            </div>
          ))}
          {educationArray.fields.length > 0 && (
            <div className="space-y-2">
              <Label>Total Education Shortfall (R)</Label>
              <Input type="number" min={0} {...register('total_education_shortfall', { valueAsNumber: true })} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Interests */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Business Interests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={hasBusinessInterests || false} onCheckedChange={(v: boolean) => setValue('has_business_interests', v)} />
            <Label>Has business interests</Label>
          </div>
          {hasBusinessInterests && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input {...register('business_name')} />
              </div>
              <div className="space-y-2">
                <Label>Business Type</Label>
                <Input placeholder="e.g. Pty Ltd, Sole Prop, CC" {...register('business_type')} />
              </div>
              <div className="space-y-2">
                <Label>Estimated Business Value (R)</Label>
                <Input type="number" min={0} {...register('business_value', { valueAsNumber: true })} />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Switch checked={watch('has_buy_sell_agreement') || false} onCheckedChange={(v: boolean) => setValue('has_buy_sell_agreement', v)} />
                  <Label className="text-sm">Buy & Sell Agreement</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={watch('has_key_person_cover') || false} onCheckedChange={(v: boolean) => setValue('has_key_person_cover', v)} />
                  <Label className="text-sm">Key Person Cover</Label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gap Analysis & Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Gap Analysis & Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Insurance Gaps</Label>
            <Textarea placeholder="Identified gaps in risk cover..." {...register('insurance_gaps')} />
          </div>
          <div className="space-y-2">
            <Label>Investment Gaps</Label>
            <Textarea placeholder="Gaps in savings and investments..." {...register('investment_gaps')} />
          </div>
          <div className="space-y-2">
            <Label>Tax Opportunities</Label>
            <Textarea placeholder="Potential tax optimisations..." {...register('tax_opportunities')} />
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
            <Label>Recommendations</Label>
            <Textarea rows={4} placeholder="High-level recommendations based on analysis..." {...register('preliminary_recommendations')} />
          </div>
          <div className="space-y-2">
            <Label>Analysis Notes</Label>
            <Textarea rows={3} placeholder="Additional notes..." {...register('analysis_notes')} />
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
