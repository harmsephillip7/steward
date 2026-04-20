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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Settings, Building2, User, DollarSign, Database, Plus, Trash2, Download, Upload, FileText, ImageIcon, Star, Pencil } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { exportToCsv } from '@/lib/format';
import { useProposalTemplates, useCreateProposalTemplate, useDeleteProposalTemplate, useUploadLogo } from '@/lib/hooks/use-crm';
import { ProductType, PRODUCT_TYPE_LABELS, DEFAULT_PROPOSAL_SECTIONS, DEFAULT_DISCLAIMER_TEXT } from '@steward/shared';
import type { ProposalSection, ProposalTemplateType } from '@steward/shared';

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

  const logoUpload = useUploadLogo();

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
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
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
                  <Label>Firm Logo</Label>
                  <p className="text-xs text-muted-foreground">Used on proposals, reports and quotes sent to clients. Does not change the Steward app brand.</p>
                  <div className="flex items-center gap-4 mt-2">
                    {advisor?.logo_url ? (
                      <img
                        src={advisor.logo_url.startsWith('data:') ? advisor.logo_url : `${process.env.NEXT_PUBLIC_API_URL || ''}${advisor.logo_url}`}
                        alt="Firm logo"
                        className="h-16 w-auto max-w-[200px] rounded border object-contain bg-white p-1"
                      />
                    ) : (
                      <div className="h-16 w-32 rounded border border-dashed flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/png,image/jpeg,image/svg+xml,image/webp';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) logoUpload.mutate(file);
                          };
                          input.click();
                        }}
                        disabled={logoUpload.isPending}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        {logoUpload.isPending ? 'Uploading…' : advisor?.logo_url ? 'Change Logo' : 'Upload Logo'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, SVG or WebP (max 5MB)</p>
                    </div>
                  </div>
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

        {/* Proposals Tab */}
        <ProposalsSettingsTab />

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

// ── Proposals Settings Tab ─────────────────────────────────────

const ALL_SECTIONS: { key: ProposalSection; label: string }[] = [
  { key: 'cover_letter', label: 'Cover Letter' },
  { key: 'executive_summary', label: 'Executive Summary' },
  { key: 'client_overview', label: 'Client Overview' },
  { key: 'products', label: 'Product Details' },
  { key: 'fee_disclosure', label: 'Fee Disclosure' },
  { key: 'disclaimers', label: 'Disclaimers' },
  { key: 'next_steps', label: 'Next Steps' },
];

function ProposalsSettingsTab() {
  const { data: templates = [], isLoading } = useProposalTemplates();
  const createTemplate = useCreateProposalTemplate();
  const deleteTemplate = useDeleteProposalTemplate();
  const [open, setOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ProposalTemplateType | null>(null);
  const [form, setForm] = useState({
    name: '',
    product_types: [] as string[],
    cover_letter_template: 'Dear {{client_name}},\n\nThank you for the opportunity to assist you with your financial planning needs. Based on our discussions, I have prepared the following proposal for your consideration.\n\nKind regards,\n{{advisor_name}}\n{{firm_name}}',
    disclaimer_text: DEFAULT_DISCLAIMER_TEXT,
    sections_enabled: [...DEFAULT_PROPOSAL_SECTIONS] as string[],
    default_terms: '',
    is_default: false,
  });

  const resetForm = () => {
    setForm({
      name: '',
      product_types: [],
      cover_letter_template: 'Dear {{client_name}},\n\nThank you for the opportunity to assist you with your financial planning needs. Based on our discussions, I have prepared the following proposal for your consideration.\n\nKind regards,\n{{advisor_name}}\n{{firm_name}}',
      disclaimer_text: DEFAULT_DISCLAIMER_TEXT,
      sections_enabled: [...DEFAULT_PROPOSAL_SECTIONS],
      default_terms: '',
      is_default: false,
    });
    setEditingTemplate(null);
  };

  const openEdit = (t: ProposalTemplateType) => {
    setEditingTemplate(t);
    setForm({
      name: t.name,
      product_types: t.product_types || [],
      cover_letter_template: t.cover_letter_template || '',
      disclaimer_text: t.disclaimer_text || DEFAULT_DISCLAIMER_TEXT,
      sections_enabled: t.sections_enabled || [...DEFAULT_PROPOSAL_SECTIONS],
      default_terms: t.default_terms || '',
      is_default: t.is_default,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (editingTemplate) {
      await api.patch(`/proposal-templates/${editingTemplate.id}`, form);
      toast.success('Template updated');
    } else {
      createTemplate.mutate(form as any);
    }
    setOpen(false);
    resetForm();
  };

  const toggleProductType = (pt: string) => {
    setForm(f => ({
      ...f,
      product_types: f.product_types.includes(pt)
        ? f.product_types.filter(p => p !== pt)
        : [...f.product_types, pt],
    }));
  };

  const toggleSection = (s: string) => {
    setForm(f => ({
      ...f,
      sections_enabled: f.sections_enabled.includes(s)
        ? f.sections_enabled.filter(x => x !== s)
        : [...f.sections_enabled, s],
    }));
  };

  return (
    <TabsContent value="proposals" className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Proposal Templates
          </CardTitle>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />New Template</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Proposal Template'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="space-y-1.5">
                  <Label>Template Name *</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Comprehensive Life & Investment" />
                </div>

                <div className="space-y-1.5">
                  <Label>Product Types</Label>
                  <p className="text-xs text-muted-foreground">Select which product types this template covers</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {Object.entries(PRODUCT_TYPE_LABELS).map(([key, label]) => (
                      <Badge
                        key={key}
                        variant={form.product_types.includes(key) ? 'default' : 'outline'}
                        className="cursor-pointer select-none"
                        onClick={() => toggleProductType(key)}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Sections Included</Label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {ALL_SECTIONS.map(s => (
                      <Badge
                        key={s.key}
                        variant={form.sections_enabled.includes(s.key) ? 'default' : 'outline'}
                        className="cursor-pointer select-none"
                        onClick={() => toggleSection(s.key)}
                      >
                        {s.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Cover Letter Template</Label>
                  <p className="text-xs text-muted-foreground">
                    Merge fields: {'{{client_name}}'}, {'{{advisor_name}}'}, {'{{firm_name}}'}, {'{{date}}'}
                  </p>
                  <Textarea
                    rows={6}
                    value={form.cover_letter_template}
                    onChange={e => setForm(f => ({ ...f, cover_letter_template: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Disclaimer Text</Label>
                  <Textarea
                    rows={4}
                    value={form.disclaimer_text}
                    onChange={e => setForm(f => ({ ...f, disclaimer_text: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Default Terms & Conditions</Label>
                  <Textarea
                    rows={3}
                    value={form.default_terms}
                    onChange={e => setForm(f => ({ ...f, default_terms: e.target.value }))}
                    placeholder="Any standard terms to include in proposals using this template..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.is_default}
                    onCheckedChange={(v: boolean) => setForm(f => ({ ...f, is_default: v }))}
                  />
                  <Label>Set as default template</Label>
                </div>

                <Button onClick={handleSave} disabled={!form.name || createTemplate.isPending}>
                  {editingTemplate ? 'Save Changes' : 'Create Template'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">
            Configure reusable proposal templates with pre-set product types, cover letters, and disclaimers.
          </p>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : templates.length === 0 ? (
            <EmptyState icon={FileText} title="No templates yet" description="Create your first proposal template to streamline proposal creation." />
          ) : (
            <div className="space-y-2">
              {templates.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{t.name}</p>
                      {t.is_default && <Badge variant="secondary" className="text-xs"><Star className="h-3 w-3 mr-0.5" />Default</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(t.product_types || []).slice(0, 5).map(pt => (
                        <Badge key={pt} variant="outline" className="text-xs">
                          {PRODUCT_TYPE_LABELS[pt as ProductType] || pt}
                        </Badge>
                      ))}
                      {(t.product_types || []).length > 5 && (
                        <Badge variant="outline" className="text-xs">+{t.product_types.length - 5} more</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteTemplate.mutate(t.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}

