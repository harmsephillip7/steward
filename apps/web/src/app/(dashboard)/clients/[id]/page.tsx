'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useClient } from '@/lib/hooks/use-clients';
import { useUpdateCompliance } from '@/lib/hooks/use-compliance';
import { ClientDocuments } from '@/components/documents/client-documents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, User, CheckCircle, XCircle, Briefcase, FileText, Calendar, Pencil, Shield,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

function StatusIcon({ done }: { done: boolean }) {
  return done
    ? <CheckCircle className="h-4 w-4 text-green-600" />
    : <XCircle className="h-4 w-4 text-red-500" />;
}

function formatCurrency(value: string | number, currency = 'ZAR') {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function riskLabel(profile?: string) {
  const map: Record<string, string> = {
    conservative: 'Conservative',
    moderate: 'Moderate',
    moderate_aggressive: 'Moderate Aggressive',
    aggressive: 'Aggressive',
  };
  return profile ? (map[profile] ?? profile) : '—';
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: client, isLoading } = useClient(id);
  const updateCompliance = useUpdateCompliance();
  const [editCompliance, setEditCompliance] = useState(false);
  const [compForm, setCompForm] = useState({
    fica_complete: false,
    kyc_complete: false,
    source_of_wealth_declared: false,
    risk_profile: '',
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Client not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const totalValue = client.portfolios?.reduce(
    (sum, p) => sum + parseFloat(p.total_value || '0'),
    0,
  ) ?? 0;

  return (
    <div>
      <Breadcrumbs />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {client.first_name} {client.last_name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{client.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/clients/${client.id}/profile`)}
          >
            <User className="mr-1.5 h-3.5 w-3.5" /> Full Profile
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/fna/${client.id}`)}
          >
            <FileText className="mr-1.5 h-3.5 w-3.5" /> New FNA
          </Button>
          <Badge
            variant="outline"
            className={
              client.risk_profile === 'aggressive'
                ? 'border-red-300 text-red-700'
                : client.risk_profile === 'moderate_aggressive'
                ? 'border-amber-300 text-amber-700'
                : 'border-green-300 text-green-700'
            }
          >
            {riskLabel(client.risk_profile)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Personal details */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">ID Number</p>
                <p className="font-mono mt-0.5">{client.id_number || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Tax Number</p>
                <p className="font-mono mt-0.5">{client.tax_number || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Date of Birth</p>
                <p className="mt-0.5">{client.dob ? formatDate(client.dob) : '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Phone</p>
                <p className="mt-0.5">{client.phone || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Tax Residency</p>
                <p className="mt-0.5 capitalize">{client.tax_residency?.replace(/_/g, ' ') || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Client Since</p>
                <p className="mt-0.5">{formatDate(client.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-2"><Shield className="h-4 w-4" /> Compliance</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7"
                onClick={() => {
                  setCompForm({
                    fica_complete: client.fica_complete,
                    kyc_complete: client.kyc_complete,
                    source_of_wealth_declared: client.source_of_wealth_declared,
                    risk_profile: client.risk_profile ?? '',
                  });
                  setEditCompliance(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'FICA Complete', done: client.fica_complete },
              { label: 'KYC Complete', done: client.kyc_complete },
              { label: 'Source of Wealth', done: client.source_of_wealth_declared },
              { label: 'Risk Profile', done: client.risk_profile_complete },
            ].map(({ label, done }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <div className="flex items-center gap-1.5">
                  <StatusIcon done={done} />
                  <span className={done ? 'text-green-700 font-medium' : 'text-red-600 font-medium'}>
                    {done ? 'Done' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Portfolios */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Portfolios
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              Total: {formatCurrency(totalValue)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {client.portfolios?.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">No portfolios yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Portfolio Name</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.portfolios?.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{p.currency}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(p.total_value, p.currency)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(p.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <ClientDocuments clientId={client.id} />

      {/* Records of Advice */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Records of Advice
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {client.records_of_advice?.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">No records of advice yet.</div>
          ) : (
            <div className="divide-y">
              {client.records_of_advice?.map((roa) => (
                <div key={roa.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                        <span className="text-xs text-muted-foreground">{formatDate(roa.advice_date)}</span>
                        {roa.signed_at ? (
                          <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50 text-xs">
                            Signed {formatDate(roa.signed_at)}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">
                            Awaiting signature
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">{roa.advice_summary}</p>
                    </div>
                    {roa.pdf_url && (
                      <a
                        href={roa.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <Button variant="outline" size="sm">PDF</Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Edit Dialog */}
      <Dialog open={editCompliance} onOpenChange={setEditCompliance}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Compliance — {client.first_name} {client.last_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { label: 'FICA Complete', key: 'fica_complete' as const },
              { label: 'KYC Complete', key: 'kyc_complete' as const },
              { label: 'Source of Wealth Declared', key: 'source_of_wealth_declared' as const },
            ].map(({ label, key }) => (
              <div key={key} className="flex items-center justify-between">
                <Label>{label}</Label>
                <button
                  type="button"
                  onClick={() => setCompForm((f) => ({ ...f, [key]: !f[key] }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    compForm[key] ? 'bg-green-600' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      compForm[key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
            <div className="space-y-1.5">
              <Label>Risk Profile</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={compForm.risk_profile}
                onChange={(e) => setCompForm((f) => ({ ...f, risk_profile: e.target.value }))}
              >
                <option value="">Not set</option>
                <option value="conservative">Conservative</option>
                <option value="moderate_conservative">Moderate Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="moderate_aggressive">Moderate Aggressive</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCompliance(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                await updateCompliance.mutateAsync({
                  clientId: client.id,
                  dto: {
                    fica_complete: compForm.fica_complete,
                    kyc_complete: compForm.kyc_complete,
                    source_of_wealth_declared: compForm.source_of_wealth_declared,
                    risk_profile: compForm.risk_profile || undefined,
                  },
                });
                setEditCompliance(false);
              }}
              disabled={updateCompliance.isPending}
            >
              {updateCompliance.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
