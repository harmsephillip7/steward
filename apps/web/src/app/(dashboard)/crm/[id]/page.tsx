'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLead, useUpdateLead, useConvertLead, useActivities, useCreateActivity, useTasks, useCreateTask, useCompleteTask, useCompleteActivity } from '@/lib/hooks/use-crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, UserCheck, Phone, Mail, Building, Calendar, CheckCircle2, Circle, Plus, Clock } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import Link from 'next/link';
import type { LeadStage } from '@steward/shared';

const STAGES: LeadStage[] = ['new', 'contacted', 'discovery', 'analysis', 'proposal', 'negotiation', 'won', 'lost'] as LeadStage[];
const stageLabels: Record<string, string> = { new: 'New', contacted: 'Contacted', discovery: 'Discovery', analysis: 'Analysis', proposal: 'Proposal', negotiation: 'Negotiation', won: 'Won', lost: 'Lost' };
const ACTIVITY_TYPES = ['call', 'email', 'meeting', 'note', 'follow_up'];
const fmt = (n?: number) => n ? `R ${n.toLocaleString('en-ZA')}` : '—';

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: lead, isLoading } = useLead(id);
  const updateLead = useUpdateLead(id);
  const convertLead = useConvertLead(id);
  const { data: activities = [] } = useActivities(id);
  const { data: tasks = [] } = useTasks();
  const createActivity = useCreateActivity();
  const createTask = useCreateTask();
  const completeTask = useCompleteTask();
  const completeActivity = useCompleteActivity();

  const [actOpen, setActOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [actForm, setActForm] = useState({ type: 'call', subject: '', description: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', due_date: '', priority: 'medium' });

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!lead) return <p>Lead not found</p>;

  const leadTasks = tasks.filter(t => t.lead_id === id);

  const handleStageChange = (stage: string) => updateLead.mutate({ stage: stage as LeadStage });
  const handleConvert = () => convertLead.mutate(undefined, { onSuccess: (data: any) => router.push(`/clients/${data.converted_client_id || data.id}`) });

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{lead.first_name} {lead.last_name}</h1>
          {lead.company && <p className="text-muted-foreground">{lead.company}</p>}
        </div>
        {lead.stage !== 'won' && lead.stage !== 'lost' && (
          <Button onClick={handleConvert} className="bg-green-600 hover:bg-green-700">
            <UserCheck className="w-4 h-4 mr-2" />Convert to Client
          </Button>
        )}
      </div>

      {/* Pipeline Progress */}
      <div className="flex items-center gap-1">
        {STAGES.filter(s => s !== 'lost').map((stage, i) => (
          <button
            key={stage}
            onClick={() => handleStageChange(stage)}
            className={`flex-1 py-2 text-xs font-medium text-center rounded transition-colors ${
              STAGES.indexOf(lead.stage) >= i ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {stageLabels[stage]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Lead Info */}
        <Card className="col-span-1">
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {lead.email && <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-muted-foreground" />{lead.email}</div>}
            {lead.phone && <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-muted-foreground" />{lead.phone}</div>}
            {lead.company && <div className="flex items-center gap-2 text-sm"><Building className="w-4 h-4 text-muted-foreground" />{lead.company}</div>}
            <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-muted-foreground" />Created {new Date(lead.created_at).toLocaleDateString('en-ZA')}</div>
            <div className="pt-2 border-t space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Source</span><span className="capitalize">{lead.source?.replace(/_/g, ' ')}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Priority</span><Badge variant="outline">{lead.priority}</Badge></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Expected Value</span><span>{fmt(lead.expected_value)}</span></div>
            </div>
            {lead.notes && <div className="pt-2 border-t"><p className="text-sm text-muted-foreground">{lead.notes}</p></div>}
          </CardContent>
        </Card>

        {/* Activities & Tasks */}
        <div className="col-span-2">
          <Tabs defaultValue="activities">
            <TabsList>
              <TabsTrigger value="activities">Activities ({activities.length})</TabsTrigger>
              <TabsTrigger value="tasks">Tasks ({leadTasks.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="activities" className="space-y-4 mt-4">
              <Dialog open={actOpen} onOpenChange={setActOpen}>
                <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />Log Activity</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Log Activity</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label>Type</Label>
                      <Select value={actForm.type} onValueChange={v => setActForm(f => ({ ...f, type: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{ACTIVITY_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Subject</Label><Input value={actForm.subject} onChange={e => setActForm(f => ({ ...f, subject: e.target.value }))} /></div>
                    <div><Label>Description</Label><Textarea value={actForm.description} onChange={e => setActForm(f => ({ ...f, description: e.target.value }))} /></div>
                    <Button onClick={() => { createActivity.mutate({ ...actForm, lead_id: id }, { onSuccess: () => { setActOpen(false); setActForm({ type: 'call', subject: '', description: '' }); } }); }}>Log</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="space-y-3">
                {activities.map(a => (
                  <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${a.completed_at ? 'bg-green-100' : 'bg-primary/10'}`}>
                      {a.completed_at ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{a.subject}</span>
                        <Badge variant="secondary" className="text-xs capitalize">{a.type.replace(/_/g, ' ')}</Badge>
                      </div>
                      {a.description && <p className="text-sm text-muted-foreground mt-1">{a.description}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{new Date(a.created_at).toLocaleString('en-ZA')}</p>
                    </div>
                    {!a.completed_at && (
                      <Button variant="ghost" size="sm" onClick={() => completeActivity.mutate(a.id)}>Complete</Button>
                    )}
                  </div>
                ))}
                {activities.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No activities yet</p>}
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4 mt-4">
              <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
                <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Task</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div><Label>Title</Label><Input value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} /></div>
                    <div><Label>Description</Label><Textarea value={taskForm.description} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Due Date</Label><Input type="date" value={taskForm.due_date} onChange={e => setTaskForm(f => ({ ...f, due_date: e.target.value }))} /></div>
                      <div>
                        <Label>Priority</Label>
                        <Select value={taskForm.priority} onValueChange={v => setTaskForm(f => ({ ...f, priority: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={() => { createTask.mutate({ ...taskForm, lead_id: id } as any, { onSuccess: () => { setTaskOpen(false); setTaskForm({ title: '', description: '', due_date: '', priority: 'medium' }); } }); }}>Create</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="space-y-2">
                {leadTasks.map(t => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <button onClick={() => !t.completed_at && completeTask.mutate(t.id)}>
                      {t.completed_at ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${t.completed_at ? 'line-through text-muted-foreground' : ''}`}>{t.title}</p>
                      {t.due_date && <p className="text-xs text-muted-foreground">Due: {new Date(t.due_date).toLocaleDateString('en-ZA')}</p>}
                    </div>
                    <Badge variant="outline">{t.priority}</Badge>
                  </div>
                ))}
                {leadTasks.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No tasks yet</p>}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
