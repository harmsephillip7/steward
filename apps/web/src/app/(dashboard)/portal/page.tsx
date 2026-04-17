'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Plus, UserCheck, UserX, Users } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export default function ClientPortalPage() {
  const qc = useQueryClient();
  const { data: users = [] } = useQuery({ queryKey: ['portal', 'users'], queryFn: async () => { const { data } = await api.get('/portal/users'); return data; } });
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: async () => { const { data } = await api.get('/clients'); return data; } });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ client_id: '', email: '', password: '' });

  const createUser = useMutation({
    mutationFn: async (dto: any) => { const { data } = await api.post('/portal/users', dto); return data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['portal', 'users'] }); setOpen(false); toast.success('Portal user created'); },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create user'),
  });

  const toggle = useMutation({
    mutationFn: async (id: string) => { const { data } = await api.patch(`/portal/users/${id}/toggle`); return data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['portal', 'users'] }); toast.success('User updated'); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client Portal</h1>
          <p className="text-muted-foreground">Manage client portal access</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Grant Access</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Portal User</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Client</Label>
                <Select value={form.client_id} onValueChange={v => setForm(f => ({ ...f, client_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div><Label>Temporary Password</Label><Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
              <Button onClick={() => createUser.mutate(form)} disabled={!form.client_id || !form.email || !form.password}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Users</p><p className="text-2xl font-bold">{users.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-600">{users.filter((u: any) => u.is_active).length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Inactive</p><p className="text-2xl font-bold text-red-600">{users.filter((u: any) => !u.is_active).length}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-muted/50"><tr className="text-left text-sm"><th className="p-3 font-medium">Client</th><th className="p-3 font-medium">Email</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Last Login</th><th className="p-3 font-medium">Actions</th></tr></thead>
            <tbody className="divide-y">
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="p-3 font-medium text-sm">{u.display_name || u.client?.first_name + ' ' + u.client?.last_name}</td>
                  <td className="p-3 text-sm">{u.email}</td>
                  <td className="p-3"><Badge className={u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{u.is_active ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="p-3 text-sm text-muted-foreground">{u.last_login ? new Date(u.last_login).toLocaleString('en-ZA') : 'Never'}</td>
                  <td className="p-3">
                    <Button variant="ghost" size="sm" onClick={() => toggle.mutate(u.id)}>
                      {u.is_active ? <><UserX className="w-3 h-3 mr-1" />Disable</> : <><UserCheck className="w-3 h-3 mr-1" />Enable</>}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <EmptyState icon={Users} title="No portal users yet" description="Grant your clients access to view their portfolios, documents, and financial plans." actionLabel="Grant Access" onAction={() => setOpen(true)} />}
        </CardContent>
      </Card>
    </div>
  );
}
