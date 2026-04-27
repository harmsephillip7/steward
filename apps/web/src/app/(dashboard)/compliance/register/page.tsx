'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShieldCheck, GraduationCap, MessageSquareWarning, Search } from 'lucide-react';

export default function ComplianceRegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Compliance Register</h1>
        <p className="text-muted-foreground">
          Fit & Proper attestations, CPD log, complaints register, sanctions screening.
        </p>
      </div>
      <Tabs defaultValue="fp">
        <TabsList>
          <TabsTrigger value="fp">
            <ShieldCheck className="mr-2 h-4 w-4" /> Fit & Proper
          </TabsTrigger>
          <TabsTrigger value="cpd">
            <GraduationCap className="mr-2 h-4 w-4" /> CPD
          </TabsTrigger>
          <TabsTrigger value="complaints">
            <MessageSquareWarning className="mr-2 h-4 w-4" /> Complaints
          </TabsTrigger>
          <TabsTrigger value="sanctions">
            <Search className="mr-2 h-4 w-4" /> Sanctions
          </TabsTrigger>
        </TabsList>
        <TabsContent value="fp" className="mt-4">
          <FitAndProperTab />
        </TabsContent>
        <TabsContent value="cpd" className="mt-4">
          <CpdTab />
        </TabsContent>
        <TabsContent value="complaints" className="mt-4">
          <ComplaintsTab />
        </TabsContent>
        <TabsContent value="sanctions" className="mt-4">
          <SanctionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─────────────────────────── Fit & Proper ───────────────────────────

function FitAndProperTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(initialFp());

  async function load() {
    const { data } = await api.get('/compliance/fit-and-proper');
    setRows(data);
  }
  useEffect(() => { void load(); }, []);

  async function save() {
    await api.post('/compliance/fit-and-proper', form);
    setOpen(false);
    setForm(initialFp());
    void load();
  }

  async function attest(id: string) {
    await api.post(`/compliance/fit-and-proper/${id}/attest`, {});
    void load();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Periodic attestations</CardTitle>
        <Button onClick={() => setOpen(true)}>New attestation</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>5 declarations</TableHead>
              <TableHead>CPD hrs</TableHead>
              <TableHead>RE 1/5</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const allFive =
                r.honesty_integrity_declared &&
                r.solvency_declared &&
                r.personal_character_declared &&
                r.pi_cover_in_force &&
                r.operational_ability_confirmed;
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    {fmtDate(r.period_start)} → {fmtDate(r.period_end)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={allFive ? 'default' : 'outline'}>
                      {allFive ? 'All confirmed' : 'Incomplete'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {r.cpd_hours_achieved} / {r.cpd_hours_required}
                  </TableCell>
                  <TableCell>
                    {r.re1_status ?? '—'} / {r.re5_status ?? '—'}
                  </TableCell>
                  <TableCell>
                    {r.attested ? (
                      <Badge className="bg-green-100 text-green-800">Attested {fmtDate(r.attested_at)}</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!r.attested && allFive && (
                      <Button size="sm" onClick={() => attest(r.id)}>Attest</Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No attestations recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New fit & proper attestation</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Period start">
              <Input type="date" value={form.period_start} onChange={(e) => setForm({ ...form, period_start: e.target.value })} />
            </Field>
            <Field label="Period end">
              <Input type="date" value={form.period_end} onChange={(e) => setForm({ ...form, period_end: e.target.value })} />
            </Field>
            {[
              ['honesty_integrity_declared', 'Honesty & integrity'],
              ['solvency_declared', 'Solvency'],
              ['personal_character_declared', 'Personal character'],
              ['pi_cover_in_force', 'PI cover in force'],
              ['operational_ability_confirmed', 'Operational ability'],
            ].map(([k, label]) => (
              <div key={k as string} className="flex items-center justify-between border rounded-md p-3">
                <Label>{label}</Label>
                <Switch checked={!!form[k as string]} onCheckedChange={(v) => setForm({ ...form, [k as string]: v })} />
              </div>
            ))}
            <Field label="RE 1 status">
              <Select value={form.re1_status} onValueChange={(v) => setForm({ ...form, re1_status: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="na">N/A</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="RE 5 status">
              <Select value={form.re5_status} onValueChange={(v) => setForm({ ...form, re5_status: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="na">N/A</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="CPD hours achieved">
              <Input type="number" step="0.5" value={form.cpd_hours_achieved} onChange={(e) => setForm({ ...form, cpd_hours_achieved: parseFloat(e.target.value || '0') })} />
            </Field>
            <Field label="CPD hours required">
              <Input type="number" step="0.5" value={form.cpd_hours_required} onChange={(e) => setForm({ ...form, cpd_hours_required: parseFloat(e.target.value || '0') })} />
            </Field>
            <div className="col-span-2">
              <Field label="Notes">
                <Textarea value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function initialFp() {
  return {
    period_start: '',
    period_end: '',
    honesty_integrity_declared: false,
    solvency_declared: false,
    personal_character_declared: false,
    pi_cover_in_force: false,
    operational_ability_confirmed: false,
    re1_status: 'na',
    re5_status: 'na',
    cpd_hours_achieved: 0,
    cpd_hours_required: 18,
    notes: '',
  };
}

// ─────────────────────────── CPD ───────────────────────────

function CpdTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({
    activity_type: 'webinar',
    title: '',
    provider: '',
    verifiable: true,
    hours: 1,
    completed_at: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
  const yearEnd = new Date(new Date().getFullYear(), 11, 31).toISOString().slice(0, 10);

  async function load() {
    const [{ data: list }, { data: sum }] = await Promise.all([
      api.get('/compliance/cpd'),
      api.get(`/compliance/cpd/summary?from=${yearStart}&to=${yearEnd}`),
    ]);
    setRows(list);
    setSummary(sum);
  }
  useEffect(() => { void load(); }, []);

  async function save() {
    await api.post('/compliance/cpd', form);
    setOpen(false);
    void load();
  }
  async function remove(id: string) {
    await api.delete(`/compliance/cpd/${id}`);
    void load();
  }

  return (
    <div className="space-y-4">
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          <SummaryCard label="Verifiable hrs" value={summary.verifiable.toFixed(1)} />
          <SummaryCard label="Non-verifiable hrs" value={summary.non_verifiable.toFixed(1)} />
          <SummaryCard label="Total hrs" value={summary.total.toFixed(1)} />
          <SummaryCard
            label="Required"
            value={`${summary.required} (${summary.compliant ? 'on track' : `−${summary.remaining.toFixed(1)}`})`}
            highlight={summary.compliant ? 'green' : 'amber'}
          />
        </div>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>CPD activities</CardTitle>
          <Button onClick={() => setOpen(true)}>Log activity</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Verifiable</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{fmtDate(r.completed_at)}</TableCell>
                  <TableCell>{r.title}</TableCell>
                  <TableCell>{r.provider ?? '—'}</TableCell>
                  <TableCell className="capitalize">{r.activity_type}</TableCell>
                  <TableCell>{r.verifiable ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{Number(r.hours).toFixed(1)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No CPD activities logged yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log CPD activity</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Title">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Provider">
              <Input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} />
            </Field>
            <Field label="Activity type">
              <Select value={form.activity_type} onValueChange={(v) => setForm({ ...form, activity_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="self-study">Self-study</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Hours">
              <Input type="number" step="0.5" value={form.hours} onChange={(e) => setForm({ ...form, hours: parseFloat(e.target.value || '0') })} />
            </Field>
            <Field label="Date completed">
              <Input type="date" value={form.completed_at} onChange={(e) => setForm({ ...form, completed_at: e.target.value })} />
            </Field>
            <div className="flex items-center justify-between border rounded-md p-3">
              <Label>Verifiable</Label>
              <Switch checked={form.verifiable} onCheckedChange={(v) => setForm({ ...form, verifiable: v })} />
            </div>
            <div className="col-span-2">
              <Field label="Notes">
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────── Complaints ───────────────────────────

function ComplaintsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({
    complainant_name: '',
    complainant_contact: '',
    category: 'advice',
    description: '',
    received_at: new Date().toISOString().slice(0, 10),
  });

  async function load() {
    const { data } = await api.get('/compliance/complaints');
    setRows(data);
  }
  useEffect(() => { void load(); }, []);

  async function save() {
    await api.post('/compliance/complaints', form);
    setOpen(false);
    void load();
  }
  async function setStatus(id: string, status: string) {
    await api.patch(`/compliance/complaints/${id}/status`, { status });
    void load();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Complaints register</CardTitle>
        <Button onClick={() => setOpen(true)}>Log complaint</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Received</TableHead>
              <TableHead>Complainant</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ombud eligible</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{fmtDate(r.received_at)}</TableCell>
                <TableCell>{r.complainant_name}</TableCell>
                <TableCell className="capitalize">{r.category}</TableCell>
                <TableCell><Badge variant="outline" className="capitalize">{r.status.replace(/_/g, ' ')}</Badge></TableCell>
                <TableCell>
                  {r.ombud_eligible ? (
                    <Badge className="bg-amber-100 text-amber-800">Yes — 6 wk overdue</Badge>
                  ) : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <Select onValueChange={(v) => setStatus(r.id, v)}>
                    <SelectTrigger className="h-8 w-32"><SelectValue placeholder="Set status" /></SelectTrigger>
                    <SelectContent>
                      {['received', 'acknowledged', 'investigating', 'resolved', 'rejected', 'escalated_to_ombud'].map((s) => (
                        <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No complaints recorded.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log complaint</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Complainant name">
              <Input value={form.complainant_name} onChange={(e) => setForm({ ...form, complainant_name: e.target.value })} />
            </Field>
            <Field label="Contact">
              <Input value={form.complainant_contact} onChange={(e) => setForm({ ...form, complainant_contact: e.target.value })} />
            </Field>
            <Field label="Category">
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['advice', 'service', 'product', 'fees', 'disclosure', 'other'].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Received at">
              <Input type="date" value={form.received_at} onChange={(e) => setForm({ ...form, received_at: e.target.value })} />
            </Field>
            <div className="col-span-2">
              <Field label="Description">
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ─────────────────────────── Sanctions ───────────────────────────

function SanctionsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({
    subject_name: '',
    subject_id_or_passport: '',
    status: 'pending',
    pep_detected: false,
    sanctions_hit: false,
    provider: '',
    screened_at: new Date().toISOString().slice(0, 10),
  });

  async function load() {
    const { data } = await api.get('/compliance/sanctions');
    setRows(data);
  }
  useEffect(() => { void load(); }, []);

  async function save() {
    await api.post('/compliance/sanctions', form);
    setOpen(false);
    void load();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sanctions / PEP screening</CardTitle>
        <Button onClick={() => setOpen(true)}>Log screen</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>PEP</TableHead>
              <TableHead>Sanctions</TableHead>
              <TableHead>Provider</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{fmtDate(r.screened_at)}</TableCell>
                <TableCell>{r.subject_name}</TableCell>
                <TableCell><Badge variant="outline" className="capitalize">{r.status}</Badge></TableCell>
                <TableCell>{r.pep_detected ? 'Yes' : 'No'}</TableCell>
                <TableCell>{r.sanctions_hit ? 'Hit' : 'Clear'}</TableCell>
                <TableCell>{r.provider ?? 'manual'}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No screens logged.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log sanctions screen</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Subject name">
              <Input value={form.subject_name} onChange={(e) => setForm({ ...form, subject_name: e.target.value })} />
            </Field>
            <Field label="ID / Passport">
              <Input value={form.subject_id_or_passport} onChange={(e) => setForm({ ...form, subject_id_or_passport: e.target.value })} />
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['pending', 'clear', 'review', 'match', 'error'].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Provider">
              <Input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} />
            </Field>
            <div className="flex items-center justify-between border rounded-md p-3">
              <Label>PEP detected</Label>
              <Switch checked={form.pep_detected} onCheckedChange={(v) => setForm({ ...form, pep_detected: v })} />
            </div>
            <div className="flex items-center justify-between border rounded-md p-3">
              <Label>Sanctions hit</Label>
              <Switch checked={form.sanctions_hit} onCheckedChange={(v) => setForm({ ...form, sanctions_hit: v })} />
            </div>
            <Field label="Screened at">
              <Input type="date" value={form.screened_at} onChange={(e) => setForm({ ...form, screened_at: e.target.value })} />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ─────────────────────────── helpers ───────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SummaryCard({ label, value, highlight }: { label: string; value: string; highlight?: 'green' | 'amber' }) {
  const colour =
    highlight === 'green'
      ? 'border-green-300 bg-green-50'
      : highlight === 'amber'
      ? 'border-amber-300 bg-amber-50'
      : '';
  return (
    <Card className={colour}>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground uppercase">{label}</div>
        <div className="text-2xl font-semibold mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}

function fmtDate(d?: string | Date | null) {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: '2-digit' });
}
