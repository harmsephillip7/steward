'use client';

import { usePortfolios, useCreatePortfolio, type CreatePortfolioDto, type PortfolioFundAllocation } from '@/lib/hooks/use-portfolios';
import { useClients } from '@/lib/hooks/use-clients';
import { useFunds, type Fund } from '@/lib/hooks/use-funds';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Briefcase, X } from 'lucide-react';

export default function PortfoliosPage() {
  const { data: portfolios, isLoading } = usePortfolios();
  const { data: clients } = useClients();
  const { data: funds } = useFunds();
  const createPortfolio = useCreatePortfolio();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', client_id: '', mandate_type: '' });
  const [allocations, setAllocations] = useState<PortfolioFundAllocation[]>([]);
  const [selectedFundId, setSelectedFundId] = useState('');

  const clientMap = Object.fromEntries(clients?.map((c) => [c.id, `${c.first_name} ${c.last_name}`]) ?? []);
  const allocatedFundIds = new Set(allocations.map((a) => a.fund_id));
  const totalAllocation = allocations.reduce((sum, a) => sum + a.allocation_pct, 0);

  function addFund() {
    if (!selectedFundId || allocatedFundIds.has(selectedFundId)) return;
    setAllocations((prev) => [...prev, { fund_id: selectedFundId, allocation_pct: 0, value: 0 }]);
    setSelectedFundId('');
  }

  function removeFund(fundId: string) {
    setAllocations((prev) => prev.filter((a) => a.fund_id !== fundId));
  }

  function updateAllocation(fundId: string, field: 'allocation_pct' | 'value', value: number) {
    setAllocations((prev) =>
      prev.map((a) => (a.fund_id === fundId ? { ...a, [field]: value } : a)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dto: CreatePortfolioDto = {
      name: form.name,
      client_id: form.client_id,
      mandate_type: form.mandate_type || undefined,
      funds: allocations.length > 0 ? allocations : undefined,
    };
    await createPortfolio.mutateAsync(dto);
    setOpen(false);
    setForm({ name: '', client_id: '', mandate_type: '' });
    setAllocations([]);
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
                <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/portfolios/${p.id}`)}>
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Portfolio</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
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
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mandate_type">Mandate Type</Label>
              <Input id="mandate_type" placeholder="e.g. Discretionary, Advisory" value={form.mandate_type} onChange={(e) => setForm({ ...form, mandate_type: e.target.value })} />
            </div>

            {/* Fund Allocations */}
            <div className="space-y-2">
              <Label>Fund Allocations</Label>
              <div className="flex gap-2">
                <select
                  className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={selectedFundId}
                  onChange={(e) => setSelectedFundId(e.target.value)}
                >
                  <option value="">Select a fund to add...</option>
                  {funds?.filter((f) => !allocatedFundIds.has(f.id)).map((f) => (
                    <option key={f.id} value={f.id}>{f.name} ({f.isin})</option>
                  ))}
                </select>
                <Button type="button" variant="outline" size="sm" onClick={addFund} disabled={!selectedFundId}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {allocations.length > 0 && (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fund</TableHead>
                        <TableHead className="w-28">Allocation %</TableHead>
                        <TableHead className="w-32">Value (R)</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allocations.map((a) => {
                        const fund = funds?.find((f) => f.id === a.fund_id);
                        return (
                          <TableRow key={a.fund_id}>
                            <TableCell className="text-sm">{fund?.name ?? a.fund_id}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                step={0.1}
                                className="h-8"
                                value={a.allocation_pct || ''}
                                onChange={(e) => updateAllocation(a.fund_id, 'allocation_pct', Number(e.target.value))}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                className="h-8"
                                value={a.value || ''}
                                onChange={(e) => updateAllocation(a.fund_id, 'value', Number(e.target.value))}
                              />
                            </TableCell>
                            <TableCell>
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeFund(a.fund_id)}>
                                <X className="h-3.5 w-3.5 text-gray-400" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <div className="px-4 py-2 bg-gray-50 text-xs flex justify-between">
                    <span>Total allocation:</span>
                    <span className={totalAllocation === 100 ? 'text-green-600 font-medium' : totalAllocation > 100 ? 'text-red-600 font-medium' : 'text-amber-600 font-medium'}>
                      {totalAllocation.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
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
