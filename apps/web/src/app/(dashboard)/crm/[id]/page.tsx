'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLead, useUpdateLead, useConvertLead, useActivities, useCreateActivity, useTasks, useCreateTask, useCompleteTask, useCompleteActivity, useStageProgress, useUpdateDiscoveryData, useUpdateAnalysisData } from '@/lib/hooks/use-crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, UserCheck, Phone, Mail, Building, Calendar, CheckCircle2, Circle, Plus, Clock, AlertTriangle } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { StageGuidancePanel } from '@/components/crm/stage-guidance-panel';
import { DiscoveryForm } from '@/components/crm/discovery-form';
import { AnalysisForm } from '@/components/crm/analysis-form';
import Link from 'next/link';
import type { LeadStage, DiscoveryData, AnalysisData } from '@steward/shared';

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
  const { data: stageProgress } = useStageProgress(id);
  const updateDiscovery = useUpdateDiscoveryData(id);
  const updateAnalysis = useUpdateAnalysisData(id);

  const [actOpen, setActOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [stageConfirm, setStageConfirm] = useState<{ target: LeadStage } | null>(null);
  const [actForm, setActForm] = useState({ type: 'call', subject: '', description: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', due_date: '', priority: 'medium' });

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!lead) return <p>Lead not found</p>;

  const leadTasks = tasks.filter(t => t.lead_id === id);
  const stageTasks = leadTasks.filter(t => t.stage === lead.stage);

  const handleStageChange = (stage: string) => {
    const target = stage as LeadStage;
    // If jumping ahead more than 1 stage, confirm
    const currentIdx = STAGES.indexOf(lead.stage);
    const targetIdx = STAGES.indexOf(target);
    if (targetIdx > currentIdx + 1 && stageProgress && stageProgress.progress.pct < 100) {
      setStageConfirm({ target });
    } else {
      updateLead.mutate({ stage: target });
    }
  };

  const confirmStageChange = () => {
    if (stageConfirm) {
      updateLead.mutate({ stage: stageConfirm.target });
      setStageConfirm(null);
    }
  };

  const handleConvert = () => {
    convertLead.mutate(undefined, {
      onSuccess: (data: any) => {
        setConvertOpen(false);
        router.push(`/clients/${data.client?.id || data.converted_client_id}`);
      },
    });
  };

  const isConverted = !!lead.converted_client_id;

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{lead.first_name} {lead.last_name}</h1>
          {lead.company && <p className="text-muted-foreground">{lead.company}</p>}
        </div>
        {!isConverted && (
          <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <UserCheck className="w-4 h-4 mr-2" />Convert to Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convert Lead to Client</DialogTitle>
                <DialogDescription>
                  This will create a new client record from this lead{lead.stage !== 'won' ? ` (currently in "${stageLabels[lead.stage]}" stage)` : ''}.
                  {stageProgress && stageProgress.progress.pct < 50 && (
                    <span className="block mt-2 text-yellow-600">
                      <AlertTriangle className="inline w-4 h-4 mr-1" />
                      Stage progress is at {stageProgress.progress.pct}%. Some discovery or analysis data may be incomplete.
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConvertOpen(false)}>Cancel</Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={handleConvert}>
                  Convert Now
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {isConverted && (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Converted</Badge>
        )}
      </div>

      {/* Stage Change Confirmation Dialog */}
      <Dialog open={!!stageConfirm} onOpenChange={open => !open && setStageConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skip Stages?</DialogTitle>
            <DialogDescription>
              You&apos;re jumping from &quot;{stageLabels[lead.stage]}&quot; to &quot;{stageConfirm ? stageLabels[stageConfirm.target] : ''}&quot;.
              Some recommended actions may not be completed. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStageConfirm(null)}>Cancel</Button>
            <Button onClick={confirmStageChange}>Proceed Anyway</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Stage Guidance Panel */}
      {stageProgress && (
        <StageGuidancePanel
          guidance={stageProgress.guidance}
          progress={stageProgress.progress}
          timeInStageDays={stageProgress.time_in_stage_days}
        />
      )}

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
              <TabsTrigger value="discovery">Discovery</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
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
                    {(t as any).is_auto && <Badge variant="secondary" className="text-[10px]">Auto</Badge>}
                    <Badge variant="outline">{t.priority}</Badge>
                  </div>
                ))}
                {leadTasks.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No tasks yet</p>}
              </div>
            </TabsContent>

            <TabsContent value="discovery" className="mt-4">
              <DiscoveryForm
                defaultValues={(lead as any).discovery_data || {}}
                onSubmit={(data) => updateDiscovery.mutate(data)}
                isPending={updateDiscovery.isPending}
              />
            </TabsContent>

            <TabsContent value="analysis" className="mt-4">
              <AnalysisForm
                defaultValues={(lead as any).analysis_data || {}}
                onSubmit={(data) => updateAnalysis.mutate(data)}
                isPending={updateAnalysis.isPending}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
