'use client';

import { useDashboardSummary } from '@/lib/hooks/use-dashboard';
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
import dynamic from 'next/dynamic';
import { formatCurrency } from '@/lib/format';

const PipelineChart = dynamic(() => import('./charts').then(m => ({ default: m.PipelineChart })), {
  loading: () => <Skeleton className="h-[280px] w-full rounded-lg" />,
  ssr: false,
});
const RevenueChart = dynamic(() => import('./charts').then(m => ({ default: m.RevenueChart })), {
  loading: () => <Skeleton className="h-[280px] w-full rounded-lg" />,
  ssr: false,
});
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
  const { data: summary, isLoading } = useDashboardSummary();

  const pipeline = summary?.pipeline || [];
  const activePipelineStages = pipeline.filter(s => s.stage !== 'won' && s.stage !== 'lost');
  const pipelineData = activePipelineStages.map(s => ({
    name: stageLabels[s.stage] || s.stage,
    leads: s.count || 0,
    value: s.total_value || 0,
  }));

  const pipelineValue = pipeline.reduce((s, p) => s + (p.total_value || 0), 0);
  const activeLeads = activePipelineStages.reduce((s, p) => s + (p.count || 0), 0);
  const upcomingTasks = summary?.tasks || [];
  const overdueReviews = summary?.compliance?.overdueReviews || 0;
  const advisory = summary?.advisory;
  const commissions = summary?.commissions;
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
        <StatCard label="Total Clients" value={summary?.clients.count ?? 0} icon={Users} loading={isLoading} description="Active relationships" href="/clients" />
        <StatCard label="AUM" value={formatCurrency(summary?.portfolios.totalAUM ?? 0)} icon={Briefcase} loading={isLoading} description={`${summary?.portfolios.count ?? 0} portfolios`} href="/portfolios" />
        <StatCard label="Pipeline Value" value={formatCurrency(pipelineValue)} icon={Target} loading={isLoading} description={`${activeLeads} active leads`} href="/crm" />
        <StatCard label="Revenue" value={formatCurrency(commissions?.totalReceived || 0)} icon={DollarSign} loading={isLoading} description={`${formatCurrency(commissions?.totalExpected || 0)} expected`} href="/commissions" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        <PipelineChart data={pipelineData} />
        <RevenueChart byType={commissions?.byType} />
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
                <Badge variant="outline">{summary?.compliance?.pendingReviews || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Open Conflicts</span>
                <Badge variant="outline">{summary?.compliance?.openConflicts || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Upcoming Returns</span>
                <Badge variant="outline">{summary?.compliance?.upcomingReturns || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Due in 30 Days</span>
                <Badge variant={summary?.compliance?.reviewsDue30Days ? 'default' : 'secondary'}>{summary?.compliance?.reviewsDue30Days || 0}</Badge>
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
        <StatCard label="Screened Funds" value={summary?.funds.count ?? 0} icon={TrendingUp} loading={isLoading} description="ESG & faith-screened" href="/funds" />
        <StatCard label="Pending Advisory" value={pendingAdvisory} icon={Brain} description="Awaiting review" href="/advisory" />
        <StatCard label="Compliance Score" value={overdueReviews === 0 ? 'Good' : 'Attention'} icon={Shield} description={overdueReviews > 0 ? `${overdueReviews} overdue` : 'All reviews current'} href="/compliance/dashboard" />
        <StatCard label="VAT Collected" value={formatCurrency(commissions?.totalVAT || 0)} icon={DollarSign} description="15% SA VAT" href="/commissions" />
      </div>
    </div>
  );
}
