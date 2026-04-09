'use client';

import { useClients } from '@/lib/hooks/use-clients';
import { usePortfolios } from '@/lib/hooks/use-portfolios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText, TrendingUp, Download } from 'lucide-react';

const reportTypes = [
  {
    title: 'Portfolio Report',
    description: 'Comprehensive portfolio performance and holdings analysis with ESG scores.',
    icon: TrendingUp,
    action: 'Generate',
    disabled: false,
  },
  {
    title: 'Client Statement',
    description: 'Quarterly or annual client statement with transaction history.',
    icon: FileText,
    action: 'Generate',
    disabled: false,
  },
  {
    title: 'Compliance Report',
    description: 'FICA/FAIS compliance status report for regulatory submissions.',
    icon: BarChart3,
    action: 'Generate',
    disabled: false,
  },
];

export default function ReportsPage() {
  const { data: clients } = useClients();
  const { data: portfolios } = usePortfolios();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Generate and export advisory reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{clients?.length ?? 0}</div>
            <p className="text-sm text-muted-foreground mt-1">Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{portfolios?.length ?? 0}</div>
            <p className="text-sm text-muted-foreground mt-1">Portfolios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">—</div>
            <p className="text-sm text-muted-foreground mt-1">Reports Generated</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-base font-semibold text-gray-900 mb-3">Available Reports</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.title} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-sm">{report.title}</CardTitle>
                </div>
                <CardDescription className="text-xs">{report.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <Button size="sm" className="w-full" disabled={report.disabled}>
                  <Download className="mr-2 h-3.5 w-3.5" />
                  {report.action}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
