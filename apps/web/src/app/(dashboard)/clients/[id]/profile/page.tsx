'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useClientProfile, useNetWorth, useCashFlow, useUpdateClient, useDependents, useClientAssets, useClientLiabilities, useClientInsurance, useClientGoals, useClientLifeEvents, useClientIncomeExpenses } from '@/lib/hooks/use-client-profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Plus, Trash2, Pencil, User, Heart, Wallet, CreditCard, Shield, Target, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import {
  MaritalStatus, EmploymentStatus, HealthStatus, DependentRelationship,
  ClientAssetCategory, LiabilityCategory, InsurancePolicyType, InsurancePolicyStatus,
  GoalCategory, GoalPriority, GoalStatus, LifeEventType, IncomeExpenseType, Frequency,
} from '@steward/shared';

function fmt(value: number | string | undefined, currency = 'ZAR') {
  if (value === undefined || value === null) return '—';
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
}

function fmtDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function enumLabel(val?: string) {
  if (!val) return '—';
  return val.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ── Main Page ──────────────────────────────────────────────────────

export default function ClientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: profile, isLoading } = useClientProfile(id);
  const { data: netWorth } = useNetWorth(id);
  const { data: cashFlow } = useCashFlow(id);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>;
  if (!profile) return <div className="p-6 text-muted-foreground">Client not found</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/clients/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{profile.first_name} {profile.last_name}</h1>
          <p className="text-sm text-muted-foreground">{profile.email} · {profile.phone || 'No phone'}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Net Worth</div>
            <div className="text-2xl font-bold">{netWorth ? fmt(netWorth.net_worth) : '—'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Monthly Surplus</div>
            <div className="text-2xl font-bold">{cashFlow ? fmt(cashFlow.monthly_surplus) : '—'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Insurance Cover</div>
            <div className="text-2xl font-bold">{fmt(profile.insurance_policies?.reduce((s, p) => s + Number(p.cover_amount), 0) || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Active Goals</div>
            <div className="text-2xl font-bold">{profile.financial_goals?.filter(g => g.status === 'active').length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="personal"><User className="h-4 w-4 mr-1" /> Personal</TabsTrigger>
          <TabsTrigger value="dependents"><Heart className="h-4 w-4 mr-1" /> Dependents</TabsTrigger>
          <TabsTrigger value="assets"><Wallet className="h-4 w-4 mr-1" /> Assets</TabsTrigger>
          <TabsTrigger value="liabilities"><CreditCard className="h-4 w-4 mr-1" /> Liabilities</TabsTrigger>
          <TabsTrigger value="insurance"><Shield className="h-4 w-4 mr-1" /> Insurance</TabsTrigger>
          <TabsTrigger value="budget"><DollarSign className="h-4 w-4 mr-1" /> Budget</TabsTrigger>
          <TabsTrigger value="goals"><Target className="h-4 w-4 mr-1" /> Goals</TabsTrigger>
          <TabsTrigger value="life-events"><Calendar className="h-4 w-4 mr-1" /> Life Events</TabsTrigger>
        </TabsList>

        <TabsContent value="personal"><PersonalTab clientId={id} profile={profile} /></TabsContent>
        <TabsContent value="dependents"><DependentsTab clientId={id} /></TabsContent>
        <TabsContent value="assets"><AssetsTab clientId={id} /></TabsContent>
        <TabsContent value="liabilities"><LiabilitiesTab clientId={id} /></TabsContent>
        <TabsContent value="insurance"><InsuranceTab clientId={id} /></TabsContent>
        <TabsContent value="budget"><BudgetTab clientId={id} /></TabsContent>
        <TabsContent value="goals"><GoalsTab clientId={id} /></TabsContent>
        <TabsContent value="life-events"><LifeEventsTab clientId={id} /></TabsContent>
      </Tabs>
    </div>
  );
}

// ── Tab: Personal ──────────────────────────────────────────────────

function PersonalTab({ clientId, profile }: { clientId: string; profile: any }) {
  const updateClient = useUpdateClient(clientId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    marital_status: profile.marital_status || '',
    spouse_name: profile.spouse_name || '',
    spouse_id_number: profile.spouse_id_number || '',
    spouse_dob: profile.spouse_dob || '',
    employment_status: profile.employment_status || '',
    occupation: profile.occupation || '',
    employer: profile.employer || '',
    industry: profile.industry || '',
    retirement_age_target: profile.retirement_age_target || '',
    smoker: profile.smoker ?? '',
    health_status: profile.health_status || '',
    annual_gross_income: profile.annual_gross_income || '',
    notes: profile.notes || '',
  });

  const save = () => {
    const dto: Record<string, any> = {};
    for (const [k, v] of Object.entries(form)) {
      if (v !== '' && v !== null) {
        if (k === 'retirement_age_target' || k === 'annual_gross_income') dto[k] = Number(v);
        else if (k === 'smoker') dto[k] = v === 'true' || v === true;
        else dto[k] = v;
      }
    }
    updateClient.mutate(dto, { onSuccess: () => setEditing(false) });
  };

  const fields = [
    { label: 'Marital Status', key: 'marital_status', type: 'select', options: Object.values(MaritalStatus) },
    { label: 'Spouse Name', key: 'spouse_name' },
    { label: 'Spouse ID Number', key: 'spouse_id_number' },
    { label: 'Spouse DOB', key: 'spouse_dob', type: 'date' },
    { label: 'Employment Status', key: 'employment_status', type: 'select', options: Object.values(EmploymentStatus) },
    { label: 'Occupation', key: 'occupation' },
    { label: 'Employer', key: 'employer' },
    { label: 'Industry', key: 'industry' },
    { label: 'Retirement Age Target', key: 'retirement_age_target', type: 'number' },
    { label: 'Smoker', key: 'smoker', type: 'select', options: ['true', 'false'] },
    { label: 'Health Status', key: 'health_status', type: 'select', options: Object.values(HealthStatus) },
    { label: 'Annual Gross Income', key: 'annual_gross_income', type: 'number' },
    { label: 'Notes', key: 'notes' },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Personal Details</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
          <Pencil className="h-4 w-4 mr-1" /> {editing ? 'Cancel' : 'Edit'}
        </Button>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.key} className="space-y-1">
                <Label>{f.label}</Label>
                {f.type === 'select' ? (
                  <Select value={(form as any)[f.key]} onValueChange={v => setForm(p => ({ ...p, [f.key]: v }))}>
                    <SelectTrigger><SelectValue placeholder={`Select ${f.label}`} /></SelectTrigger>
                    <SelectContent>
                      {f.options!.map(o => <SelectItem key={o} value={o}>{enumLabel(o)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={f.type || 'text'}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  />
                )}
              </div>
            ))}
            <div className="col-span-full flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              <Button onClick={save} disabled={updateClient.isPending}>Save</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
            {fields.map(f => (
              <div key={f.key} className="flex justify-between py-1 border-b border-dashed">
                <span className="text-sm text-muted-foreground">{f.label}</span>
                <span className="text-sm font-medium">
                  {f.key === 'annual_gross_income' ? fmt((profile as any)[f.key]) :
                   f.key === 'smoker' ? ((profile as any)[f.key] === true ? 'Yes' : (profile as any)[f.key] === false ? 'No' : '—') :
                   f.key === 'spouse_dob' ? fmtDate((profile as any)[f.key]) :
                   enumLabel((profile as any)[f.key]) || '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Tab: Dependents ────────────────────────────────────────────────

function DependentsTab({ clientId }: { clientId: string }) {
  const { data, add, remove } = useDependents(clientId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', relationship: DependentRelationship.CHILD as string, dob: '', is_student: false, special_needs: false, monthly_support_amount: '' });

  const handleAdd = () => {
    const dto: any = { ...form, monthly_support_amount: form.monthly_support_amount ? Number(form.monthly_support_amount) : undefined };
    if (!dto.dob) delete dto.dob;
    add.mutate(dto, { onSuccess: () => { setOpen(false); setForm({ name: '', relationship: DependentRelationship.CHILD, dob: '', is_student: false, special_needs: false, monthly_support_amount: '' }); } });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Dependents ({data?.length || 0})</CardTitle>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Relationship</TableHead><TableHead>DOB</TableHead><TableHead>Student</TableHead><TableHead>Support</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {data?.map(d => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell>{enumLabel(d.relationship)}</TableCell>
                <TableCell>{fmtDate(d.dob)}</TableCell>
                <TableCell>{d.is_student ? 'Yes' : 'No'}</TableCell>
                <TableCell>{d.monthly_support_amount ? fmt(d.monthly_support_amount) : '—'}</TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => remove.mutate(d.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
              </TableRow>
            ))}
            {(!data || data.length === 0) && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No dependents</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Dependent</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>Relationship</Label>
              <Select value={form.relationship} onValueChange={v => setForm(p => ({ ...p, relationship: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.values(DependentRelationship).map(r => <SelectItem key={r} value={r}>{enumLabel(r)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Date of Birth</Label><Input type="date" value={form.dob} onChange={e => setForm(p => ({ ...p, dob: e.target.value }))} /></div>
            <div><Label>Monthly Support Amount</Label><Input type="number" value={form.monthly_support_amount} onChange={e => setForm(p => ({ ...p, monthly_support_amount: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={handleAdd} disabled={!form.name || add.isPending}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ── Tab: Assets ────────────────────────────────────────────────────

function AssetsTab({ clientId }: { clientId: string }) {
  const { data, add, remove } = useClientAssets(clientId);
  const { data: netWorth } = useNetWorth(clientId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: ClientAssetCategory.PROPERTY as string, description: '', provider: '', current_value: '', purchase_value: '', monthly_contribution: '' });

  const handleAdd = () => {
    const dto: any = { ...form, current_value: Number(form.current_value) };
    if (form.purchase_value) dto.purchase_value = Number(form.purchase_value);
    if (form.monthly_contribution) dto.monthly_contribution = Number(form.monthly_contribution);
    if (!form.provider) delete dto.provider;
    add.mutate(dto, { onSuccess: () => { setOpen(false); setForm({ category: ClientAssetCategory.PROPERTY, description: '', provider: '', current_value: '', purchase_value: '', monthly_contribution: '' }); } });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Assets & Investments</CardTitle>
          {netWorth && <p className="text-sm text-muted-foreground mt-1">Total: {fmt(netWorth.total_assets)}</p>}
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Category</TableHead><TableHead>Description</TableHead><TableHead>Provider</TableHead><TableHead className="text-right">Value</TableHead><TableHead className="text-right">Contribution</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {data?.map(a => (
              <TableRow key={a.id}>
                <TableCell><Badge variant="outline">{enumLabel(a.category)}</Badge></TableCell>
                <TableCell className="font-medium">{a.description}</TableCell>
                <TableCell>{a.provider || '—'}</TableCell>
                <TableCell className="text-right">{fmt(a.current_value)}</TableCell>
                <TableCell className="text-right">{a.monthly_contribution ? fmt(a.monthly_contribution) + '/m' : '—'}</TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => remove.mutate(a.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
              </TableRow>
            ))}
            {(!data || data.length === 0) && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No assets</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Asset</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.values(ClientAssetCategory).map(c => <SelectItem key={c} value={c}>{enumLabel(c)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div><Label>Provider</Label><Input value={form.provider} onChange={e => setForm(p => ({ ...p, provider: e.target.value }))} placeholder="e.g. Allan Gray, Sanlam" /></div>
            <div><Label>Current Value</Label><Input type="number" value={form.current_value} onChange={e => setForm(p => ({ ...p, current_value: e.target.value }))} /></div>
            <div><Label>Purchase Value</Label><Input type="number" value={form.purchase_value} onChange={e => setForm(p => ({ ...p, purchase_value: e.target.value }))} /></div>
            <div><Label>Monthly Contribution</Label><Input type="number" value={form.monthly_contribution} onChange={e => setForm(p => ({ ...p, monthly_contribution: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={handleAdd} disabled={!form.description || !form.current_value || add.isPending}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ── Tab: Liabilities ───────────────────────────────────────────────

function LiabilitiesTab({ clientId }: { clientId: string }) {
  const { data, add, remove } = useClientLiabilities(clientId);
  const { data: netWorth } = useNetWorth(clientId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: LiabilityCategory.MORTGAGE as string, description: '', provider: '', outstanding_balance: '', monthly_repayment: '', interest_rate: '', maturity_date: '' });

  const handleAdd = () => {
    const dto: any = { ...form, outstanding_balance: Number(form.outstanding_balance), monthly_repayment: Number(form.monthly_repayment) };
    if (form.interest_rate) dto.interest_rate = Number(form.interest_rate);
    if (!form.provider) delete dto.provider;
    if (!form.maturity_date) delete dto.maturity_date;
    add.mutate(dto, { onSuccess: () => { setOpen(false); setForm({ category: LiabilityCategory.MORTGAGE, description: '', provider: '', outstanding_balance: '', monthly_repayment: '', interest_rate: '', maturity_date: '' }); } });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Liabilities</CardTitle>
          {netWorth && <p className="text-sm text-muted-foreground mt-1">Total: {fmt(netWorth.total_liabilities)}</p>}
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Category</TableHead><TableHead>Description</TableHead><TableHead>Provider</TableHead><TableHead className="text-right">Balance</TableHead><TableHead className="text-right">Repayment</TableHead><TableHead className="text-right">Rate</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {data?.map(l => (
              <TableRow key={l.id}>
                <TableCell><Badge variant="outline">{enumLabel(l.category)}</Badge></TableCell>
                <TableCell className="font-medium">{l.description}</TableCell>
                <TableCell>{l.provider || '—'}</TableCell>
                <TableCell className="text-right">{fmt(l.outstanding_balance)}</TableCell>
                <TableCell className="text-right">{fmt(l.monthly_repayment)}/m</TableCell>
                <TableCell className="text-right">{l.interest_rate ? `${l.interest_rate}%` : '—'}</TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => remove.mutate(l.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
              </TableRow>
            ))}
            {(!data || data.length === 0) && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No liabilities</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Liability</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.values(LiabilityCategory).map(c => <SelectItem key={c} value={c}>{enumLabel(c)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div><Label>Provider</Label><Input value={form.provider} onChange={e => setForm(p => ({ ...p, provider: e.target.value }))} /></div>
            <div><Label>Outstanding Balance</Label><Input type="number" value={form.outstanding_balance} onChange={e => setForm(p => ({ ...p, outstanding_balance: e.target.value }))} /></div>
            <div><Label>Monthly Repayment</Label><Input type="number" value={form.monthly_repayment} onChange={e => setForm(p => ({ ...p, monthly_repayment: e.target.value }))} /></div>
            <div><Label>Interest Rate (%)</Label><Input type="number" step="0.01" value={form.interest_rate} onChange={e => setForm(p => ({ ...p, interest_rate: e.target.value }))} /></div>
            <div><Label>Maturity Date</Label><Input type="date" value={form.maturity_date} onChange={e => setForm(p => ({ ...p, maturity_date: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={handleAdd} disabled={!form.description || !form.outstanding_balance || add.isPending}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ── Tab: Insurance ─────────────────────────────────────────────────

function InsuranceTab({ clientId }: { clientId: string }) {
  const { data, add, remove } = useClientInsurance(clientId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: InsurancePolicyType.LIFE as string, provider: '', policy_number: '', cover_amount: '', monthly_premium: '', inception_date: '' });

  const totalCover = data?.reduce((s, p) => s + Number(p.cover_amount), 0) || 0;
  const totalPremiums = data?.reduce((s, p) => s + Number(p.monthly_premium), 0) || 0;

  const handleAdd = () => {
    const dto: any = { ...form, cover_amount: Number(form.cover_amount), monthly_premium: Number(form.monthly_premium) };
    if (!form.provider) delete dto.provider;
    if (!form.policy_number) delete dto.policy_number;
    if (!form.inception_date) delete dto.inception_date;
    add.mutate(dto, { onSuccess: () => { setOpen(false); setForm({ type: InsurancePolicyType.LIFE, provider: '', policy_number: '', cover_amount: '', monthly_premium: '', inception_date: '' }); } });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Insurance Policies</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Total Cover: {fmt(totalCover)} · Premiums: {fmt(totalPremiums)}/m</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Type</TableHead><TableHead>Provider</TableHead><TableHead>Policy #</TableHead><TableHead className="text-right">Cover</TableHead><TableHead className="text-right">Premium</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {data?.map(p => (
              <TableRow key={p.id}>
                <TableCell><Badge variant="outline">{enumLabel(p.type)}</Badge></TableCell>
                <TableCell>{p.provider || '—'}</TableCell>
                <TableCell>{p.policy_number || '—'}</TableCell>
                <TableCell className="text-right">{fmt(p.cover_amount)}</TableCell>
                <TableCell className="text-right">{fmt(p.monthly_premium)}/m</TableCell>
                <TableCell><Badge variant={p.status === 'active' ? 'default' : 'secondary'}>{enumLabel(p.status)}</Badge></TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => remove.mutate(p.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
              </TableRow>
            ))}
            {(!data || data.length === 0) && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No insurance policies</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Insurance Policy</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.values(InsurancePolicyType).map(t => <SelectItem key={t} value={t}>{enumLabel(t)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Provider</Label><Input value={form.provider} onChange={e => setForm(p => ({ ...p, provider: e.target.value }))} /></div>
            <div><Label>Policy Number</Label><Input value={form.policy_number} onChange={e => setForm(p => ({ ...p, policy_number: e.target.value }))} /></div>
            <div><Label>Cover Amount</Label><Input type="number" value={form.cover_amount} onChange={e => setForm(p => ({ ...p, cover_amount: e.target.value }))} /></div>
            <div><Label>Monthly Premium</Label><Input type="number" value={form.monthly_premium} onChange={e => setForm(p => ({ ...p, monthly_premium: e.target.value }))} /></div>
            <div><Label>Inception Date</Label><Input type="date" value={form.inception_date} onChange={e => setForm(p => ({ ...p, inception_date: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={handleAdd} disabled={!form.cover_amount || !form.monthly_premium || add.isPending}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ── Tab: Budget ────────────────────────────────────────────────────

function BudgetTab({ clientId }: { clientId: string }) {
  const { data, add, remove } = useClientIncomeExpenses(clientId);
  const { data: cashFlow } = useCashFlow(clientId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: IncomeExpenseType.INCOME as string, category: '', description: '', amount: '', frequency: Frequency.MONTHLY as string, is_recurring: true });

  const handleAdd = () => {
    const dto: any = { ...form, amount: Number(form.amount) };
    if (!form.description) delete dto.description;
    add.mutate(dto, { onSuccess: () => { setOpen(false); setForm({ type: IncomeExpenseType.INCOME, category: '', description: '', amount: '', frequency: Frequency.MONTHLY, is_recurring: true }); } });
  };

  const incomeItems = data?.filter(i => i.type === 'income') || [];
  const expenseItems = data?.filter(i => i.type === 'expense') || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Budget & Cash Flow</CardTitle>
          {cashFlow && (
            <div className="flex gap-4 text-sm mt-1">
              <span className="text-green-600">Income: {fmt(cashFlow.monthly_income)}/m</span>
              <span className="text-red-500">Expenses: {fmt(cashFlow.monthly_expenses)}/m</span>
              <span className={cashFlow.monthly_surplus >= 0 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                Surplus: {fmt(cashFlow.monthly_surplus)}/m
              </span>
            </div>
          )}
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold text-green-700 mb-2">Income</h3>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Category</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Frequency</TableHead><TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {incomeItems.map(i => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.category}</TableCell>
                  <TableCell>{i.description || '—'}</TableCell>
                  <TableCell className="text-right">{fmt(i.amount)}</TableCell>
                  <TableCell>{enumLabel(i.frequency)}</TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => remove.mutate(i.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                </TableRow>
              ))}
              {incomeItems.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No income entries</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
        <Separator />
        <div>
          <h3 className="font-semibold text-red-600 mb-2">Expenses</h3>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Category</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Frequency</TableHead><TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {expenseItems.map(i => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.category}</TableCell>
                  <TableCell>{i.description || '—'}</TableCell>
                  <TableCell className="text-right">{fmt(i.amount)}</TableCell>
                  <TableCell>{enumLabel(i.frequency)}</TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => remove.mutate(i.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                </TableRow>
              ))}
              {expenseItems.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No expense entries</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Income / Expense</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Category</Label><Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Salary, Rent, Groceries" /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
            <div><Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={v => setForm(p => ({ ...p, frequency: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.values(Frequency).map(f => <SelectItem key={f} value={f}>{enumLabel(f)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={handleAdd} disabled={!form.category || !form.amount || add.isPending}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ── Tab: Goals ─────────────────────────────────────────────────────

function GoalsTab({ clientId }: { clientId: string }) {
  const { data, add, remove, update } = useClientGoals(clientId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', category: GoalCategory.RETIREMENT as string, target_amount: '', current_amount: '', target_date: '', priority: GoalPriority.IMPORTANT as string, monthly_contribution: '', notes: '' });

  const handleAdd = () => {
    const dto: any = { ...form, target_amount: Number(form.target_amount) };
    if (form.current_amount) dto.current_amount = Number(form.current_amount);
    if (form.monthly_contribution) dto.monthly_contribution = Number(form.monthly_contribution);
    if (!form.target_date) delete dto.target_date;
    if (!form.notes) delete dto.notes;
    add.mutate(dto, { onSuccess: () => { setOpen(false); setForm({ name: '', category: GoalCategory.RETIREMENT, target_amount: '', current_amount: '', target_date: '', priority: GoalPriority.IMPORTANT, monthly_contribution: '', notes: '' }); } });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Financial Goals</CardTitle>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {data?.map(g => {
          const pct = g.target_amount > 0 ? Math.min(100, Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100)) : 0;
          return (
            <div key={g.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{g.name}</h4>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{enumLabel(g.category)}</Badge>
                    <Badge variant={g.priority === 'essential' ? 'destructive' : g.priority === 'important' ? 'default' : 'secondary'}>{enumLabel(g.priority)}</Badge>
                    <Badge variant={g.status === 'active' ? 'default' : g.status === 'achieved' ? 'outline' : 'secondary'}>{enumLabel(g.status)}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Target: {fmt(g.target_amount)}</p>
                  {g.target_date && <p className="text-xs text-muted-foreground">by {fmtDate(g.target_date)}</p>}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{fmt(g.current_amount)} saved</span>
                  <span>{pct}%</span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{g.monthly_contribution ? `Contributing ${fmt(g.monthly_contribution)}/m` : 'No monthly contribution'}</span>
                <div className="flex gap-1">
                  {g.status === 'active' && (
                    <Button variant="ghost" size="sm" onClick={() => update.mutate({ itemId: g.id, dto: { status: GoalStatus.ACHIEVED } })}>Mark Achieved</Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => remove.mutate(g.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              </div>
            </div>
          );
        })}
        {(!data || data.length === 0) && <p className="text-center text-muted-foreground py-8">No financial goals set</p>}
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Financial Goal</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Retirement at 60" /></div>
            <div><Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.values(GoalCategory).map(c => <SelectItem key={c} value={c}>{enumLabel(c)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.values(GoalPriority).map(p => <SelectItem key={p} value={p}>{enumLabel(p)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Target Amount</Label><Input type="number" value={form.target_amount} onChange={e => setForm(p => ({ ...p, target_amount: e.target.value }))} /></div>
            <div><Label>Current Amount</Label><Input type="number" value={form.current_amount} onChange={e => setForm(p => ({ ...p, current_amount: e.target.value }))} /></div>
            <div><Label>Target Date</Label><Input type="date" value={form.target_date} onChange={e => setForm(p => ({ ...p, target_date: e.target.value }))} /></div>
            <div><Label>Monthly Contribution</Label><Input type="number" value={form.monthly_contribution} onChange={e => setForm(p => ({ ...p, monthly_contribution: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={handleAdd} disabled={!form.name || !form.target_amount || add.isPending}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ── Tab: Life Events ───────────────────────────────────────────────

function LifeEventsTab({ clientId }: { clientId: string }) {
  const { data, add, remove } = useClientLifeEvents(clientId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: LifeEventType.MARRIAGE as string, event_date: '', description: '', financial_impact: '', advice_trigger: true });

  const handleAdd = () => {
    const dto: any = { ...form };
    if (form.financial_impact) dto.financial_impact = Number(form.financial_impact);
    else delete dto.financial_impact;
    if (!form.description) delete dto.description;
    add.mutate(dto, { onSuccess: () => { setOpen(false); setForm({ type: LifeEventType.MARRIAGE, event_date: '', description: '', financial_impact: '', advice_trigger: true }); } });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Life Events Timeline</CardTitle>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data?.map(e => (
            <div key={e.id} className="flex gap-4 border-l-2 border-blue-200 pl-4 pb-4 relative">
              <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-blue-500" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{enumLabel(e.type)}</Badge>
                  <span className="text-sm text-muted-foreground">{fmtDate(e.event_date)}</span>
                  {e.advice_trigger && !e.reviewed_at && <Badge variant="destructive" className="text-xs">Needs Review</Badge>}
                  {e.reviewed_at && <Badge variant="secondary" className="text-xs">Reviewed</Badge>}
                </div>
                {e.description && <p className="text-sm mt-1">{e.description}</p>}
                {e.financial_impact && <p className="text-sm text-muted-foreground">Financial impact: {fmt(e.financial_impact)}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove.mutate(e.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
            </div>
          ))}
          {(!data || data.length === 0) && <p className="text-center text-muted-foreground py-8">No life events recorded</p>}
        </div>
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Life Event</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Event Type</Label>
              <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.values(LifeEventType).map(t => <SelectItem key={t} value={t}>{enumLabel(t)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Event Date</Label><Input type="date" value={form.event_date} onChange={e => setForm(p => ({ ...p, event_date: e.target.value }))} /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div><Label>Financial Impact</Label><Input type="number" value={form.financial_impact} onChange={e => setForm(p => ({ ...p, financial_impact: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={handleAdd} disabled={!form.event_date || add.isPending}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
