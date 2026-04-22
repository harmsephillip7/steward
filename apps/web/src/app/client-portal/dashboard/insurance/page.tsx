'use client';

import { useQuery } from '@tanstack/react-query';
import portalApi from '../../portal-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export default function PortalInsurancePage() {
  const { data: policies = [], isLoading } = useQuery({
    queryKey: ['portal', 'insurance'],
    queryFn: async () => { const { data } = await portalApi.get('/portal/insurance'); return data; },
  });

  const fmt = (n: number) => `R ${n.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`;

  if (isLoading) return <div className="text-muted-foreground text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Insurance</h1>
        <p className="text-sm text-muted-foreground mt-1">Your insurance policies and coverage</p>
      </div>

      {policies.length === 0 ? (
        <EmptyState icon={Shield} title="No insurance policies" description="Your advisor hasn't recorded any insurance policies yet." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {policies.map((p: any) => (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base capitalize">{p.policy_type?.replace(/_/g, ' ')}</CardTitle>
                  <Badge variant={p.status === 'active' ? 'default' : 'secondary'}>{p.status}</Badge>
                </div>
                {p.provider && <p className="text-sm text-muted-foreground">{p.provider}</p>}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {p.policy_number && (
                    <div><p className="text-xs text-muted-foreground">Policy Number</p><p className="font-medium">{p.policy_number}</p></div>
                  )}
                  {p.cover_amount && (
                    <div><p className="text-xs text-muted-foreground">Cover Amount</p><p className="font-medium">{fmt(p.cover_amount)}</p></div>
                  )}
                  {p.premium && (
                    <div><p className="text-xs text-muted-foreground">Monthly Premium</p><p className="font-medium">{fmt(p.premium)}</p></div>
                  )}
                  {p.expiry_date && (
                    <div><p className="text-xs text-muted-foreground">Expiry Date</p><p className="font-medium">{new Date(p.expiry_date).toLocaleDateString('en-ZA')}</p></div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
