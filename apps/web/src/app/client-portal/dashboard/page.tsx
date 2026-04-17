'use client';

import { useQuery } from '@tanstack/react-query';
import portalApi from '../portal-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Target, Shield, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function PortalDashboardPage() {
  const { data: profile } = useQuery({
    queryKey: ['portal', 'profile'],
    queryFn: async () => { const { data } = await portalApi.get('/portal/profile'); return data; },
  });

  const { data: portfolios = [] } = useQuery({
    queryKey: ['portal', 'portfolios'],
    queryFn: async () => { const { data } = await portalApi.get('/portal/portfolios'); return data; },
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['portal', 'goals'],
    queryFn: async () => { const { data } = await portalApi.get('/portal/goals'); return data; },
  });

  const { data: insurance = [] } = useQuery({
    queryKey: ['portal', 'insurance'],
    queryFn: async () => { const { data } = await portalApi.get('/portal/insurance'); return data; },
  });

  const totalValue = portfolios.reduce((s: number, p: any) => s + (Number(p.total_value) || 0), 0);
  const fmt = (n: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome{profile?.first_name ? `, ${profile.first_name}` : ''}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Here&apos;s an overview of your financial plan</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-primary" />
            <div><div className="text-xl font-bold">{portfolios.length}</div><p className="text-xs text-muted-foreground">Portfolios</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Wallet className="w-8 h-8 text-green-500" />
            <div><div className="text-xl font-bold">{fmt(totalValue)}</div><p className="text-xs text-muted-foreground">Total Value</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Target className="w-8 h-8 text-purple-500" />
            <div><div className="text-xl font-bold">{goals.length}</div><p className="text-xs text-muted-foreground">Financial Goals</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Shield className="w-8 h-8 text-orange-500" />
            <div><div className="text-xl font-bold">{insurance.length}</div><p className="text-xs text-muted-foreground">Insurance Policies</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/client-portal/dashboard/portfolios">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Briefcase className="w-4 h-4" />My Portfolios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View your investment portfolios, fund allocations, and performance.</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/client-portal/dashboard/goals">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Target className="w-4 h-4" />My Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Track your financial goals, targets, and progress.</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/client-portal/dashboard/insurance">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4" />My Insurance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View your insurance policies, coverage amounts, and premiums.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
