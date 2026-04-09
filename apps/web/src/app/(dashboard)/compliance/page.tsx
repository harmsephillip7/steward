'use client';

import { useClients } from '@/lib/hooks/use-clients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

function StatusBadge({ done }: { done: boolean }) {
  return done ? (
    <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">Complete</Badge>
  ) : (
    <Badge variant="outline" className="text-amber-600 border-amber-300">Pending</Badge>
  );
}

export default function CompliancePage() {
  const { data: clients, isLoading } = useClients();

  const compliantCount = clients?.filter(
    (c) => c.fica_complete && c.kyc_complete && c.source_of_wealth_declared && c.risk_profile_complete,
  ).length ?? 0;

  const pendingCount = (clients?.length ?? 0) - compliantCount;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Compliance</h1>
        <p className="text-sm text-gray-500 mt-1">FICA, FAIS & KYC status per client</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clients?.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reviews</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{isLoading ? '—' : pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fully Compliant</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{isLoading ? '—' : compliantCount}</div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : clients?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="font-semibold text-gray-900">No compliance records</h3>
            <p className="text-sm text-gray-500 mt-1">Add clients to track compliance status.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>FICA</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Source of Wealth</TableHead>
                <TableHead>Risk Profile</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients?.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.first_name} {client.last_name}</TableCell>
                  <TableCell className="text-gray-500 text-sm">{client.email}</TableCell>
                  <TableCell><StatusBadge done={client.fica_complete} /></TableCell>
                  <TableCell><StatusBadge done={client.kyc_complete} /></TableCell>
                  <TableCell><StatusBadge done={client.source_of_wealth_declared} /></TableCell>
                  <TableCell><StatusBadge done={client.risk_profile_complete} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
