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
import type { DiscoveryData } from '@steward/shared';

interface DiscoveryFormProps {
  defaultValues: DiscoveryData;
  onSubmit: (data: DiscoveryData) => void;
  isPending: boolean;
}

const LIFE_STAGES = ['Early Career', 'Mid Career', 'Pre-Retirement', 'Retirement', 'Estate Planning'] as const;
const COMMUNICATION_PREFS = ['Email', 'Phone', 'WhatsApp', 'In-Person', 'Video Call'] as const;

export function DiscoveryForm({ defaultValues, onSubmit, isPending }: DiscoveryFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm<DiscoveryData>({
    defaultValues,
  });

  const hasExistingAdvisor = watch('has_existing_advisor');

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

      {/* Personal Situation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Personal Situation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Life Stage</Label>
            <Select defaultValue={defaultValues.life_stage || ''} onValueChange={v => setValue('life_stage', v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {LIFE_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
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

      {/* Existing Advisor & Products */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Existing Coverage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={hasExistingAdvisor || false}
              onCheckedChange={v => setValue('has_existing_advisor', v)}
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
        <CardContent className="grid gap-4 sm:grid-cols-2">
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
