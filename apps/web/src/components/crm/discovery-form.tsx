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
import type { DiscoveryData } from '@steward/shared';

interface DiscoveryFormProps {
  defaultValues: DiscoveryData;
  onSubmit: (data: DiscoveryData) => void;
  isPending: boolean;
}

const LIFE_STAGES = ['Early Career', 'Mid Career', 'Pre-Retirement', 'Retirement', 'Estate Planning'] as const;
const COMMUNICATION_PREFS = ['Email', 'Phone', 'WhatsApp', 'In-Person', 'Video Call'] as const;
const MARITAL_STATUSES = ['Single', 'Married (COP)', 'Married (AOP)', 'Divorced', 'Widowed', 'Life Partner'] as const;
const EMPLOYMENT_STATUSES = ['Employed', 'Self-Employed', 'Retired', 'Unemployed', 'Student'] as const;
const HEALTH_STATUSES = ['Excellent', 'Good', 'Fair', 'Poor'] as const;
const TAX_RESIDENCIES = ['SA Resident', 'Non-Resident'] as const;
const DEPENDENT_RELATIONSHIPS = ['Child', 'Spouse', 'Parent', 'Sibling', 'Other'] as const;

export function DiscoveryForm({ defaultValues, onSubmit, isPending }: DiscoveryFormProps) {
  const { register, handleSubmit, setValue, watch, control } = useForm<DiscoveryData>({
    defaultValues: {
      ...defaultValues,
      dependents_details: defaultValues.dependents_details || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'dependents_details' as any,
  });

  const hasExistingAdvisor = watch('has_existing_advisor');
  const maritalStatus = watch('marital_status');
  const isMarried = maritalStatus && ['Married (COP)', 'Married (AOP)', 'Life Partner'].includes(maritalStatus);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Motivation & Goals */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Motivation & Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="motivation">What prompted this meeting?</Label>
            <Textarea id="motivation" placeholder="What motivated the client to seek advice..." {...register('motivation')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goals_overview">Goals Overview</Label>
            <Textarea id="goals_overview" placeholder="Client's primary financial goals..." {...register('goals_overview')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pain_points">Pain Points / Concerns</Label>
            <Textarea id="pain_points" placeholder="Key worries or frustrations..." {...register('pain_points')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="key_concerns">Key Concerns</Label>
            <Textarea id="key_concerns" placeholder="Specific concerns to address..." {...register('key_concerns')} />
          </div>
        </CardContent>
      </Card>

      {/* Personal Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Personal Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="id_number">SA ID Number</Label>
            <Input id="id_number" placeholder="13 digit ID number" maxLength={13} {...register('id_number')} />
          </div>
          <div className="space-y-2">
            <Label>Marital Status</Label>
            <Select defaultValue={defaultValues.marital_status || ''} onValueChange={v => setValue('marital_status', v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {MARITAL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Life Stage</Label>
            <Select defaultValue={defaultValues.life_stage || ''} onValueChange={v => setValue('life_stage', v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {LIFE_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {isMarried && (
            <>
              <div className="space-y-2">
                <Label htmlFor="spouse_name">Spouse / Partner Name</Label>
                <Input id="spouse_name" placeholder="Full name" {...register('spouse_name')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spouse_id_number">Spouse ID Number</Label>
                <Input id="spouse_id_number" placeholder="13 digit ID number" maxLength={13} {...register('spouse_id_number')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spouse_dob">Spouse Date of Birth</Label>
                <Input id="spouse_dob" type="date" {...register('spouse_dob')} />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="family_situation">Family Situation</Label>
            <Input id="family_situation" placeholder="e.g. Married, 2 children" {...register('family_situation')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number_of_dependents">Number of Dependents</Label>
            <Input id="number_of_dependents" type="number" min={0} {...register('number_of_dependents', { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>Preferred Communication</Label>
            <Select defaultValue={defaultValues.preferred_communication || ''} onValueChange={v => setValue('preferred_communication', v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {COMMUNICATION_PREFS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employment & Tax */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Employment & Tax</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Employment Status</Label>
            <Select defaultValue={defaultValues.employment_status || ''} onValueChange={v => setValue('employment_status', v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Input id="occupation" placeholder="Job title" {...register('occupation')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employer">Employer</Label>
            <Input id="employer" placeholder="Company name" {...register('employer')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" placeholder="e.g. Finance, IT, Healthcare" {...register('industry')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="years_employed">Years at Current Employer</Label>
            <Input id="years_employed" type="number" min={0} {...register('years_employed', { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax_number">Tax Number</Label>
            <Input id="tax_number" placeholder="SARS tax reference number" {...register('tax_number')} />
          </div>
          <div className="space-y-2">
            <Label>Tax Residency</Label>
            <Select defaultValue={defaultValues.tax_residency || ''} onValueChange={v => setValue('tax_residency', v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {TAX_RESIDENCIES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="retirement_age_target">Target Retirement Age</Label>
            <Input id="retirement_age_target" type="number" min={40} max={75} {...register('retirement_age_target', { valueAsNumber: true })} />
          </div>
        </CardContent>
      </Card>

      {/* Health & Lifestyle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Health & Lifestyle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Switch
                checked={watch('smoker') || false}
                onCheckedChange={(v: boolean) => setValue('smoker', v)}
              />
              <Label>Smoker</Label>
            </div>
            <div className="space-y-2">
              <Label>Health Status</Label>
              <Select defaultValue={defaultValues.health_status || ''} onValueChange={v => setValue('health_status', v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {HEALTH_STATUSES.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="health_conditions">Known Health Conditions</Label>
            <Textarea id="health_conditions" placeholder="Any existing conditions, medications, surgeries..." {...register('health_conditions')} />
          </div>
        </CardContent>
      </Card>

      {/* Dependents */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Dependents</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: '', relationship: '', dob: '', is_student: false, special_needs: false, monthly_support_amount: undefined })}
          >
            <Plus className="w-3 h-3 mr-1" />Add Dependent
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No dependents added yet</p>
          )}
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dependent {index + 1}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input placeholder="Full name" {...register(`dependents_details.${index}.name`)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Relationship</Label>
                  <Select
                    defaultValue={(defaultValues.dependents_details?.[index]?.relationship) || ''}
                    onValueChange={v => setValue(`dependents_details.${index}.relationship`, v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {DEPENDENT_RELATIONSHIPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Date of Birth</Label>
                  <Input type="date" {...register(`dependents_details.${index}.dob`)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Monthly Support (R)</Label>
                  <Input type="number" min={0} {...register(`dependents_details.${index}.monthly_support_amount`, { valueAsNumber: true })} />
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <Switch
                    checked={watch(`dependents_details.${index}.is_student`) || false}
                    onCheckedChange={(v: boolean) => setValue(`dependents_details.${index}.is_student`, v)}
                  />
                  <Label className="text-xs">Student</Label>
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <Switch
                    checked={watch(`dependents_details.${index}.special_needs`) || false}
                    onCheckedChange={(v: boolean) => setValue(`dependents_details.${index}.special_needs`, v)}
                  />
                  <Label className="text-xs">Special Needs</Label>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Existing Advisor & Products */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Existing Coverage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={hasExistingAdvisor || false}
              onCheckedChange={(v: boolean) => setValue('has_existing_advisor', v)}
            />
            <Label>Has an existing financial advisor</Label>
          </div>
          {hasExistingAdvisor && (
            <div className="space-y-2">
              <Label htmlFor="current_advisor">Current Advisor Name</Label>
              <Input id="current_advisor" placeholder="Advisor name / firm" {...register('current_advisor')} />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="existing_products">Existing Products</Label>
            <Textarea id="existing_products" placeholder="List existing policies, investments, retirement funds..." {...register('existing_products')} />
          </div>
        </CardContent>
      </Card>

      {/* Financial Snapshot */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Financial Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="estimated_investable_assets">Estimated Investable Assets (R)</Label>
            <Input id="estimated_investable_assets" type="number" min={0} {...register('estimated_investable_assets', { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estimated_monthly_income">Estimated Monthly Income (R)</Label>
            <Input id="estimated_monthly_income" type="number" min={0} {...register('estimated_monthly_income', { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estimated_monthly_expenses">Estimated Monthly Expenses (R)</Label>
            <Input id="estimated_monthly_expenses" type="number" min={0} {...register('estimated_monthly_expenses', { valueAsNumber: true })} />
          </div>
        </CardContent>
      </Card>

      {/* Meeting Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Meeting Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea rows={4} placeholder="Additional notes from the meeting..." {...register('meeting_notes')} />
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save Discovery Data
      </Button>
    </form>
  );
}
