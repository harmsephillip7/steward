'use client';

import { useState } from 'react';
import {
  useComplianceDashboard, useComplianceReviews, useOverdueReviews,
  useCreateReview, useCompleteReview, useConflicts, useCreateConflict,
  useRegulatoryReturns, useCreateReturn, useUpdateReturn,
} from '@/lib/hooks/use-enhanced-compliance';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Shield, AlertTriangle, FileCheck, Scale, Calendar, Clock, CheckCircle2, Plus } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

const REVIEW_TYPES = ['annual', 'bi_annual', 'ad_hoc', 'tcf', 'fais_fit_proper'];
const CONFLICT_TYPES = ['personal_interest', 'related_party', 'gift', 'ownership'];
const RETURN_TYPES = ['fsca_annual', 'fais_compliance', 'tcf_report', 'complaints_register'];
const RETURN_STATUSES = ['draft', 'submitted', 'accepted'];

export default function ComplianceDashboardPage() {
  const { data: dashboard } = useComplianceDashboard();
  const { data: reviews = [] } = useComplianceReviews();
  const { data: overdue = [] } = useOverdueReviews();
  const { data: conflicts = [] } = useConflicts();
  const { data: returns = [] } = useRegulatoryReturns();
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: async () => { const { data } = await api.get('/clients'); return data; } });

  const createReview = useCreateReview();
  const completeReview = useCompleteReview();
  const createConflict = useCreateConflict();
  const createReturn = useCreateReturn();
  const updateReturn = useUpdateReturn();

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ client_id: '', review_type: 'annual', next_review_date: '' });
  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflictForm, setConflictForm] = useState({ client_id: '', conflict_type: 'personal_interest', description: '', parties_involved: '', mitigation: '' });
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnForm, setReturnForm] = useState({ return_type: 'fsca_annual', due_date: '', period_start: '', period_end: '', notes: '' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Compliance Dashboard</h1>
        <p className="text-muted-foreground">Enhanced compliance management &amp; regulatory tracking</p>
      </div>

      {/* Dashboard Stats */}
      {dashboard && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card><CardContent className="pt-4 flex items-center gap-3"><AlertTriangle className="w-8 h-8 text-red-500" /><div><p className="text-2xl font-bold">{dashboard.overdueReviews}</p><p className="text-sm text-muted-foreground">Overdue Reviews</p></div></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-3"><Clock className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{dashboard.pendingReviews}</p><p className="text-sm text-muted-foreground">Pending Reviews</p></div></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-3"><Scale className="w-8 h-8 text-purple-500" /><div><p className="text-2xl font-bold">{dashboard.openConflicts}</p><p className="text-sm text-muted-foreground">Open Conflicts</p></div></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-3"><Calendar className="w-8 h-8 text-primary" /><div><p className="text-2xl font-bold">{dashboard.upcomingReturns}</p><p className="text-sm text-muted-foreground">Upcoming Returns</p></div></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-3"><FileCheck className="w-8 h-8 text-green-500" /><div><p className="text-2xl font-bold">{dashboard.reviewsDue30Days}</p><p className="text-sm text-muted-foreground">Due in 30 Days</p></div></CardContent></Card>
        </div>
      )}

      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({overdue.length})</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts ({conflicts.length})</TabsTrigger>
          <TabsTrigger value="returns">Regulatory Returns ({returns.length})</TabsTrigger>
        </TabsList>

        {/* ── Reviews ── */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Compliance Reviews</CardTitle>
              <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-2" />New Review</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Schedule Compliance Review</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label>Client *</Label>
                      <Select value={reviewForm.client_id} onValueChange={v => setReviewForm(f => ({ ...f, client_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                        <SelectContent>{clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Review Type</Label>
                      <Select value={reviewForm.review_type} onValueChange={v => setReviewForm(f => ({ ...f, review_type: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{REVIEW_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Next Review Date</Label><Input type="date" value={reviewForm.next_review_date} onChange={e => setReviewForm(f => ({ ...f, next_review_date: e.target.value }))} /></div>
                    <Button disabled={!reviewForm.client_id || createReview.isPending} onClick={() => {
                      createReview.mutate(reviewForm as any);
                      setReviewOpen(false);
                    }}>Create Review</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr><th className="p-3 text-left">Type</th><th className="p-3 text-left">Client</th><th className="p-3 text-left">Next Review</th><th className="p-3 text-left">Status</th><th className="p-3 text-right">Actions</th></tr></thead>
                  <tbody>
                    {reviews.length === 0 ? <tr><td colSpan={5} className="p-0"><EmptyState icon={FileCheck} title="No compliance reviews" description="Schedule your first compliance review for a client." actionLabel="Schedule Review" onAction={() => setReviewOpen(true)} /></td></tr> : reviews.map((r: any) => (
                      <tr key={r.id} className="border-t">
                        <td className="p-3"><Badge variant="outline">{r.review_type?.replace(/_/g, ' ')}</Badge></td>
                        <td className="p-3">{r.client_id?.slice(0, 8)}...</td>
                        <td className="p-3">{r.next_review_date ? new Date(r.next_review_date).toLocaleDateString() : '—'}</td>
                        <td className="p-3"><Badge variant={r.completed_at ? 'default' : 'outline'}>{r.completed_at ? 'Completed' : 'Pending'}</Badge></td>
                        <td className="p-3 text-right">
                          {!r.completed_at && <Button size="sm" variant="outline" onClick={() => completeReview.mutate({ id: r.id })}>Complete</Button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Overdue ── */}
        <TabsContent value="overdue">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" /> Overdue Reviews</CardTitle></CardHeader>
            <CardContent>
              {overdue.length === 0 ? <EmptyState icon={CheckCircle2} title="No overdue reviews" description="All compliance reviews are up to date." /> : (
                <div className="space-y-3">
                  {overdue.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50 dark:bg-red-950/20">
                      <div>
                        <Badge variant="destructive" className="mb-1">{r.review_type?.replace(/_/g, ' ')}</Badge>
                        <p className="text-sm text-muted-foreground">Due: {r.next_review_date ? new Date(r.next_review_date).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <Button size="sm" onClick={() => completeReview.mutate({ id: r.id })}>Complete Now</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Conflicts ── */}
        <TabsContent value="conflicts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Scale className="w-5 h-5" /> Conflicts of Interest</CardTitle>
              <Dialog open={conflictOpen} onOpenChange={setConflictOpen}>
                <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-2" />Declare Conflict</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Declare Conflict of Interest</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label>Client (optional)</Label>
                      <Select value={conflictForm.client_id} onValueChange={v => setConflictForm(f => ({ ...f, client_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                        <SelectContent>{clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select value={conflictForm.conflict_type} onValueChange={v => setConflictForm(f => ({ ...f, conflict_type: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{CONFLICT_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Description *</Label><Textarea value={conflictForm.description} onChange={e => setConflictForm(f => ({ ...f, description: e.target.value }))} /></div>
                    <div><Label>Parties Involved</Label><Input value={conflictForm.parties_involved} onChange={e => setConflictForm(f => ({ ...f, parties_involved: e.target.value }))} /></div>
                    <div><Label>Mitigation</Label><Textarea value={conflictForm.mitigation} onChange={e => setConflictForm(f => ({ ...f, mitigation: e.target.value }))} /></div>
                    <Button disabled={!conflictForm.description || createConflict.isPending} onClick={() => {
                      const dto: any = { ...conflictForm };
                      if (!dto.client_id) delete dto.client_id;
                      createConflict.mutate(dto);
                      setConflictOpen(false);
                    }}>Record</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr><th className="p-3 text-left">Type</th><th className="p-3 text-left">Description</th><th className="p-3 text-left">Disclosed</th><th className="p-3 text-left">Resolved</th></tr></thead>
                  <tbody>
                    {conflicts.length === 0 ? <tr><td colSpan={4} className="p-0"><EmptyState icon={Scale} title="No conflicts declared" description="Declare any conflicts of interest as they arise." actionLabel="Declare Conflict" onAction={() => setConflictOpen(true)} /></td></tr> : conflicts.map((c: any) => (
                      <tr key={c.id} className="border-t">
                        <td className="p-3"><Badge variant="outline">{c.conflict_type?.replace(/_/g, ' ')}</Badge></td>
                        <td className="p-3 max-w-xs truncate">{c.description}</td>
                        <td className="p-3">{c.disclosed_date ? new Date(c.disclosed_date).toLocaleDateString() : '—'}</td>
                        <td className="p-3">{c.resolved_date ? <Badge><CheckCircle2 className="w-3 h-3 mr-1" />Resolved</Badge> : <Badge variant="outline">Open</Badge>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Regulatory Returns ── */}
        <TabsContent value="returns">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><FileCheck className="w-5 h-5" /> Regulatory Returns</CardTitle>
              <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
                <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-2" />New Return</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>File Regulatory Return</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label>Return Type</Label>
                      <Select value={returnForm.return_type} onValueChange={v => setReturnForm(f => ({ ...f, return_type: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{RETURN_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Due Date *</Label><Input type="date" value={returnForm.due_date} onChange={e => setReturnForm(f => ({ ...f, due_date: e.target.value }))} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Period Start</Label><Input type="date" value={returnForm.period_start} onChange={e => setReturnForm(f => ({ ...f, period_start: e.target.value }))} /></div>
                      <div><Label>Period End</Label><Input type="date" value={returnForm.period_end} onChange={e => setReturnForm(f => ({ ...f, period_end: e.target.value }))} /></div>
                    </div>
                    <div><Label>Notes</Label><Textarea value={returnForm.notes} onChange={e => setReturnForm(f => ({ ...f, notes: e.target.value }))} /></div>
                    <Button disabled={!returnForm.due_date || createReturn.isPending} onClick={() => {
                      createReturn.mutate(returnForm as any);
                      setReturnOpen(false);
                    }}>Create Return</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr><th className="p-3 text-left">Type</th><th className="p-3 text-left">Due Date</th><th className="p-3 text-left">Period</th><th className="p-3 text-left">Status</th><th className="p-3 text-right">Actions</th></tr></thead>
                  <tbody>
                    {returns.length === 0 ? <tr><td colSpan={5} className="p-0"><EmptyState icon={Calendar} title="No regulatory returns" description="Record regulatory return filings and due dates." actionLabel="Add Return" onAction={() => setReturnOpen(true)} /></td></tr> : returns.map((r: any) => (
                      <tr key={r.id} className="border-t">
                        <td className="p-3"><Badge variant="outline">{r.return_type?.replace(/_/g, ' ')}</Badge></td>
                        <td className="p-3">{r.due_date ? new Date(r.due_date).toLocaleDateString() : '—'}</td>
                        <td className="p-3 text-muted-foreground">{r.period_start && r.period_end ? `${new Date(r.period_start).toLocaleDateString()} – ${new Date(r.period_end).toLocaleDateString()}` : '—'}</td>
                        <td className="p-3"><Badge variant={r.status === 'accepted' ? 'default' : r.status === 'submitted' ? 'secondary' : 'outline'}>{r.status}</Badge></td>
                        <td className="p-3 text-right">
                          {r.status === 'draft' && <Button size="sm" variant="outline" onClick={() => updateReturn.mutate({ id: r.id, status: 'submitted' } as any)}>Submit</Button>}
                          {r.status === 'submitted' && <Button size="sm" variant="outline" onClick={() => updateReturn.mutate({ id: r.id, status: 'accepted' } as any)}>Mark Accepted</Button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
