'use client';

import { useClients } from '@/lib/hooks/use-clients';
import { useFunds } from '@/lib/hooks/use-funds';
import { usePortfolios } from '@/lib/hooks/use-portfolios';
import { usePipeline, useTasks } from '@/lib/hooks/use-crm';
import { useComplianceDashboard } from '@/lib/hooks/use-enhanced-compliance';
import { useCommissionSummary } from '@/lib/hooks/use-commissions';
import { useAdvisoryDashboard } from '@/lib/hooks/use-advisory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Users, Briefcase, TrendingUp, Shield, DollarSign, Target,
  AlertTriangle, CheckCircle2, Clock, Brain, ArrowRight, Plus,
} from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '@/lib/format';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6b7280'];
const stageLabels: Record<string, string> = {
  new: 'New', contacted: 'Contacted', discovery: 'Discovery', analysis: 'Analysis',
  proposal: 'Proposal', negotiation: 'Negotiation', won: 'Won', lost: 'Lost',
};

function StatCard({
  label, value, icon: Icon, loading, description, trend, href,
}: {
  label: string; value: string | number; icon: React.FC<{ className?: string }>;
  loading?: boolean; description?: string; trend?: 'up' | 'down' | 'neutral'; href?: string;
}) {
  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function DashboardPage() {
  const { data: clients, isLoading: loadingClients } = useClients();
  const { data: funds, isLoading: loadingFunds } = useFunds();
  const { data: portfolios, isLoading: loadingPortfolios } = usePortfolios();
  const { data: pipeline = [] } = usePipeline();
  const { data: compliance } = useComplianceDashboard();
  const { data: commissions } = useCommissionSummary();
  const { data: advisory } = useAdvisoryDashboard();
  const { data: tasks = [] } = useTasks();

  const activePipelineStages = pipeline.filter(s => s.stage !== 'won' && s.stage !== 'lost');
  const pipelineData = activePipelineStages.map(s => ({
    name: stageLabels[s.stage] || s.stage,
    leads: s.count || 0,
    value: s.total_value || 0,
  }));

  const totalAUM = portfolios?.reduce((sum, p: any) => sum + (Number(p.total_value) || 0), 0) || 0;
  const pipelineValue = pipeline.reduce((s, p) => s + (p.total_value || 0), 0);
  const activeLeads = pipeline.filter(s => s.stage !== 'won' && s.stage !== 'lost').reduce((s, p) => s + (p.count || 0), 0);
  const upcomingTasks = tasks.filter((t: any) => !t.completed_at).slice(0, 5);
  const overdueReviews = compliance?.overdueReviews || 0;
  const pendingAdvisory = advisory?.pending || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your advisory practice</p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/crm"><Plus className="w-4 h-4 mr-1" />New Lead</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/clients"><Plus className="w-4 h-4 mr-1" />New Client</Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Clients" value={clients?.length ?? 0} icon={Users} loading={loadingClients} description="Active relationships" href="/clients" />
        <StatCard label="AUM" value={formatCurrency(totalAUM)} icon={Briefcase} loading={loadingPortfolios} description={`${portfolios?.length ?? 0} portfolios`} href="/portfolios" />
        <StatCard label="Pipeline Value" value={formatCurrency(pipelineValue)} icon={Target} description={`${activeLeads} active leads`} href="/crm" />
        <StatCard label="Revenue" value={formatCurrency(commissions?.totalReceived || 0)} icon={DollarSign} description={`${formatCurrency(commissions?.totalExpected || 0)} expected`} href="/commissions" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Pipeline Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Sales Pipeline</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/crm">View all <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pipelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                    formatter={(value: number) => [value, 'Leads']}
                  />
                  <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[220px] text-muted-foreground">
                <Target className="h-8 w-8 mb-2" />
                <p className="text-sm">No pipeline data yet</p>
                <Button asChild size="sm" variant="link"><Link href="/crm">Add your first lead</Link></Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Revenue Breakdown</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/commissions">View all <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {commissions?.byType && Object.keys(commissions.byType).length > 0 ? (
              <div className="flex items-center gap-8">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={Object.entries(commissions.byType).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value: value as number }))}
                      cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                      paddingAngle={3} dataKey="value"
                    >
                      {Object.keys(commissions.byType).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {Object.entries(commissions.byType).map(([type, amount], i) => (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(amount as number)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[180px] text-muted-foreground">
                <DollarSign className="h-8 w-8 mb-2" />
                <p className="text-sm">No commission data yet</p>
                <Button asChild size="sm" variant="link"><Link href="/commissions">Record a commission</Link></Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Tasks, Compliance, Advisory */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Upcoming Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" /> Tasks
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/crm">View all <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length > 0 ? (
              <div className="space-y-3">
                {upcomingTasks.map((task: any) => (
                  <div key={task.id} className="flex items-start gap-3 text-sm">
                    <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${task.priority === 'high' ? 'bg-destructive' : task.priority === 'medium' ? 'bg-orange-500' : 'bg-muted-foreground'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{task.title}</p>
                      {task.due_date && (
                        <p className="text-xs text-muted-foreground">
                          Due {new Date(task.due_date).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">{task.priority}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No pending tasks</p>
            )}
          </CardContent>
        </Card>

        {/* Compliance Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4" /> Compliance
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/compliance/dashboard">View all <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Overdue Reviews</span>
                <Badge variant={overdueReviews > 0 ? 'destructive' : 'secondary'}>
                  {overdueReviews > 0 ? <AlertTriangle className="w-3 h-3 mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {overdueReviews}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending Reviews</span>
                <Badge variant="outline">{compliance?.pendingReviews || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Open Conflicts</span>
                <Badge variant="outline">{compliance?.openConflicts || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Upcoming Returns</span>
                <Badge variant="outline">{compliance?.upcomingReturns || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Due in 30 Days</span>
                <Badge variant={compliance?.reviewsDue30Days ? 'default' : 'secondary'}>{compliance?.reviewsDue30Days || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Advisory */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="w-4 h-4" /> AI Advisory
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/advisory">View all <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className="text-3xl font-bold">{advisory?.total || 0}</div>
                <p className="text-sm text-muted-foreground">Total Recommendations</p>
              </div>
              {(advisory?.total || 0) > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-orange-500" /> Pending</span>
                    <span className="font-medium">{advisory?.pending || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-500" /> Critical</span>
                    <span className="font-medium">{advisory?.critical || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Implemented</span>
                    <span className="font-medium">{advisory?.implemented || 0}</span>
                  </div>
                  {(advisory?.total ?? 0) > 0 && (
                    <div className="pt-1">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Implementation rate</span>
                        <span>{Math.round(((advisory?.implemented || 0) / (advisory?.total || 1)) * 100)}%</span>
                      </div>
                      <Progress value={((advisory?.implemented || 0) / (advisory?.total || 1)) * 100} className="h-2" />
                    </div>
                  )}
                </div>
              )}
              {(advisory?.total || 0) === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Generate AI recommendations for your clients
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Screened Funds" value={funds?.length ?? 0} icon={TrendingUp} loading={loadingFunds} description="ESG & faith-screened" href="/funds" />
        <StatCard label="Pending Advisory" value={pendingAdvisory} icon={Brain} description="Awaiting review" href="/advisory" />
        <StatCard label="Compliance Score" value={overdueReviews === 0 ? 'Good' : 'Attention'} icon={Shield} description={overdueReviews > 0 ? `${overdueReviews} overdue` : 'All reviews current'} href="/compliance/dashboard" />
        <StatCard label="VAT Collected" value={formatCurrency(commissions?.totalVAT || 0)} icon={DollarSign} description="15% SA VAT" href="/commissions" />
      </div>
    </div>
  );
}
