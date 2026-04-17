'use client';

import { useState } from 'react';
import { useAdvisoryDashboard, useClientAdvisory, useGenerateAdvisory, useUpdateRecommendation } from '@/lib/hooks/use-advisory';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Brain, Sparkles, AlertTriangle, CheckCircle2, Clock, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

const priorityColor: Record<string, string> = { urgent: 'destructive', high: 'destructive', medium: 'default', low: 'secondary' };
const statusColor: Record<string, string> = { pending: 'outline', discussed: 'default', accepted: 'default', declined: 'secondary', implemented: 'default' };
const FOCUS_AREAS = ['investment', 'insurance', 'tax', 'estate', 'debt', 'retirement', 'budget', 'general'];

export default function AdvisoryPage() {
  const { data: dashboard } = useAdvisoryDashboard();
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: async () => { const { data } = await api.get('/clients'); return data; } });
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [focusArea, setFocusArea] = useState('');
  const [genOpen, setGenOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: recommendations = [] } = useClientAdvisory(selectedClient, undefined);
  const generate = useGenerateAdvisory();
  const update = useUpdateRecommendation(selectedClient);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Advisory Engine</h1>
          <p className="text-muted-foreground">AI-powered recommendations for your clients</p>
        </div>
        <Dialog open={genOpen} onOpenChange={setGenOpen}>
          <DialogTrigger asChild><Button><Sparkles className="w-4 h-4 mr-2" />Generate Recommendations</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Generate AI Recommendations</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Client *</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>{clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Focus Area (optional)</Label>
                <Select value={focusArea} onValueChange={setFocusArea}>
                  <SelectTrigger><SelectValue placeholder="All areas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All areas</SelectItem>
                    {FOCUS_AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button disabled={!selectedClient || generate.isPending} onClick={() => {
                generate.mutate({ client_id: selectedClient, focus_area: focusArea && focusArea !== 'all' ? focusArea : undefined });
                setGenOpen(false);
              }}>
                {generate.isPending ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dashboard Cards */}
      {dashboard && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="pt-4 flex items-center gap-3"><Brain className="w-8 h-8 text-blue-500" /><div><p className="text-2xl font-bold">{dashboard.total}</p><p className="text-sm text-muted-foreground">Total Recommendations</p></div></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-3"><Clock className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{dashboard.pending}</p><p className="text-sm text-muted-foreground">Pending Review</p></div></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-3"><AlertTriangle className="w-8 h-8 text-red-500" /><div><p className="text-2xl font-bold">{dashboard.critical}</p><p className="text-sm text-muted-foreground">Critical</p></div></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-3"><CheckCircle2 className="w-8 h-8 text-green-500" /><div><p className="text-2xl font-bold">{dashboard.implemented}</p><p className="text-sm text-muted-foreground">Implemented</p></div></CardContent></Card>
        </div>
      )}

      {/* Category Breakdown */}
      {dashboard?.byCategory && Object.keys(dashboard.byCategory).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">By Category</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(dashboard.byCategory).map(([cat, count]) => (
                <Badge key={cat} variant="outline" className="text-sm py-1 px-3">
                  <TrendingUp className="w-3 h-3 mr-1" />{cat}: {count as number}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Selector */}
      <div className="flex gap-4 items-end">
        <div className="w-64">
          <Label>Select Client to View Recommendations</Label>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
            <SelectContent>{clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {/* Recommendations List */}
      {selectedClient && (
        <div className="space-y-3">
          {recommendations.length === 0 ? (
            <EmptyState icon={Brain} title="No recommendations" description='Click "Generate Recommendations" to create AI-powered advice for this client.' />
          ) : recommendations.map((rec: any) => (
            <Card key={rec.id} className="cursor-pointer" onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={priorityColor[rec.priority] as any || 'secondary'}>{rec.priority}</Badge>
                      <Badge variant="outline">{rec.category}</Badge>
                      <Badge variant={statusColor[rec.status] as any || 'outline'}>{rec.status}</Badge>
                    </div>
                    <h3 className="font-semibold">{rec.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                  </div>
                  {expandedId === rec.id ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </div>

                {expandedId === rec.id && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    {rec.rationale && <div><p className="text-sm font-medium">Rationale</p><p className="text-sm text-muted-foreground">{rec.rationale}</p></div>}
                    {rec.action_items?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Action Items</p>
                        <ul className="space-y-1">
                          {rec.action_items.map((item: any, i: number) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className={`w-4 h-4 ${item.completed ? 'text-green-500' : 'text-muted-foreground'}`} />
                              <span className={item.completed ? 'line-through text-muted-foreground' : ''}>{item.step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      {rec.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={(e) => { e.stopPropagation(); update.mutate({ id: rec.id, status: 'accepted' }); }}>Accept</Button>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); update.mutate({ id: rec.id, status: 'discussed' }); }}>Mark Discussed</Button>
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); update.mutate({ id: rec.id, status: 'declined', dismiss_reason: 'Not applicable' }); }}>Decline</Button>
                        </>
                      )}
                      {rec.status === 'accepted' && (
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); update.mutate({ id: rec.id, status: 'implemented' }); }}>Mark Implemented</Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
