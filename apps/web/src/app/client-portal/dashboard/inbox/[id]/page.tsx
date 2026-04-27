'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import portalApi from '../../../portal-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Download, ShieldCheck } from 'lucide-react';

interface Report {
  id: string;
  type: string;
  title: string;
  status: string;
  sent_at?: string;
  decided_at?: string;
  pdf_sha256?: string;
  signature?: any;
  decline_reason?: string;
}

export default function InboxItemPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [typedName, setTypedName] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [showDecline, setShowDecline] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await portalApi.get<Report>(`/portal/inbox/${id}`);
      setReport(r.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [id]);

  async function accept() {
    if (!typedName.trim()) {
      setError('Please type your full name to confirm acceptance.');
      return;
    }
    setBusy(true); setError(null);
    try {
      await portalApi.post(`/portal/inbox/${id}/accept`, { typed_name: typedName });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to accept');
    } finally {
      setBusy(false);
    }
  }

  async function decline() {
    if (!declineReason.trim()) {
      setError('Please give a brief reason for declining.');
      return;
    }
    setBusy(true); setError(null);
    try {
      await portalApi.post(`/portal/inbox/${id}/decline`, { reason: declineReason });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to decline');
    } finally {
      setBusy(false);
    }
  }

  async function download() {
    const r = await portalApi.get(`/portal/inbox/${id}/download`, { responseType: 'blob' });
    const blob = new Blob([r.data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report?.title ?? 'document'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div className="text-muted-foreground">Loading…</div>;
  if (!report) return <div>Not found.</div>;

  const isPending = report.status === 'sent_to_client';
  const isAccepted = report.status === 'accepted';
  const isDeclined = report.status === 'declined';

  return (
    <div className="space-y-6 max-w-3xl">
      <Button variant="ghost" onClick={() => router.back()}>← Back to inbox</Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{report.title}</CardTitle>
              <div className="text-sm text-muted-foreground capitalize">
                {report.type.replace(/_/g, ' ')} · sent {fmt(report.sent_at)}
              </div>
            </div>
            <StatusPill status={report.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" onClick={download}>
            <Download className="mr-2 h-4 w-4" /> Download document
          </Button>
          {report.pdf_sha256 && (
            <div className="text-xs text-muted-foreground break-all">
              Document fingerprint (SHA-256): <code>{report.pdf_sha256}</code>
            </div>
          )}
        </CardContent>
      </Card>

      {isAccepted && (
        <Card className="border-green-300 bg-green-50">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-green-800">
              <ShieldCheck className="h-5 w-5" /> Accepted
            </div>
            <div className="text-sm">
              Signed as <strong>{report.signature?.typed_name}</strong> on {fmt(report.decided_at)}.
            </div>
          </CardContent>
        </Card>
      )}

      {isDeclined && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-6 space-y-2">
            <div className="font-semibold text-red-800">Declined</div>
            <div className="text-sm">
              You declined this advice on {fmt(report.decided_at)}.
            </div>
            {report.decline_reason && (
              <div className="text-sm">Reason: {report.decline_reason}</div>
            )}
          </CardContent>
        </Card>
      )}

      {isPending && (
        <Card>
          <CardHeader><CardTitle>Your decision</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please review the document above before deciding. Acceptance constitutes
              agreement to the recommendations contained therein.
            </p>

            {!showDecline && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="typed-name">Type your full name to accept</Label>
                  <Input
                    id="typed-name"
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={accept} disabled={busy}>
                    {busy ? 'Submitting…' : 'Accept advice'}
                  </Button>
                  <Button variant="ghost" onClick={() => setShowDecline(true)} disabled={busy}>
                    Decline
                  </Button>
                </div>
              </div>
            )}

            {showDecline && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="decline-reason">Reason for declining</Label>
                  <Textarea
                    id="decline-reason"
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={decline} disabled={busy}>
                    {busy ? 'Submitting…' : 'Submit decline'}
                  </Button>
                  <Button variant="ghost" onClick={() => setShowDecline(false)} disabled={busy}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {error && <div className="text-sm text-red-600">{error}</div>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  if (status === 'accepted') return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
  if (status === 'declined') return <Badge variant="destructive">Declined</Badge>;
  if (status === 'expired') return <Badge variant="outline">Expired</Badge>;
  return <Badge>Awaiting your review</Badge>;
}

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: '2-digit' });
}
