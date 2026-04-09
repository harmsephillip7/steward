'use client';

import { usePortfolios, useCreatePortfolio, type CreatePortfolioDto } from '@/lib/hooks/use-portfolios';
import { useClients } from '@/lib/hooks/use-clients';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Briefcase } from 'lucide-react';

export default function PortfoliosPage() {
  const { data: portfolios, isLoading } = usePortfolios();
  const { data: clients } = useClients();
  const createPortfolio = useCreatePortfolio();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreatePortfolioDto>({ name: '', client_id: '', mandate_type: '' });

  const clientMap = Object.fromEntries(clients?.map((c) => [c.id, `${c.first_name} ${c.last_name}`]) ?? []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createPortfolio.mutateAsync(form);
    setOpen(false);
    setForm({ name: '', client_id: '', mandate_type: '' });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolios</h1>
          <p className="text-sm text-gray-500 mt-1">{portfolios?.length ?? 0} managed portfolios</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Portfolio
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : portfolios?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Briefcase className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="font-semibold text-gray-900">No portfolios yet</h3>
            <p className="text-sm text-gray-500 mt-1">Create a portfolio and link it to a client.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Portfolio Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Mandate Type</TableHead>
                <TableHead>Inception Date</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portfolios?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-gray-500">{clientMap[p.client_id] || p.client_id}</TableCell>
                  <TableCell>
                    {p.mandate_type ? <Badge variant="outline">{p.mandate_type}</Badge> : <span className="text-gray-400">—</span>}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {p.inception_date ? new Date(p.inception_date).toLocaleDateString('en-ZA') : '—'}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {p.value != null ? `R ${p.value.toLocaleString('en-ZA')}` : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Portfolio</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pname">Portfolio Name *</Label>
              <Input id="pname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client_id">Client *</Label>
              <select
                id="client_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                required
              >
                <option value="">Select a client...</option>
                {clients?.map((c) => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mandate_type">Mandate Type</Label>
              <Input id="mandate_type" placeholder="e.g. Discretionary, Advisory" value={form.mandate_type} onChange={(e) => setForm({ ...form, mandate_type: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createPortfolio.isPending}>
                {createPortfolio.isPending ? 'Creating...' : 'Create Portfolio'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
