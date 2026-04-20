'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProposals, useSendProposal } from '@/lib/hooks/use-crm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Send, Eye, FileText, Download } from 'lucide-react';
import { downloadProposalPdf } from '@/components/proposals/proposal-preview';
import type { ProposalPdfData } from '@/components/proposals/proposal-preview';
import { PRODUCT_TYPE_LABELS, DEFAULT_DISCLAIMER_TEXT } from '@steward/shared';
import type { ProposalType } from '@steward/shared';

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
  const router = useRouter();

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
        <Button onClick={() => router.push('/proposals/new')}>
          <Plus className="w-4 h-4 mr-2" />New Proposal
        </Button>
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
                <th className="p-3 font-medium">Client / Lead</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Monthly Premium</th>
                <th className="p-3 font-medium">Lump Sum</th>
                <th className="p-3 font-medium">Valid Until</th>
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
  const router = useRouter();
  const recipient = p.client || p.lead;
  const recipientName = recipient ? `${recipient.first_name} ${recipient.last_name}` : '—';

  const handleDownload = () => {
    const pdfData: ProposalPdfData = {
      title: p.title,
      products: p.products || [],
      cover_letter: p.cover_letter,
      notes: p.notes,
      total_monthly_premium: p.total_monthly_premium || 0,
      total_lump_sum: p.total_lump_sum || 0,
      valid_until: p.valid_until,
      disclaimer: DEFAULT_DISCLAIMER_TEXT,
      advisor: p.advisor,
      client: p.client,
      lead: p.lead,
    };
    downloadProposalPdf(pdfData);
  };

  return (
    <tr className="hover:bg-muted/30 cursor-pointer" onClick={() => router.push(`/proposals/${p.id}`)}>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">{p.title}</span>
        </div>
      </td>
      <td className="p-3 text-sm">{recipientName}</td>
      <td className="p-3"><Badge className={statusColors[p.status] || ''}>{p.status}</Badge></td>
      <td className="p-3 text-sm">{fmt(p.total_monthly_premium)}</td>
      <td className="p-3 text-sm">{fmt(p.total_lump_sum)}</td>
      <td className="p-3 text-sm">{p.valid_until ? new Date(p.valid_until).toLocaleDateString('en-ZA') : '—'}</td>
      <td className="p-3">
        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/proposals/${p.id}`)}>
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5" />
          </Button>
          {p.status === 'draft' && (
            <Button variant="ghost" size="sm" onClick={() => send.mutate()}>
              <Send className="w-3 h-3 mr-1" />Send
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
