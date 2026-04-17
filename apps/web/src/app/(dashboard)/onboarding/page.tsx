'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Building2, UserPlus, Briefcase, CheckCircle2, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

const STEPS = [
  { key: 'welcome', label: 'Welcome', icon: Sparkles },
  { key: 'firm', label: 'Firm Setup', icon: Building2 },
  { key: 'client', label: 'First Client', icon: UserPlus },
  { key: 'complete', label: 'All Set', icon: CheckCircle2 },
];

export default function OnboardingWizardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const progress = Math.round(((step) / (STEPS.length - 1)) * 100);

  // Firm setup form
  const [firmForm, setFirmForm] = useState({
    firm_name: '',
    fsp_number: '',
    primary_colour_hex: '#003B43',
  });

  // Client form
  const [clientForm, setClientForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    id_number: '',
  });

  const saveFirm = useMutation({
    mutationFn: async () => {
      await api.patch('/advisors/me/branding', firmForm);
    },
    onSuccess: () => {
      toast.success('Firm details saved');
      setStep(2);
    },
    onError: () => toast.error('Failed to save firm details'),
  });

  const createClient = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/clients', clientForm);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client created');
      setStep(3);
    },
    onError: () => toast.error('Failed to create client'),
  });

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.key} className={`flex items-center gap-1.5 ${i <= step ? 'text-primary font-medium' : ''}`}>
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            );
          })}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step 0: Welcome */}
      {step === 0 && (
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to Steward</CardTitle>
            <CardDescription className="text-base mt-2">
              Let&apos;s get your practice set up in just a few steps. We&apos;ll configure your firm details and create your first client.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Building2 className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs font-medium">Firm Setup</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <UserPlus className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs font-medium">First Client</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Briefcase className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs font-medium">Ready to Go</p>
              </div>
            </div>
            <Button className="w-full" size="lg" onClick={() => setStep(1)}>
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Firm Setup */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Firm Details
            </CardTitle>
            <CardDescription>Tell us about your financial advisory practice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ob_firm_name">Firm Name *</Label>
              <Input
                id="ob_firm_name"
                value={firmForm.firm_name}
                onChange={e => setFirmForm({ ...firmForm, firm_name: e.target.value })}
                placeholder="e.g. Steward Financial Services"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ob_fsp">FSP Number</Label>
              <Input
                id="ob_fsp"
                value={firmForm.fsp_number}
                onChange={e => setFirmForm({ ...firmForm, fsp_number: e.target.value })}
                placeholder="e.g. FSP-12345"
              />
              <p className="text-xs text-muted-foreground">Your FSCA licence number (optional for now)</p>
            </div>
            <div className="space-y-1.5">
              <Label>Brand Colour</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={firmForm.primary_colour_hex}
                  onChange={e => setFirmForm({ ...firmForm, primary_colour_hex: e.target.value })}
                  className="h-10 w-16 rounded border cursor-pointer p-1"
                />
                <Input
                  value={firmForm.primary_colour_hex}
                  onChange={e => setFirmForm({ ...firmForm, primary_colour_hex: e.target.value })}
                  className="w-36 font-mono"
                />
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(0)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={() => saveFirm.mutate()} disabled={!firmForm.firm_name || saveFirm.isPending}>
                {saveFirm.isPending ? 'Saving…' : 'Continue'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: First Client */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> Add Your First Client
            </CardTitle>
            <CardDescription>Create a client record to start managing their financial plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ob_first">First Name *</Label>
                <Input id="ob_first" value={clientForm.first_name} onChange={e => setClientForm({ ...clientForm, first_name: e.target.value })} placeholder="John" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ob_last">Last Name *</Label>
                <Input id="ob_last" value={clientForm.last_name} onChange={e => setClientForm({ ...clientForm, last_name: e.target.value })} placeholder="Smith" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ob_email">Email</Label>
              <Input id="ob_email" type="email" value={clientForm.email} onChange={e => setClientForm({ ...clientForm, email: e.target.value })} placeholder="john@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ob_phone">Phone</Label>
              <Input id="ob_phone" value={clientForm.phone} onChange={e => setClientForm({ ...clientForm, phone: e.target.value })} placeholder="082 123 4567" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ob_id">ID Number</Label>
              <Input id="ob_id" value={clientForm.id_number} onChange={e => setClientForm({ ...clientForm, id_number: e.target.value })} placeholder="13 digit SA ID" />
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(3)}>Skip</Button>
                <Button onClick={() => createClient.mutate()} disabled={!clientForm.first_name || !clientForm.last_name || createClient.isPending}>
                  {createClient.isPending ? 'Creating…' : 'Create Client'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Complete */}
      {step === 3 && (
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">You&apos;re All Set!</CardTitle>
            <CardDescription className="text-base mt-2">
              Your practice is ready. Explore the dashboard or continue setting up clients, portfolios, and compliance.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <Button className="w-full" size="lg" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => router.push('/clients')}>
                <UserPlus className="mr-2 h-4 w-4" /> Add More Clients
              </Button>
              <Button variant="outline" onClick={() => router.push('/settings')}>
                <Building2 className="mr-2 h-4 w-4" /> Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
