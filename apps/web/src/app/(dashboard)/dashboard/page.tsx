'use client';

import { useClients } from '@/lib/hooks/use-clients';
import { useFunds } from '@/lib/hooks/use-funds';
import { usePortfolios } from '@/lib/hooks/use-portfolios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Briefcase, TrendingUp, Shield } from 'lucide-react';

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  description,
}: {
  label: string;
  value: string | number;
  icon: React.FC<{ className?: string }>;
  loading?: boolean;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-3xl font-bold">{value}</div>
        )}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: clients, isLoading: loadingClients } = useClients();
  const { data: funds, isLoading: loadingFunds } = useFunds();
  const { data: portfolios, isLoading: loadingPortfolios } = usePortfolios();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your advisory practice</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Clients"
          value={clients?.length ?? 0}
          icon={Users}
          loading={loadingClients}
          description="Active client relationships"
        />
        <StatCard
          label="Portfolios"
          value={portfolios?.length ?? 0}
          icon={Briefcase}
          loading={loadingPortfolios}
          description="Managed portfolios"
        />
        <StatCard
          label="Screened Funds"
          value={funds?.length ?? 0}
          icon={TrendingUp}
          loading={loadingFunds}
          description="ESG & faith-screened"
        />
        <StatCard
          label="Compliance"
          value="—"
          icon={Shield}
          description="Pending reviews"
        />
      </div>

      {!loadingClients && clients?.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Users className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="font-semibold text-gray-900">No clients yet</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">
              Add your first client to get started with portfolio management and financial planning.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
