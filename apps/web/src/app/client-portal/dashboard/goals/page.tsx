'use client';

import { useQuery } from '@tanstack/react-query';
import portalApi from '../../portal-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export default function PortalGoalsPage() {
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['portal', 'goals'],
    queryFn: async () => { const { data } = await portalApi.get('/portal/goals'); return data; },
  });

  const fmt = (n: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n);

  if (isLoading) return <div className="text-muted-foreground text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Goals</h1>
        <p className="text-sm text-muted-foreground mt-1">Track progress towards your financial goals</p>
      </div>

      {goals.length === 0 ? (
        <EmptyState icon={Target} title="No financial goals" description="Your advisor hasn't set up any financial goals yet." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {goals.map((g: any) => {
            const progress = g.current_value && g.target_amount ? Math.min(100, Math.round((g.current_value / g.target_amount) * 100)) : 0;
            return (
              <Card key={g.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{g.goal_type?.replace(/_/g, ' ') || 'Goal'}</CardTitle>
                    <Badge variant={g.status === 'achieved' ? 'default' : 'outline'}>{g.status || 'active'}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Target</span>
                      <span className="font-medium">{fmt(g.target_amount || 0)}</span>
                    </div>
                    {g.current_value != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current</span>
                        <span className="font-medium">{fmt(g.current_value)}</span>
                      </div>
                    )}
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    {g.target_date && (
                      <p className="text-xs text-muted-foreground">Target: {new Date(g.target_date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short' })}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
