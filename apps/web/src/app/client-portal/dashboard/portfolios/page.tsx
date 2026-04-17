'use client';

import { useQuery } from '@tanstack/react-query';
import portalApi from '../../portal-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Briefcase } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export default function PortalPortfoliosPage() {
  const { data: portfolios = [], isLoading } = useQuery({
    queryKey: ['portal', 'portfolios'],
    queryFn: async () => { const { data } = await portalApi.get('/portal/portfolios'); return data; },
  });

  const fmt = (n: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n);

  if (isLoading) return <div className="text-muted-foreground text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Portfolios</h1>
        <p className="text-sm text-muted-foreground mt-1">View your investment portfolios and fund allocations</p>
      </div>

      {portfolios.length === 0 ? (
        <EmptyState icon={Briefcase} title="No portfolios" description="Your advisor hasn't set up any portfolios for you yet." />
      ) : (
        <div className="space-y-4">
          {portfolios.map((p: any) => (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  <Badge variant="outline">{p.risk_level || p.investment_approach || 'N/A'}</Badge>
                </div>
                {p.total_value && <p className="text-2xl font-bold mt-1">{fmt(Number(p.total_value))}</p>}
              </CardHeader>
              <CardContent>
                {p.funds && p.funds.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Fund Allocations</p>
                    {p.funds.map((f: any) => (
                      <div key={f.id} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{f.fund?.name || 'Unknown Fund'}</p>
                          <Progress value={f.allocation_percentage} className="h-1.5 mt-1" />
                        </div>
                        <span className="text-sm font-medium ml-4">{f.allocation_percentage}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No fund allocations configured.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
