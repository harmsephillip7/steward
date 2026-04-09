'use client';

import { useClients } from '@/lib/hooks/use-clients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Plus } from 'lucide-react';

export default function FNAPage() {
  const { data: clients, isLoading } = useClients();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Planning</h1>
          <p className="text-sm text-gray-500 mt-1">Financial Needs Analysis & Records of Advice</p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" /> New FNA
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active FNAs</CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">—</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending ROAs</CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-amber-500">—</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Signed ROAs</CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-green-600">—</div></CardContent>
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
                <TableHead>FNA Status</TableHead>
                <TableHead>Last ROA</TableHead>
                <TableHead>ROA Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients?.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.first_name} {client.last_name}</TableCell>
                  <TableCell><Badge variant="secondary">Not started</Badge></TableCell>
                  <TableCell className="text-gray-400 text-sm">—</TableCell>
                  <TableCell><Badge variant="outline">No ROA</Badge></TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" disabled>Create FNA</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
