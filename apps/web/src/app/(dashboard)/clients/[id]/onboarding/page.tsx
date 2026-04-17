'use client';

import { useParams } from 'next/navigation';
import { useOnboarding, useCreateOnboarding, useUpdateOnboardingItem } from '@/lib/hooks/use-crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Loader2, ClipboardList } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingPage() {
  const { id } = useParams<{ id: string }>();
  const { data: onboarding, isLoading, error } = useOnboarding(id);
  const createOnboarding = useCreateOnboarding(id);
  const updateItem = useUpdateOnboardingItem(id);

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  if (!onboarding || error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <ClipboardList className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">No onboarding checklist found for this client.</p>
        <Button onClick={() => createOnboarding.mutate()}>Start Onboarding</Button>
      </div>
    );
  }

  const items = onboarding.items || [];
  const completed = items.filter(i => i.completed).length;
  const required = items.filter(i => i.required).length;
  const requiredCompleted = items.filter(i => i.required && i.completed).length;
  const progress = items.length ? Math.round((completed / items.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client Onboarding</h1>
          <p className="text-muted-foreground">Track onboarding progress</p>
        </div>
        <Badge className={onboarding.status === 'completed' ? 'bg-green-100 text-green-800' : onboarding.status === 'in_progress' ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground'}>
          {onboarding.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completed}/{items.length} completed</span>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Required: {requiredCompleted}/{required}</span>
            <span>{progress}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader><CardTitle className="text-base">Checklist Items</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1">
            {items.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => updateItem.mutate({ key: item.key, completed: !item.completed })}
              >
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {item.label}
                  </p>
                  {item.completed_at && (
                    <p className="text-xs text-muted-foreground">
                      Completed {new Date(item.completed_at).toLocaleDateString('en-ZA')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {item.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Link href={`/clients/${id}`}><Button variant="outline">Back to Client</Button></Link>
        <Link href={`/clients/${id}/profile`}><Button variant="outline">Client Profile</Button></Link>
      </div>
    </div>
  );
}
