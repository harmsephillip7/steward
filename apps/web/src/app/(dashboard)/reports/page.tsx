'use client';

import { useState } from 'react';
import { useClients } from '@/lib/hooks/use-clients';
import { useClientPortfolios, usePortfolios } from '@/lib/hooks/use-portfolios';
import { useScreenPortfolio } from '@/lib/hooks/use-screening';
import { useGeneratePortfolioReport } from '@/lib/hooks/use-reports';
import { useCommissions, useCommissionSummary } from '@/lib/hooks/use-commissions';
import { useComplianceReviews } from '@/lib/hooks/use-enhanced-compliance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, FileText, TrendingUp, Download, Eye, FileSpreadsheet, Shield, DollarSign, Users } from 'lucide-react';
import { exportToCsv, formatCurrency } from '@/lib/format';

export default function ReportsPage() {
  const { data: clients = [] } = useClients();
  const { data: allPortfolios = [] } = usePortfolios();
  const { data: commissions = [] } = useCommissions();
  const { data: commSummary } = useCommissionSummary();
  const { data: reviews = [] } = useComplianceReviews();

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
    const screening = await screenMutation.mutateAsync({ portfolioId: selectedPortfolioId, mode: 'weighted' });
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
    a.href = url; a.download = `portfolio-report-${new Date().toISOString().slice(0, 10)}.html`; a.click();
    URL.revokeObjectURL(url);
  }

  function exportClientsCsv() {
    exportToCsv('clients-report', clients.map((c: any) => ({
      Name: `${c.first_name} ${c.last_name}`, Email: c.email || '', Phone: c.phone || '',
      'ID Number': c.id_number || '', 'Tax Number': c.tax_number || '',
      'Risk Profile': c.risk_profile || '', 'Marital Status': c.marital_status || '',
      'Date of Birth': c.date_of_birth || '',
    })));
  }

  function exportCommissionsCsv() {
    exportToCsv('commissions-report', commissions.map((c: any) => ({
      Product: c.product_name || '', Type: c.commission_type || '',
      Amount: c.amount, VAT: c.vat_amount, Net: c.net_amount,
      Status: c.status, 'Effective Date': c.effective_date || '',
      'Received Date': c.received_date || '',
    })));
  }

  function exportComplianceCsv() {
    exportToCsv('compliance-report', reviews.map((r: any) => ({
      Client: r.client?.first_name ? `${r.client.first_name} ${r.client.last_name}` : r.client_id,
      Type: r.review_type, Status: r.status,
      'Review Date': r.review_date || '', 'Next Review': r.next_review_date || '',
      Findings: r.findings || '', 'Completed At': r.completed_at || '',
    })));
  }

  function exportPortfoliosCsv() {
    exportToCsv('portfolios-report', allPortfolios.map((p: any) => ({
      Name: p.name, 'Investment Approach': p.investment_approach || '',
      'Risk Level': p.risk_level || '', 'Total Value': p.total_value || 0,
      'Inception Date': p.inception_date || '',
      Client: p.client ? `${p.client.first_name} ${p.client.last_name}` : '',
    })));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate and export advisory reports</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{clients.length}</div><p className="text-sm text-muted-foreground">Clients</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{allPortfolios.length}</div><p className="text-sm text-muted-foreground">Portfolios</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{commissions.length}</div><p className="text-sm text-muted-foreground">Commission Records</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{reviews.length}</div><p className="text-sm text-muted-foreground">Compliance Reviews</p></CardContent></Card>
      </div>

      <Tabs defaultValue="generate">
        <TabsList>
          <TabsTrigger value="generate">Generate Reports</TabsTrigger>
          <TabsTrigger value="export">CSV Exports</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10"><TrendingUp className="h-4 w-4 text-primary" /></div>
                  <CardTitle className="text-sm">Portfolio Screening</CardTitle>
                </div>
                <CardDescription className="text-xs">Values-based screening analysis of fund holdings with category breakdowns.</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-0"><Button size="sm" className="w-full" onClick={() => setOpen(true)}><Download className="mr-2 h-3.5 w-3.5" />Generate</Button></CardContent>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10"><DollarSign className="h-4 w-4 text-green-600" /></div>
                  <CardTitle className="text-sm">Revenue Report</CardTitle>
                </div>
                <CardDescription className="text-xs">Commission and fee summary with breakdown by type and status.</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-0"><Button size="sm" className="w-full" onClick={exportCommissionsCsv} disabled={commissions.length === 0}><FileSpreadsheet className="mr-2 h-3.5 w-3.5" />Export CSV</Button></CardContent>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10"><Shield className="h-4 w-4 text-orange-600" /></div>
                  <CardTitle className="text-sm">Compliance Report</CardTitle>
                </div>
                <CardDescription className="text-xs">FAIS compliance review status, overdue items, and regulatory returns.</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-0"><Button size="sm" className="w-full" onClick={exportComplianceCsv} disabled={reviews.length === 0}><FileSpreadsheet className="mr-2 h-3.5 w-3.5" />Export CSV</Button></CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="export" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Data Exports</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Client Directory</p>
                      <p className="text-xs text-muted-foreground">{clients.length} records — names, contact info, ID numbers, risk profiles</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={exportClientsCsv} disabled={clients.length === 0}>
                    <Download className="w-3.5 h-3.5 mr-1" />CSV
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Portfolio Summary</p>
                      <p className="text-xs text-muted-foreground">{allPortfolios.length} records — names, values, risk levels, inception dates</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={exportPortfoliosCsv} disabled={allPortfolios.length === 0}>
                    <Download className="w-3.5 h-3.5 mr-1" />CSV
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Commissions & Revenue</p>
                      <p className="text-xs text-muted-foreground">{commissions.length} records — amounts, VAT, statuses, dates</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={exportCommissionsCsv} disabled={commissions.length === 0}>
                    <Download className="w-3.5 h-3.5 mr-1" />CSV
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Compliance Reviews</p>
                      <p className="text-xs text-muted-foreground">{reviews.length} records — review types, statuses, dates, findings</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={exportComplianceCsv} disabled={reviews.length === 0}>
                    <Download className="w-3.5 h-3.5 mr-1" />CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
            <Button onClick={handleGenerateReport} disabled={!selectedPortfolioId || screenMutation.isPending || reportMutation.isPending}>
              {screenMutation.isPending || reportMutation.isPending ? 'Generating...' : 'Generate Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Report Preview</DialogTitle></DialogHeader>
          {reportHtml && <div className="border rounded-lg overflow-hidden" dangerouslySetInnerHTML={{ __html: reportHtml }} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button onClick={handleDownloadHtml}><Download className="mr-2 h-4 w-4" />Download HTML</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
