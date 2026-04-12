'use client';

import { useState } from 'react';
import { useClients } from '@/lib/hooks/use-clients';
import { useUpdateCompliance, useCreateROA, useSignROA, useROAHistory } from '@/lib/hooks/use-compliance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Shield, AlertTriangle, CheckCircle, Pencil, FileText, PenTool } from 'lucide-react';

function StatusBadge({ done }: { done: boolean }) {
  return done ? (
    <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">Complete</Badge>
  ) : (
    <Badge variant="outline" className="text-amber-600 border-amber-300">Pending</Badge>
  );
}

function ComplianceEditor({ client, onClose }: { client: any; onClose: () => void }) {
  const updateCompliance = useUpdateCompliance();
  const [fica, setFica] = useState(client.fica_complete);
  const [kyc, setKyc] = useState(client.kyc_complete);
  const [sow, setSow] = useState(client.source_of_wealth_declared);
  const [riskProfile, setRiskProfile] = useState(client.risk_profile ?? '');

  async function handleSave() {
    await updateCompliance.mutateAsync({
      clientId: client.id,
      dto: {
        fica_complete: fica,
        kyc_complete: kyc,
        source_of_wealth_declared: sow,
        risk_profile: riskProfile || undefined,
      },
    });
    onClose();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {[
          { label: 'FICA Complete', value: fica, setter: setFica },
          { label: 'KYC Complete', value: kyc, setter: setKyc },
          { label: 'Source of Wealth Declared', value: sow, setter: setSow },
        ].map(({ label, value, setter }) => (
          <div key={label} className="flex items-center justify-between">
            <Label>{label}</Label>
            <button
              type="button"
              onClick={() => setter(!value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
        <div className="space-y-1.5">
          <Label>Risk Profile</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={riskProfile}
            onChange={(e) => setRiskProfile(e.target.value)}
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
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={updateCompliance.isPending}>
          {updateCompliance.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </div>
  );
}

function ROASection({ clientId }: { clientId: string }) {
  const { data: roas } = useROAHistory(clientId);
  const createROA = useCreateROA();
  const signROA = useSignROA();
  const [showCreate, setShowCreate] = useState(false);
  const [summary, setSummary] = useState('');

  async function handleCreate() {
    await createROA.mutateAsync({ client_id: clientId, advice_summary: summary });
    setSummary('');
    setShowCreate(false);
  }

  if (!roas || roas.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500">Records of Advice</p>
      </div>
      {roas.map((roa) => (
        <div key={roa.id} className="flex items-center justify-between text-xs bg-gray-50 px-3 py-2 rounded">
          <span className="truncate max-w-[200px]">{roa.advice_summary}</span>
          <div className="flex items-center gap-2">
            {roa.signed_at ? (
              <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">Signed</Badge>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs"
                onClick={() => signROA.mutate({ roaId: roa.id, clientId })}
              >
                <PenTool className="h-3 w-3 mr-1" /> Sign
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CompliancePage() {
  const { data: clients, isLoading } = useClients();
  const [editClient, setEditClient] = useState<any>(null);
  const [roaClient, setRoaClient] = useState<any>(null);
  const [roaSummary, setRoaSummary] = useState('');
  const createROA = useCreateROA();

  const compliantCount = clients?.filter(
    (c) => c.fica_complete && c.kyc_complete && c.source_of_wealth_declared && c.risk_profile_complete,
  ).length ?? 0;

  const pendingCount = (clients?.length ?? 0) - compliantCount;

  async function handleCreateROA() {
    if (!roaClient) return;
    await createROA.mutateAsync({ client_id: roaClient.id, advice_summary: roaSummary });
    setRoaSummary('');
    setRoaClient(null);
  }

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
                <TableHead>Actions</TableHead>
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
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditClient(client)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setRoaClient(client)}>
                        <FileText className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Edit Compliance Dialog */}
      <Dialog open={!!editClient} onOpenChange={(open) => !open && setEditClient(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Edit Compliance — {editClient?.first_name} {editClient?.last_name}
            </DialogTitle>
          </DialogHeader>
          {editClient && <ComplianceEditor client={editClient} onClose={() => setEditClient(null)} />}
        </DialogContent>
      </Dialog>

      {/* Create ROA Dialog */}
      <Dialog open={!!roaClient} onOpenChange={(open) => !open && setRoaClient(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              New Record of Advice — {roaClient?.first_name} {roaClient?.last_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Advice Summary *</Label>
              <textarea
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Describe the advice provided..."
                value={roaSummary}
                onChange={(e) => setRoaSummary(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRoaClient(null)}>Cancel</Button>
              <Button onClick={handleCreateROA} disabled={!roaSummary.trim() || createROA.isPending}>
                {createROA.isPending ? 'Creating...' : 'Create ROA'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
