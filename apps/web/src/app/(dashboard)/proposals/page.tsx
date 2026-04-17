'use client';

import { useState } from 'react';
import { useProposals, useCreateProposal, useSendProposal } from '@/lib/hooks/use-crm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Send, Eye, FileText } from 'lucide-react';
import type { ProposalStatus } from '@steward/shared';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-foreground',
  sent: 'bg-primary/10 text-primary',
  viewed: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-orange-100 text-orange-800',
};

const fmt = (n?: number) => n ? `R ${n.toLocaleString('en-ZA')}` : '—';

export default function ProposalsPage() {
  const { data: proposals = [] } = useProposals();
  const createProposal = useCreateProposal();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', notes: '', total_monthly_premium: 0, total_lump_sum: 0, valid_until: '' });

  const handleCreate = () => {
    createProposal.mutate(form as any, { onSuccess: () => { setOpen(false); setForm({ title: '', notes: '', total_monthly_premium: 0, total_lump_sum: 0, valid_until: '' }); } });
  };

  const grouped = {
    draft: proposals.filter(p => p.status === 'draft'),
    sent: proposals.filter(p => p.status === 'sent'),
    viewed: proposals.filter(p => p.status === 'viewed'),
    accepted: proposals.filter(p => p.status === 'accepted'),
    rejected: proposals.filter(p => p.status === 'rejected'),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proposals</h1>
          <p className="text-muted-foreground">Create and track client proposals</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Proposal</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Proposal</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Retirement Planning Package" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Monthly Premium (R)</Label><Input type="number" value={form.total_monthly_premium || ''} onChange={e => setForm(f => ({ ...f, total_monthly_premium: +e.target.value }))} /></div>
                <div><Label>Lump Sum (R)</Label><Input type="number" value={form.total_lump_sum || ''} onChange={e => setForm(f => ({ ...f, total_lump_sum: +e.target.value }))} /></div>
              </div>
              <div><Label>Valid Until</Label><Input type="date" value={form.valid_until} onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))} /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <Button onClick={handleCreate} disabled={!form.title}>Create Proposal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Drafts</p><p className="text-2xl font-bold">{grouped.draft.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Sent</p><p className="text-2xl font-bold">{grouped.sent.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Accepted</p><p className="text-2xl font-bold text-green-600">{grouped.accepted.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Value</p><p className="text-2xl font-bold">{fmt(proposals.reduce((s, p) => s + (p.total_monthly_premium || 0) * 12, 0))}/yr</p></CardContent></Card>
      </div>

      {/* Proposals Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-left text-sm">
                <th className="p-3 font-medium">Title</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Monthly Premium</th>
                <th className="p-3 font-medium">Lump Sum</th>
                <th className="p-3 font-medium">Valid Until</th>
                <th className="p-3 font-medium">Created</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {proposals.map(p => (
                <ProposalRow key={p.id} proposal={p} />
              ))}
              {proposals.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-sm text-muted-foreground">No proposals yet. Create your first proposal above.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function ProposalRow({ proposal: p }: { proposal: any }) {
  const send = useSendProposal(p.id);

  return (
    <tr className="hover:bg-muted/30">
      <td className="p-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">{p.title}</span>
        </div>
      </td>
      <td className="p-3"><Badge className={statusColors[p.status] || ''}>{p.status}</Badge></td>
      <td className="p-3 text-sm">{fmt(p.total_monthly_premium)}</td>
      <td className="p-3 text-sm">{fmt(p.total_lump_sum)}</td>
      <td className="p-3 text-sm">{p.valid_until ? new Date(p.valid_until).toLocaleDateString('en-ZA') : '—'}</td>
      <td className="p-3 text-sm">{new Date(p.created_at).toLocaleDateString('en-ZA')}</td>
      <td className="p-3">
        <div className="flex gap-1">
          {p.status === 'draft' && (
            <Button variant="ghost" size="sm" onClick={() => send.mutate()}>
              <Send className="w-3 h-3 mr-1" />Send
            </Button>
          )}
          {p.sent_at && <Badge variant="outline" className="text-xs"><Eye className="w-3 h-3 mr-1" />{p.viewed_at ? 'Viewed' : 'Sent'}</Badge>}
        </div>
      </td>
    </tr>
  );
}
