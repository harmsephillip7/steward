'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useOnboardingSession, useSubmitOnboardingStep, STEP_LABELS } from '@/lib/hooks/use-onboarding-links';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// ── Step form components ─────────────────────────────────────────────────────

function KycForm({ onSubmit }: { onSubmit: (data: Record<string, any>) => void }) {
  const [idNumber, setIdNumber] = useState('');
  const [dob, setDob] = useState('');
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Please provide your South African ID number to verify your identity.
      </p>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">SA ID Number</label>
        <input
          type="text"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="YYMMDDXXXXXXX"
          maxLength={13}
          value={idNumber}
          onChange={e => setIdNumber(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Date of Birth</label>
        <input
          type="date"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={dob}
          onChange={e => setDob(e.target.value)}
        />
      </div>
      <Button
        className="w-full"
        disabled={idNumber.length < 13}
        onClick={() => onSubmit({ id_number: idNumber, dob })}
      >
        Continue
      </Button>
    </div>
  );
}

function FicaForm({ onSubmit }: { onSubmit: (data: Record<string, any>) => void }) {
  const [agreed, setAgreed] = useState(false);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        In terms of the Financial Intelligence Centre Act (FICA), we are required to verify your identity and keep records of any transactions.
      </p>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
        />
        <span className="text-sm">
          I confirm that the information I have provided is accurate and complete, and I understand my obligations under FICA.
        </span>
      </label>
      <Button className="w-full" disabled={!agreed} onClick={() => onSubmit({})}>
        I Confirm
      </Button>
    </div>
  );
}

function SourceOfWealthForm({ onSubmit }: { onSubmit: (data: Record<string, any>) => void }) {
  const [declaration, setDeclaration] = useState('');
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Please describe the source of your wealth (e.g., employment income, inheritance, business proceeds, investments).
      </p>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Source of Wealth</label>
        <textarea
          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
          placeholder="Describe the origin of your wealth..."
          value={declaration}
          onChange={e => setDeclaration(e.target.value)}
        />
      </div>
      <Button className="w-full" disabled={declaration.length < 20} onClick={() => onSubmit({ declaration })}>
        Continue
      </Button>
    </div>
  );
}

function RiskProfileForm({ onSubmit }: { onSubmit: (data: Record<string, any>) => void }) {
  const [profile, setProfile] = useState('');
  const options = [
    { value: 'conservative', label: 'Conservative', desc: 'Capital preservation is most important. Low risk, lower returns.' },
    { value: 'moderate', label: 'Moderate', desc: 'Balanced approach — some growth with managed risk.' },
    { value: 'moderate_aggressive', label: 'Moderate Aggressive', desc: 'Growth-focused with higher risk tolerance.' },
    { value: 'aggressive', label: 'Aggressive', desc: 'Maximum growth potential, accepts high volatility.' },
  ];
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select the risk profile that best describes your investment approach and tolerance for volatility.
      </p>
      <div className="space-y-2">
        {options.map(opt => (
          <label
            key={opt.value}
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              profile === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'
            }`}
          >
            <input
              type="radio"
              name="risk_profile"
              value={opt.value}
              className="mt-0.5"
              checked={profile === opt.value}
              onChange={() => setProfile(opt.value)}
            />
            <div>
              <p className="text-sm font-medium">{opt.label}</p>
              <p className="text-xs text-muted-foreground">{opt.desc}</p>
            </div>
          </label>
        ))}
      </div>
      <Button className="w-full" disabled={!profile} onClick={() => onSubmit({ risk_profile: profile })}>
        Continue
      </Button>
    </div>
  );
}

function PersonalDetailsForm({ onSubmit }: { onSubmit: (data: Record<string, any>) => void }) {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', id_number: '', dob: '' });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Please confirm or update your personal details.</p>
      <div className="grid grid-cols-2 gap-3">
        {([['first_name', 'First Name', 'text'], ['last_name', 'Last Name', 'text'], ['email', 'Email Address', 'email'], ['phone', 'Phone Number', 'tel'], ['id_number', 'ID Number', 'text'], ['dob', 'Date of Birth', 'date']] as const).map(([key, label, type]) => (
          <div key={key} className="space-y-1.5">
            <label className="text-sm font-medium">{label}</label>
            <input
              type={type}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form[key]}
              onChange={set(key)}
            />
          </div>
        ))}
      </div>
      <Button
        className="w-full"
        disabled={!form.first_name || !form.last_name}
        onClick={() => onSubmit(Object.fromEntries(Object.entries(form).filter(([, v]) => v)))}
      >
        Continue
      </Button>
    </div>
  );
}

// ── Main wizard page ─────────────────────────────────────────────────────────

export default function OnboardingWizardPage() {
  const { token } = useParams<{ token: string }>();
  const { data: session, isLoading, error } = useOnboardingSession(token);
  const submitStep = useSubmitOnboardingStep(token);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !session) {
    const msg = (error as any)?.response?.data?.message ?? 'This link is invalid or has expired.';
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Link Not Available</h1>
          <p className="text-muted-foreground text-sm">{msg}</p>
        </div>
      </div>
    );
  }

  // Filter to remaining (not yet completed) steps
  const remainingSteps = session.steps.filter(s => !session.completed_steps.includes(s));

  if (remainingSteps.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">All Done!</h1>
          <p className="text-muted-foreground text-sm">
            Thank you, {session.client_name.split(' ')[0]}. Your onboarding is complete.
            Your advisor has been notified.
          </p>
        </div>
      </div>
    );
  }

  const currentStep = remainingSteps[currentStepIdx];
  const totalSteps = remainingSteps.length;
  const isLast = currentStepIdx === totalSteps - 1;

  async function handleStepSubmit(data: Record<string, any>) {
    await submitStep.mutateAsync({ step: currentStep, data });
    if (isLast) {
      // session will refetch showing remainingSteps = 0 → "All Done"
      setCurrentStepIdx(0);
    } else {
      setCurrentStepIdx(i => i + 1);
    }
  }

  const stepForms: Record<string, React.ReactNode> = {
    kyc: <KycForm onSubmit={handleStepSubmit} />,
    fica: <FicaForm onSubmit={handleStepSubmit} />,
    source_of_wealth: <SourceOfWealthForm onSubmit={handleStepSubmit} />,
    risk_profile: <RiskProfileForm onSubmit={handleStepSubmit} />,
    personal_details: <PersonalDetailsForm onSubmit={handleStepSubmit} />,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
          S
        </div>
        <div>
          <p className="text-sm font-semibold">Steward</p>
          <p className="text-xs text-muted-foreground">Onboarding for {session.client_name}</p>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center p-6">
        <div className="w-full max-w-md">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Step {currentStepIdx + 1} of {totalSteps}</span>
              <span>{Math.round(((currentStepIdx) / totalSteps) * 100)}% complete</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${((currentStepIdx) / totalSteps) * 100}%` }}
              />
            </div>
            {/* Step dots */}
            <div className="flex gap-2 mt-3">
              {remainingSteps.map((step, i) => (
                <div
                  key={step}
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    i < currentStepIdx ? 'bg-green-500' : i === currentStepIdx ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step card */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-1">{STEP_LABELS[currentStep] ?? currentStep}</h2>
            <p className="text-xs text-muted-foreground mb-5">
              Step {currentStepIdx + 1} of {totalSteps}
            </p>
            {submitStep.isPending ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              stepForms[currentStep] ?? (
                <Button className="w-full" onClick={() => handleStepSubmit({})}>Continue</Button>
              )
            )}
          </div>

          {/* Steps list */}
          <div className="mt-6 space-y-1.5">
            {remainingSteps.map((step, i) => (
              <div
                key={step}
                className={`flex items-center gap-2 text-xs px-3 py-2 rounded-md ${
                  i === currentStepIdx ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                {i < currentStepIdx ? (
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <span className="h-3.5 w-3.5 rounded-full border border-current flex items-center justify-center text-[9px]">
                    {i + 1}
                  </span>
                )}
                {STEP_LABELS[step] ?? step}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
