'use client';

import { useState } from 'react';
import { useCommissions, useCommissionSummary, useCreateCommission, useUpdateCommission, useIntegrations, useCreateIntegration } from '@/lib/hooks/use-commissions';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, Receipt, Plug, Plus, CheckCircle2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

const COMMISSION_TYPES = ['initial', 'ongoing', 'performance', 'fee_based'];
const COMMISSION_STATUSES = ['expected', 'received', 'disputed', 'clawed_back'];
const INTEGRATION_PROVIDERS = ['bank_feed', 'credit_bureau', 'property_valuation', 'product_provider', 'tax_authority'];
const SYNC_FREQUENCIES = ['manual', 'daily', 'weekly', 'monthly'];

const statusColor: Record<string, string> = { expected: 'outline', received: 'default', disputed: 'destructive', clawed_back: 'secondary' };

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
}

export default function CommissionsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data: commissions = [], isLoading } = useCommissions(statusFilter || undefined);
  const { data: summary } = useCommissionSummary();
  const { data: integrations = [] } = useIntegrations();
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: async () => { const { data } = await api.get('/clients'); return data; } });

  const createCommission = useCreateCommission();
  const updateCommission = useUpdateCommission();
  const createIntegration = useCreateIntegration();

  const [commOpen, setCommOpen] = useState(false);
  const [commForm, setCommForm] = useState({ client_id: '', product_name: '', commission_type: 'initial', amount: '', effective_date: '', notes: '' });
  const [intOpen, setIntOpen] = useState(false);
  const [intForm, setIntForm] = useState({ provider: 'product_provider', name: '', sync_frequency: 'manual' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Commissions & Revenue</h1>
          <p className="text-muted-foreground">Track commissions, fees, and integrations</p>
        </div>
        <Dialog open={commOpen} onOpenChange={setCommOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Record Commission</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record Commission</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Client</Label>
                <Select value={commForm.client_id} onValueChange={v => setCommForm(f => ({ ...f, client_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>{clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Product Name</Label><Input value={commForm.product_name} onChange={e => setCommForm(f => ({ ...f, product_name: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={commForm.commission_type} onValueChange={v => setCommForm(f => ({ ...f, commission_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{COMMISSION_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Amount (excl. VAT) *</Label><Input type="number" value={commForm.amount} onChange={e => setCommForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" /></div>
              </div>
              <div><Label>Effective Date *</Label><Input type="date" value={commForm.effective_date} onChange={e => setCommForm(f => ({ ...f, effective_date: e.target.value }))} /></div>
              <div><Label>Notes</Label><Input value={commForm.notes} onChange={e => setCommForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <p className="text-xs text-muted-foreground">VAT (15%) will be calculated automatically</p>
              <Button disabled={!commForm.amount || !commForm.effective_date || createCommission.isPending} onClick={() => {
                const dto: any = { ...commForm, amount: parseFloat(commForm.amount) };
                if (!dto.client_id) delete dto.client_id;
                if (!dto.product_name) delete dto.product_name;
                if (!dto.notes) delete dto.notes;
                createCommission.mutate(dto);
                setCommOpen(false);
                setCommForm({ client_id: '', product_name: '', commission_type: 'initial', amount: '', effective_date: '', notes: '' });
              }}>Record</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="pt-4 flex items-center gap-3"><DollarSign className="w-8 h-8 text-green-500" /><div><p className="text-2xl font-bold">{formatCurrency(summary.totalReceived)}</p><p className="text-sm text-muted-foreground">Total Received</p></div></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-3"><TrendingUp className="w-8 h-8 text-blue-500" /><div><p className="text-2xl font-bold">{formatCurrency(summary.totalExpected)}</p><p className="text-sm text-muted-foreground">Expected</p></div></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-3"><Receipt className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{formatCurrency(summary.totalVAT)}</p><p className="text-sm text-muted-foreground">Total VAT</p></div></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-3"><Plug className="w-8 h-8 text-purple-500" /><div><p className="text-2xl font-bold">{integrations.length}</p><p className="text-sm text-muted-foreground">Integrations</p></div></CardContent></Card>
        </div>
      )}

      {/* Revenue by Type */}
      {summary?.byType && Object.keys(summary.byType).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue by Type</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(summary.byType).map(([type, amount]) => (
                <div key={type} className="flex items-center gap-2 bg-muted/50 rounded-lg px-4 py-2">
                  <span className="font-medium capitalize">{type.replace(/_/g, ' ')}</span>
                  <span className="text-muted-foreground">{formatCurrency(amount as number)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="commissions">
        <TabsList>
          <TabsTrigger value="commissions">Commissions ({commissions.length})</TabsTrigger>
          <TabsTrigger value="integrations">Integrations ({integrations.length})</TabsTrigger>
        </TabsList>

        {/* ── Commissions ── */}
        <TabsContent value="commissions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Commission Records</CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {COMMISSION_STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr><th className="p-3 text-left">Product</th><th className="p-3 text-left">Type</th><th className="p-3 text-right">Amount</th><th className="p-3 text-right">VAT</th><th className="p-3 text-right">Net</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Date</th><th className="p-3 text-right">Actions</th></tr>
                  </thead>
                  <tbody>
                    {isLoading ? <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">Loading...</td></tr> :
                     commissions.length === 0 ? <tr><td colSpan={8} className="p-0"><EmptyState icon={Receipt} title="No commissions recorded" description="Record your first commission to start tracking revenue." actionLabel="Record Commission" onAction={() => setCommOpen(true)} /></td></tr> :
                     commissions.map((c: any) => (
                      <tr key={c.id} className="border-t">
                        <td className="p-3 font-medium">{c.product_name || '—'}</td>
                        <td className="p-3"><Badge variant="outline">{c.commission_type?.replace(/_/g, ' ')}</Badge></td>
                        <td className="p-3 text-right">{formatCurrency(c.amount)}</td>
                        <td className="p-3 text-right text-muted-foreground">{formatCurrency(c.vat_amount)}</td>
                        <td className="p-3 text-right font-medium">{formatCurrency(c.net_amount)}</td>
                        <td className="p-3"><Badge variant={statusColor[c.status] as any || 'outline'}>{c.status?.replace(/_/g, ' ')}</Badge></td>
                        <td className="p-3 text-muted-foreground">{c.effective_date ? new Date(c.effective_date).toLocaleDateString() : '—'}</td>
                        <td className="p-3 text-right">
                          {c.status === 'expected' && (
                            <Button size="sm" variant="outline" onClick={() => updateCommission.mutate({ id: c.id, status: 'received', received_date: new Date().toISOString() } as any)}>
                              <CheckCircle2 className="w-3 h-3 mr-1" />Received
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Integrations ── */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Plug className="w-5 h-5" /> Integrations</CardTitle>
              <Dialog open={intOpen} onOpenChange={setIntOpen}>
                <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-2" />Add Integration</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Integration</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div><Label>Name *</Label><Input value={intForm.name} onChange={e => setIntForm(f => ({ ...f, name: e.target.value }))} /></div>
                    <div>
                      <Label>Provider</Label>
                      <Select value={intForm.provider} onValueChange={v => setIntForm(f => ({ ...f, provider: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{INTEGRATION_PROVIDERS.map(p => <SelectItem key={p} value={p}>{p.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Sync Frequency</Label>
                      <Select value={intForm.sync_frequency} onValueChange={v => setIntForm(f => ({ ...f, sync_frequency: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{SYNC_FREQUENCIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <Button disabled={!intForm.name || createIntegration.isPending} onClick={() => {
                      createIntegration.mutate(intForm as any);
                      setIntOpen(false);
                      setIntForm({ provider: 'product_provider', name: '', sync_frequency: 'manual' });
                    }}>Add</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {integrations.length === 0 ? <EmptyState icon={Plug} title="No integrations configured" description="Connect to product providers and other data sources." actionLabel="Add Integration" onAction={() => setIntOpen(true)} /> : (
                <div className="grid gap-4 md:grid-cols-2">
                  {integrations.map((i: any) => (
                    <Card key={i.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{i.name}</h3>
                          <Badge variant={i.is_active ? 'default' : 'outline'}>{i.is_active ? 'Active' : 'Inactive'}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Provider: <span className="capitalize">{i.provider?.replace(/_/g, ' ')}</span></p>
                          <p>Sync: {i.sync_frequency}</p>
                          {i.last_sync_at && <p>Last sync: {new Date(i.last_sync_at).toLocaleString()}</p>}
                          {i.last_sync_status && <p>Status: <Badge variant="outline" className="ml-1">{i.last_sync_status}</Badge></p>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
