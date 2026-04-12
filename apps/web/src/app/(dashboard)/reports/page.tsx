'use client';

import { useState } from 'react';
import { useClients } from '@/lib/hooks/use-clients';
import { useClientPortfolios } from '@/lib/hooks/use-portfolios';
import { useScreenPortfolio } from '@/lib/hooks/use-screening';
import { useGeneratePortfolioReport } from '@/lib/hooks/use-reports';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { BarChart3, FileText, TrendingUp, Download, Eye } from 'lucide-react';

export default function ReportsPage() {
  const { data: clients } = useClients();
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedPortfolioId, setSelectedPortfolioId] = useState('');
  const [open, setOpen] = useState(false);
  const [reportHtml, setReportHtml] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data: portfolios } = useClientPortfolios(selectedClientId);
  const screenMutation = useScreenPortfolio();
  const reportMutation = useGeneratePortfolioReport();

  const selectedClient = clients?.find((c) => c.id === selectedClientId);

  async function handleGenerateReport() {
    if (!selectedPortfolioId || !selectedClient) return;

    // Run a screening first to get data
    const screening = await screenMutation.mutateAsync({
      portfolioId: selectedPortfolioId,
      mode: 'weighted',
    });

    // Generate report
    const result = await reportMutation.mutateAsync({
      advisorName: 'Advisor',
      firmName: 'Steward Advisory',
      clientName: `${selectedClient.first_name} ${selectedClient.last_name}`,
      date: new Date().toLocaleDateString('en-ZA'),
      screening,
    });

    setReportHtml(result.html);
    setPreviewOpen(true);
    setOpen(false);
  }

  function handleDownloadHtml() {
    if (!reportHtml) return;
    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-report-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const reportTypes = [
    {
      title: 'Portfolio Screening Report',
      description: 'Values-based screening analysis with category exposures and clean/compromised breakdown.',
      icon: TrendingUp,
      action: 'Generate',
      onClick: () => setOpen(true),
    },
    {
      title: 'Client Statement',
      description: 'Quarterly or annual client statement with transaction history.',
      icon: FileText,
      action: 'Coming Soon',
      disabled: true,
    },
    {
      title: 'Compliance Report',
      description: 'FICA/FAIS compliance status report for regulatory submissions.',
      icon: BarChart3,
      action: 'Coming Soon',
      disabled: true,
    },
  ];

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
                <Button
                  size="sm"
                  className="w-full"
                  disabled={report.disabled}
                  onClick={report.onClick}
                >
                  <Download className="mr-2 h-3.5 w-3.5" />
                  {report.action}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Generate Report Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Generate Portfolio Report</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Client</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedClientId}
                onChange={(e) => { setSelectedClientId(e.target.value); setSelectedPortfolioId(''); }}
              >
                <option value="">Select a client...</option>
                {clients?.map((c) => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                ))}
              </select>
            </div>
            {selectedClientId && (
              <div className="space-y-1.5">
                <Label>Portfolio</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={selectedPortfolioId}
                  onChange={(e) => setSelectedPortfolioId(e.target.value)}
                >
                  <option value="">Select a portfolio...</option>
                  {portfolios?.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={handleGenerateReport}
              disabled={!selectedPortfolioId || screenMutation.isPending || reportMutation.isPending}
            >
              {screenMutation.isPending || reportMutation.isPending ? 'Generating...' : 'Generate Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Preview</DialogTitle>
          </DialogHeader>
          {reportHtml && (
            <div
              className="border rounded-lg overflow-hidden"
              dangerouslySetInnerHTML={{ __html: reportHtml }}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button onClick={handleDownloadHtml}>
              <Download className="mr-2 h-4 w-4" /> Download HTML
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
