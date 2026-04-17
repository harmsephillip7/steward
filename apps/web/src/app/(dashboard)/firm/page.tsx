'use client';

import { useState } from 'react';
import { useFirm, useCreateFirm, useUpdateFirm, useAddMember, useUpdateMember, useRemoveMember, useTeams, useCreateTeam, useDeleteTeam } from '@/lib/hooks/use-firm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Plus, Users, Shield, Trash2, UserPlus } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { FirmRole } from '@steward/shared';

const ROLES: FirmRole[] = ['owner', 'admin', 'advisor', 'assistant', 'compliance_officer', 'viewer'] as any[];
const roleBadge: Record<string, string> = { owner: 'destructive', admin: 'default', advisor: 'secondary', assistant: 'outline', compliance_officer: 'default', viewer: 'outline' };

export default function FirmPage() {
  const { data: firm, isLoading, error } = useFirm();
  const { data: teams = [] } = useTeams();
  const createFirm = useCreateFirm();
  const updateFirm = useUpdateFirm();
  const addMember = useAddMember();
  const updateMember = useUpdateMember();
  const removeMember = useRemoveMember();
  const createTeam = useCreateTeam();
  const deleteTeam = useDeleteTeam();

  const [firmForm, setFirmForm] = useState({ name: '', fsp_number: '', registration_number: '', address: '', phone: '', email: '' });
  const [memberOpen, setMemberOpen] = useState(false);
  const [memberForm, setMemberForm] = useState({ advisor_id: '', role: 'advisor' });
  const [teamOpen, setTeamOpen] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', lead_advisor_id: '' });
  const [editingFirm, setEditingFirm] = useState(false);
  const [confirmRemoveMember, setConfirmRemoveMember] = useState<string | null>(null);
  const [confirmDeleteTeam, setConfirmDeleteTeam] = useState<string | null>(null);

  if (isLoading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading...</p></div>;

  if (!firm) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Firm Management</h1>
        <Card className="max-w-lg mx-auto">
          <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" /> Set Up Your Firm</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Firm Name *</Label><Input value={firmForm.name} onChange={e => setFirmForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>FSP Number</Label><Input value={firmForm.fsp_number} onChange={e => setFirmForm(f => ({ ...f, fsp_number: e.target.value }))} placeholder="e.g. 12345" /></div>
            <div><Label>Registration Number</Label><Input value={firmForm.registration_number} onChange={e => setFirmForm(f => ({ ...f, registration_number: e.target.value }))} /></div>
            <div><Label>Address</Label><Input value={firmForm.address} onChange={e => setFirmForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={firmForm.phone} onChange={e => setFirmForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><Label>Email</Label><Input value={firmForm.email} onChange={e => setFirmForm(f => ({ ...f, email: e.target.value }))} /></div>
            </div>
            <Button className="w-full" disabled={!firmForm.name || createFirm.isPending} onClick={() => createFirm.mutate(firmForm)}>
              Create Firm
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{firm.name}</h1>
          <p className="text-muted-foreground">{firm.fsp_number ? `FSP ${firm.fsp_number}` : 'Firm Management'}</p>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Firm Details</TabsTrigger>
          <TabsTrigger value="members">Members ({firm.members?.length || 0})</TabsTrigger>
          <TabsTrigger value="teams">Teams ({teams.length})</TabsTrigger>
        </TabsList>

        {/* ── Firm Details ── */}
        <TabsContent value="details">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Firm Information</CardTitle>
              <Button variant="outline" size="sm" onClick={() => {
                if (editingFirm) {
                  updateFirm.mutate(firmForm);
                  setEditingFirm(false);
                } else {
                  setFirmForm({ name: firm.name, fsp_number: firm.fsp_number || '', registration_number: firm.registration_number || '', address: firm.address || '', phone: firm.phone || '', email: firm.email || '' });
                  setEditingFirm(true);
                }
              }}>
                {editingFirm ? 'Save' : 'Edit'}
              </Button>
            </CardHeader>
            <CardContent>
              {editingFirm ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div><Label>Firm Name</Label><Input value={firmForm.name} onChange={e => setFirmForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div><Label>FSP Number</Label><Input value={firmForm.fsp_number} onChange={e => setFirmForm(f => ({ ...f, fsp_number: e.target.value }))} /></div>
                  <div><Label>Registration Number</Label><Input value={firmForm.registration_number} onChange={e => setFirmForm(f => ({ ...f, registration_number: e.target.value }))} /></div>
                  <div><Label>Address</Label><Input value={firmForm.address} onChange={e => setFirmForm(f => ({ ...f, address: e.target.value }))} /></div>
                  <div><Label>Phone</Label><Input value={firmForm.phone} onChange={e => setFirmForm(f => ({ ...f, phone: e.target.value }))} /></div>
                  <div><Label>Email</Label><Input value={firmForm.email} onChange={e => setFirmForm(f => ({ ...f, email: e.target.value }))} /></div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div><p className="text-sm text-muted-foreground">Name</p><p className="font-medium">{firm.name}</p></div>
                  <div><p className="text-sm text-muted-foreground">FSP Number</p><p className="font-medium">{firm.fsp_number || '—'}</p></div>
                  <div><p className="text-sm text-muted-foreground">Registration</p><p className="font-medium">{firm.registration_number || '—'}</p></div>
                  <div><p className="text-sm text-muted-foreground">Address</p><p className="font-medium">{firm.address || '—'}</p></div>
                  <div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{firm.phone || '—'}</p></div>
                  <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{firm.email || '—'}</p></div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Members ── */}
        <TabsContent value="members">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Team Members</CardTitle>
              <Dialog open={memberOpen} onOpenChange={setMemberOpen}>
                <DialogTrigger asChild><Button size="sm"><UserPlus className="w-4 h-4 mr-2" />Add Member</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div><Label>Advisor ID</Label><Input value={memberForm.advisor_id} onChange={e => setMemberForm(f => ({ ...f, advisor_id: e.target.value }))} placeholder="Advisor UUID" /></div>
                    <div>
                      <Label>Role</Label>
                      <Select value={memberForm.role} onValueChange={v => setMemberForm(f => ({ ...f, role: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{ROLES.filter(r => r !== 'owner').map(r => <SelectItem key={r} value={r}>{r.replace('_', ' ')}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <Button disabled={!memberForm.advisor_id || addMember.isPending} onClick={() => { addMember.mutate(memberForm as any); setMemberOpen(false); }}>Add Member</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr><th className="p-3 text-left">Member</th><th className="p-3 text-left">Role</th><th className="p-3 text-left">Status</th><th className="p-3 text-right">Actions</th></tr></thead>
                  <tbody>
                    {(firm.members || []).map((m: any) => (
                      <tr key={m.id} className="border-t">
                        <td className="p-3">{m.advisor?.name || m.advisor_id}</td>
                        <td className="p-3">
                          <Badge variant={roleBadge[m.role] as any || 'secondary'}>
                            <Shield className="w-3 h-3 mr-1" />{m.role?.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-3"><Badge variant={m.is_active ? 'default' : 'outline'}>{m.is_active ? 'Active' : 'Inactive'}</Badge></td>
                        <td className="p-3 text-right space-x-2">
                          {m.role !== 'owner' && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => updateMember.mutate({ id: m.id, is_active: !m.is_active })}>
                                {m.is_active ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setConfirmRemoveMember(m.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(!firm.members || firm.members.length === 0) && <tr><td colSpan={4} className="p-0"><EmptyState icon={UserPlus} title="No members yet" description="Add team members to collaborate on your advisory practice." /></td></tr>}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Teams ── */}
        <TabsContent value="teams">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Teams</CardTitle>
              <Dialog open={teamOpen} onOpenChange={setTeamOpen}>
                <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-2" />Create Team</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create Team</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div><Label>Team Name</Label><Input value={teamForm.name} onChange={e => setTeamForm(f => ({ ...f, name: e.target.value }))} /></div>
                    <div><Label>Team Lead (Advisor ID)</Label><Input value={teamForm.lead_advisor_id} onChange={e => setTeamForm(f => ({ ...f, lead_advisor_id: e.target.value }))} placeholder="Optional" /></div>
                    <Button disabled={!teamForm.name || createTeam.isPending} onClick={() => { createTeam.mutate(teamForm); setTeamOpen(false); }}>Create</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {teams.length === 0 ? (
                <EmptyState icon={Users} title="No teams created yet" description="Organize your firm members into teams for better collaboration." />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {teams.map((t: any) => (
                    <Card key={t.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{t.name}</h3>
                          <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteTeam(t.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                        <p className="text-sm text-muted-foreground">{t.members?.length || 0} members</p>
                        {t.members?.map((m: any) => (
                          <Badge key={m.id} variant="outline" className="mr-1 mt-1">{m.advisor?.name || m.advisor_id}</Badge>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!confirmRemoveMember}
        onOpenChange={(o) => { if (!o) setConfirmRemoveMember(null); }}
        title="Remove Member"
        description="Are you sure you want to remove this member from the firm? This action cannot be undone."
        confirmLabel="Remove"
        loading={removeMember.isPending}
        onConfirm={() => { if (confirmRemoveMember) removeMember.mutate(confirmRemoveMember, { onSuccess: () => setConfirmRemoveMember(null) }); }}
      />

      <ConfirmDialog
        open={!!confirmDeleteTeam}
        onOpenChange={(o) => { if (!o) setConfirmDeleteTeam(null); }}
        title="Delete Team"
        description="Are you sure you want to delete this team? Members will remain in the firm but the team grouping will be removed."
        confirmLabel="Delete"
        loading={deleteTeam.isPending}
        onConfirm={() => { if (confirmDeleteTeam) deleteTeam.mutate(confirmDeleteTeam, { onSuccess: () => setConfirmDeleteTeam(null) }); }}
      />
    </div>
  );
}
