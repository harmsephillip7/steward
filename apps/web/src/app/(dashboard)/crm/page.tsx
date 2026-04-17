'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useLeads, usePipeline, useCreateLead, useUpdateLead } from '@/lib/hooks/use-crm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { Plus, Phone, Mail, DollarSign, ChevronRight, User, Kanban, List, GripVertical } from 'lucide-react';
import {
  DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, type DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import type { LeadType, LeadSource, LeadStage } from '@steward/shared';

const KANBAN_STAGES: LeadStage[] = ['new', 'contacted', 'discovery', 'analysis', 'proposal', 'negotiation'] as LeadStage[];
const ALL_STAGES: LeadStage[] = [...KANBAN_STAGES, 'won', 'lost'] as LeadStage[];

const stageLabels: Record<string, string> = {
  new: 'New', contacted: 'Contacted', discovery: 'Discovery', analysis: 'Analysis',
  proposal: 'Proposal', negotiation: 'Negotiation', won: 'Won', lost: 'Lost',
};

const stageColors: Record<string, string> = {
  new: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
  contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  discovery: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  analysis: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  proposal: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  negotiation: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  won: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  lost: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const SOURCES: LeadSource[] = ['referral', 'website', 'cold_call', 'event', 'social_media', 'existing_client'] as LeadSource[];
const fmt = (n?: number) => n ? `R ${n.toLocaleString('en-ZA')}` : '—';

/* ── Droppable Column ── */
function KanbanColumn({ stage, children, count }: { stage: string; children: React.ReactNode; count: number }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return (
    <div className="min-w-[280px] w-[280px] flex-shrink-0 flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-semibold text-sm">{stageLabels[stage]}</h3>
        <Badge variant="secondary" className="text-xs">{count}</Badge>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 p-2 rounded-lg min-h-[120px] transition-colors ${isOver ? 'bg-primary/5 ring-2 ring-primary/20' : 'bg-muted/30'}`}
      >
        {children}
      </div>
    </div>
  );
}

/* ── Draggable Lead Card ── */
function SortableLeadCard({ lead }: { lead: LeadType }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <button {...listeners} className="mt-0.5 text-muted-foreground hover:text-foreground touch-none">
              <GripVertical className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <Link href={`/crm/${lead.id}`} className="font-medium text-sm hover:underline truncate">
                  {lead.first_name} {lead.last_name}
                </Link>
                <Badge variant="outline" className={`text-xs shrink-0 ml-1 ${lead.priority === 'urgent' ? 'border-red-300 text-red-700 dark:border-red-700 dark:text-red-400' : lead.priority === 'high' ? 'border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-400' : ''}`}>
                  {lead.priority}
                </Badge>
              </div>
              {lead.company && <p className="text-xs text-muted-foreground truncate">{lead.company}</p>}
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-2">
                  {lead.email && <Mail className="w-3 h-3 text-muted-foreground" />}
                  {lead.phone && <Phone className="w-3 h-3 text-muted-foreground" />}
                </div>
                {lead.expected_value ? (
                  <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                    <DollarSign className="w-3 h-3" />{fmt(lead.expected_value)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Drag Overlay (ghost card while dragging) ── */
function LeadCardOverlay({ lead }: { lead: LeadType }) {
  return (
    <Card className="shadow-lg rotate-2 w-[260px]">
      <CardContent className="p-3">
        <p className="font-medium text-sm">{lead.first_name} {lead.last_name}</p>
        {lead.company && <p className="text-xs text-muted-foreground">{lead.company}</p>}
      </CardContent>
    </Card>
  );
}

export default function CrmPage() {
  const { data: leads = [] } = useLeads();
  const { data: pipeline = [] } = usePipeline();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({ source: 'referral', priority: 'medium' });
  const [view, setView] = useState<'pipeline' | 'list'>('pipeline');
  const [activeDrag, setActiveDrag] = useState<LeadType | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleCreate = () => {
    createLead.mutate(form as any, { onSuccess: () => { setOpen(false); setForm({ source: 'referral', priority: 'medium' }); } });
  };

  const leadsByStage = ALL_STAGES.reduce((acc, stage) => {
    acc[stage] = leads.filter(l => l.stage === stage);
    return acc;
  }, {} as Record<string, LeadType[]>);

  const totalValue = pipeline.reduce((s, p) => s + (p.total_value || 0), 0);
  const activeLeads = leads.filter(l => l.stage !== 'won' && l.stage !== 'lost').length;

  const handleDragStart = useCallback((e: DragStartEvent) => {
    const lead = leads.find(l => l.id === e.active.id);
    if (lead) setActiveDrag(lead);
  }, [leads]);

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    setActiveDrag(null);
    const { active, over } = e;
    if (!over) return;
    const leadId = active.id as string;
    const newStage = over.id as string;
    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.stage === newStage) return;
    if (KANBAN_STAGES.includes(newStage as LeadStage)) {
      updateLead.mutate({ id: leadId, dto: { stage: newStage as LeadStage } });
    }
  }, [leads, updateLead]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CRM</h1>
          <p className="text-muted-foreground">Manage your leads and pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border">
            <Button variant={view === 'pipeline' ? 'default' : 'ghost'} size="sm" onClick={() => setView('pipeline')}>
              <Kanban className="w-4 h-4 mr-1" />Pipeline
            </Button>
            <Button variant={view === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setView('list')}>
              <List className="w-4 h-4 mr-1" />List
            </Button>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />New Lead</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Lead</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>First Name</Label><Input value={form.first_name || ''} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} /></div>
                  <div><Label>Last Name</Label><Input value={form.last_name || ''} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Email</Label><Input type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                  <div><Label>Phone</Label><Input value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                </div>
                <div><Label>Company</Label><Input value={form.company || ''} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Source</Label>
                    <Select value={form.source} onValueChange={v => setForm(f => ({ ...f, source: v as LeadSource }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{SOURCES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as any }))}>
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
                <div><Label>Expected Value (R)</Label><Input type="number" value={form.expected_value || ''} onChange={e => setForm(f => ({ ...f, expected_value: +e.target.value }))} /></div>
                <div><Label>Notes</Label><Input value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
                <Button onClick={handleCreate} disabled={!form.first_name || !form.last_name}>Create Lead</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Active Leads</p><p className="text-2xl font-bold">{activeLeads}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Pipeline Value</p><p className="text-2xl font-bold">{fmt(totalValue)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Won</p><p className="text-2xl font-bold">{leads.filter(l => l.stage === 'won').length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Conversion Rate</p><p className="text-2xl font-bold">{leads.length ? Math.round(leads.filter(l => l.stage === 'won').length / leads.length * 100) : 0}%</p></CardContent></Card>
      </div>

      {leads.length === 0 ? (
        <EmptyState
          icon={Kanban}
          title="No leads yet"
          description="Start building your pipeline by adding your first lead."
          actionLabel="Add Lead"
          onAction={() => setOpen(true)}
        />
      ) : view === 'pipeline' ? (
        /* ── Drag-and-Drop Kanban Board ── */
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {KANBAN_STAGES.map(stage => (
              <KanbanColumn key={stage} stage={stage} count={leadsByStage[stage]?.length || 0}>
                <SortableContext items={(leadsByStage[stage] || []).map(l => l.id)} strategy={verticalListSortingStrategy}>
                  {(leadsByStage[stage] || []).map(lead => (
                    <SortableLeadCard key={lead.id} lead={lead} />
                  ))}
                </SortableContext>
              </KanbanColumn>
            ))}
          </div>
          <DragOverlay>{activeDrag && <LeadCardOverlay lead={activeDrag} />}</DragOverlay>
        </DndContext>
      ) : (
        /* ── List View ── */
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="text-left text-sm">
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Company</th>
                  <th className="p-3 font-medium">Stage</th>
                  <th className="p-3 font-medium">Source</th>
                  <th className="p-3 font-medium">Priority</th>
                  <th className="p-3 font-medium">Value</th>
                  <th className="p-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{lead.first_name} {lead.last_name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{lead.company || '—'}</td>
                    <td className="p-3"><Badge className={stageColors[lead.stage]}>{stageLabels[lead.stage]}</Badge></td>
                    <td className="p-3 text-sm capitalize">{lead.source?.replace(/_/g, ' ')}</td>
                    <td className="p-3"><Badge variant="outline">{lead.priority}</Badge></td>
                    <td className="p-3 text-sm">{fmt(lead.expected_value)}</td>
                    <td className="p-3">
                      <Link href={`/crm/${lead.id}`}>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
