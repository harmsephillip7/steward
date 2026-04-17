'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Building2, User, DollarSign, Database, Plus, Trash2, Download, Upload } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { exportToCsv } from '@/lib/format';

interface AdvisorProfile {
  id: string;
  name: string;
  email: string;
  firm_name: string;
  fsp_number: string | null;
  logo_url: string | null;
  primary_colour_hex: string | null;
}

interface FeeEntry {
  id: string;
  label: string;
  type: 'percentage' | 'flat';
  value: number;
  applies_to: string;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: advisor, isLoading } = useQuery({
    queryKey: ['advisor', 'me'],
    queryFn: async () => {
      const { data } = await api.get<AdvisorProfile>('/advisors/me');
      return data;
    },
  });

  const [form, setForm] = useState({
    firm_name: '',
    fsp_number: '',
    primary_colour_hex: '#003B43',
  });

  useEffect(() => {
    if (advisor) {
      setForm({
        firm_name: advisor.firm_name ?? '',
        fsp_number: advisor.fsp_number ?? '',
        primary_colour_hex: advisor.primary_colour_hex ?? '#003B43',
      });
    }
  }, [advisor]);

  const updateBranding = useMutation({
    mutationFn: async (payload: typeof form) => {
      const { data } = await api.patch('/advisors/me/branding', payload);
      return data;
    },
    onSuccess: () => toast.success('Settings saved'),
    onError: () => toast.error('Failed to save settings'),
  });

  // Fee schedule state (local until backend is built)
  const [fees, setFees] = useState<FeeEntry[]>([
    { id: '1', label: 'Initial Advisory Fee', type: 'percentage', value: 1.0, applies_to: 'new_business' },
    { id: '2', label: 'Ongoing Advisory Fee', type: 'percentage', value: 0.5, applies_to: 'assets_under_management' },
    { id: '3', label: 'Financial Plan Fee', type: 'flat', value: 5000, applies_to: 'financial_planning' },
  ]);
  const [newFee, setNewFee] = useState<{ label: string; type: 'percentage' | 'flat'; value: number; applies_to: string }>({ label: '', type: 'percentage', value: 0, applies_to: 'new_business' });

  const addFee = () => {
    if (!newFee.label) { toast.error('Fee label required'); return; }
    setFees([...fees, { ...newFee, id: Date.now().toString() }]);
    setNewFee({ label: '', type: 'percentage', value: 0, applies_to: 'new_business' });
    toast.success('Fee entry added');
  };

  const removeFee = (id: string) => {
    setFees(fees.filter(f => f.id !== id));
    toast.success('Fee entry removed');
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile, fees, and data</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile & Branding</TabsTrigger>
          <TabsTrigger value="fees">Fee Schedule</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        {/* Profile & Branding Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Advisor Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Name</p>
                  <p className="font-medium mt-0.5">{advisor?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Email</p>
                  <p className="font-medium mt-0.5">{advisor?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Firm Branding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firm_name">Firm Name</Label>
                  <Input
                    id="firm_name"
                    value={form.firm_name}
                    onChange={(e) => setForm({ ...form, firm_name: e.target.value })}
                    placeholder="e.g. Steward Financial Services"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fsp_number">FSP Number</Label>
                  <Input
                    id="fsp_number"
                    value={form.fsp_number}
                    onChange={(e) => setForm({ ...form, fsp_number: e.target.value })}
                    placeholder="e.g. FSP-12345"
                  />
                  <p className="text-xs text-muted-foreground">Your FSCA Financial Services Provider licence number</p>
                </div>
                <Separator />
                <div className="space-y-1.5">
                  <Label htmlFor="brand_colour">Brand Colour</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="brand_colour"
                      type="color"
                      value={form.primary_colour_hex}
                      onChange={(e) => setForm({ ...form, primary_colour_hex: e.target.value })}
                      className="h-10 w-16 rounded border cursor-pointer p-1"
                    />
                    <Input
                      value={form.primary_colour_hex}
                      onChange={(e) => setForm({ ...form, primary_colour_hex: e.target.value })}
                      className="w-36 font-mono"
                      placeholder="#003B43"
                    />
                    <div className="h-10 w-10 rounded-lg border" style={{ backgroundColor: form.primary_colour_hex }} />
                  </div>
                </div>
                <div className="pt-2">
                  <Button onClick={() => updateBranding.mutate(form)} disabled={updateBranding.isPending}>
                    {updateBranding.isPending ? 'Saving…' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fee Schedule Tab */}
        <TabsContent value="fees" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Fee Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">
                Define your standard fees for client proposals and commission calculations.
              </p>
              {fees.length === 0 ? (
                <EmptyState icon={DollarSign} title="No fees configured" description="Add your first fee entry below" />
              ) : (
                <div className="space-y-2 mb-4">
                  {fees.map(fee => (
                    <div key={fee.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div>
                        <p className="text-sm font-medium">{fee.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {fee.type === 'percentage' ? `${fee.value}%` : `R ${fee.value.toLocaleString()}`} — {fee.applies_to.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeFee(fee.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Separator className="my-4" />
              <p className="text-xs font-medium mb-2">Add new fee</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Label</Label>
                  <Input placeholder="e.g. Annual Retainer" value={newFee.label} onChange={e => setNewFee({ ...newFee, label: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select value={newFee.type} onValueChange={(v: 'percentage' | 'flat') => setNewFee({ ...newFee, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="flat">Flat (R)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Value</Label>
                  <Input type="number" step="0.01" value={newFee.value} onChange={e => setNewFee({ ...newFee, value: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Applies To</Label>
                  <Select value={newFee.applies_to} onValueChange={v => setNewFee({ ...newFee, applies_to: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new_business">New Business</SelectItem>
                      <SelectItem value="assets_under_management">AUM</SelectItem>
                      <SelectItem value="financial_planning">Financial Planning</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="mt-3" size="sm" onClick={addFee}>
                <Plus className="h-4 w-4 mr-1" /> Add Fee
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management Tab */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Database className="h-4 w-4" />
                Data Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">Export your data for backup or migration purposes.</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Full Data Export</p>
                    <p className="text-xs text-muted-foreground">Export all clients, portfolios, and commissions as CSV</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={async () => {
                    try {
                      const { data: clients } = await api.get('/clients');
                      exportToCsv('steward-clients-export', clients);
                      toast.success('Client data exported');
                    } catch { toast.error('Export failed'); }
                  }}>
                    <Download className="h-4 w-4 mr-1" /> Export
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Audit Log Export</p>
                    <p className="text-xs text-muted-foreground">Export audit trail for compliance records</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={async () => {
                    try {
                      const { data: auditLogs } = await api.get('/audit');
                      exportToCsv('steward-audit-export', auditLogs);
                      toast.success('Audit log exported');
                    } catch { toast.error('Export failed'); }
                  }}>
                    <Download className="h-4 w-4 mr-1" /> Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Data Import
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">Import data from spreadsheets or other systems.</p>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">Holdings Import (CSV/Excel)</p>
                  <p className="text-xs text-muted-foreground">Bulk import client holdings via the ingestion service</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.csv,.xlsx,.xls';
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append('file', file);
                    try {
                      await api.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                      toast.success('File uploaded for processing');
                    } catch { toast.error('Import failed'); }
                  };
                  input.click();
                }}>
                  <Upload className="h-4 w-4 mr-1" /> Import
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-destructive flex items-center gap-2">
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/30">
                <div>
                  <p className="text-sm font-medium">Clear All Data</p>
                  <p className="text-xs text-muted-foreground">Permanently delete all clients, portfolios, and commissions</p>
                </div>
                <Button variant="destructive" size="sm" disabled>
                  Not Available
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

