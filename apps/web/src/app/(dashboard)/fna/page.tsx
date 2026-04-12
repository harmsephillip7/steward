'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClients, type ClientDetail } from '@/lib/hooks/use-clients';
import { useClientPlans, type FinancialPlan } from '@/lib/hooks/use-fna';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Plus, Eye } from 'lucide-react';

const RISK_LABELS: Record<string, string> = {
  conservative: 'Conservative',
  moderate_conservative: 'Moderate Conservative',
  moderate: 'Moderate',
  moderate_aggressive: 'Moderate Aggressive',
  aggressive: 'Aggressive',
};

function PlanRow({ client }: { client: { id: string; first_name: string; last_name: string } }) {
  const router = useRouter();
  const { data: plans } = useClientPlans(client.id);
  const latestPlan = plans?.[0];

  return (
    <TableRow key={client.id}>
      <TableCell className="font-medium">{client.first_name} {client.last_name}</TableCell>
      <TableCell>
        {latestPlan ? (
          <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
            {RISK_LABELS[latestPlan.risk_profile] ?? latestPlan.risk_profile}
          </Badge>
        ) : (
          <Badge variant="secondary">Not started</Badge>
        )}
      </TableCell>
      <TableCell className="text-gray-500 text-sm">
        {latestPlan ? new Date(latestPlan.created_at).toLocaleDateString('en-ZA') : '—'}
      </TableCell>
      <TableCell className="text-sm">{plans?.length ?? 0}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/fna/${client.id}`)}
          >
            {latestPlan ? 'New FNA' : 'Create FNA'}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function FNAPage() {
  const { data: clients, isLoading } = useClients();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Planning</h1>
          <p className="text-sm text-gray-500 mt-1">Financial Needs Analysis & Records of Advice</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{clients?.length ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">FNA Plans</CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-primary">—</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Risk Profiled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {clients?.filter((c) => c.risk_profile_complete).length ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : clients?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="font-semibold text-gray-900">No financial plans yet</h3>
            <p className="text-sm text-gray-500 mt-1">Add clients first, then create FNAs and ROAs.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Risk Profile</TableHead>
                <TableHead>Last FNA</TableHead>
                <TableHead>Total Plans</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients?.map((client) => (
                <PlanRow key={client.id} client={client} />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
