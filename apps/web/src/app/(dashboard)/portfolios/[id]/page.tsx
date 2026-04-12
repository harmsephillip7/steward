'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useScreenPortfolio, useScreeningHistory, useFindReplacements, type PortfolioScreeningResult, type ReplacementSuggestion } from '@/lib/hooks/use-screening';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ArrowLeft, Shield, ShieldCheck, ShieldAlert, RefreshCw, ArrowRightLeft, Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PortfolioFund {
  id: string;
  fund_id: string;
  allocation_pct: string | number;
  value: string | number | null;
  fund: {
    id: string;
    name: string;
    isin?: string;
    asset_class?: string;
    region?: string;
    ter?: string;
    holdings?: { id: string; company_name: string; weight_pct: string; compromise_flags?: any[] }[];
  };
}

interface PortfolioDetail {
  id: string;
  name: string;
  client_id: string;
  total_value: string | number;
  currency: string;
  created_at: string;
  portfolio_funds: PortfolioFund[];
  screening_results: any[];
}

function formatCurrency(value: string | number, currency = 'ZAR') {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n || 0);
}

export default function PortfolioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [screeningResult, setScreeningResult] = useState<PortfolioScreeningResult | null>(null);
  const [replacements, setReplacements] = useState<ReplacementSuggestion[]>([]);
  const [screeningMode, setScreeningMode] = useState<'strict' | 'weighted'>('weighted');

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['portfolios', id],
    queryFn: async () => {
      const { data } = await api.get<PortfolioDetail>(`/portfolios/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const { data: history } = useScreeningHistory(id);
  const screenMutation = useScreenPortfolio();
  const replacementsMutation = useFindReplacements();

  async function handleScreen() {
    const result = await screenMutation.mutateAsync({ portfolioId: id, mode: screeningMode });
    setScreeningResult(result);
    setReplacements([]);
  }

  async function handleReplacements() {
    if (!screeningResult || !history?.[0]) return;
    const latestResultId = history[0].id;
    const suggestions = await replacementsMutation.mutateAsync({
      portfolioId: id,
      screeningResultId: latestResultId,
    });
    setReplacements(suggestions);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Portfolio not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/portfolios"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> All portfolios
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{portfolio.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {formatCurrency(portfolio.total_value, portfolio.currency)} &middot; {portfolio.portfolio_funds.length} funds
          </p>
        </div>
        <Badge variant="secondary">{portfolio.currency}</Badge>
      </div>

      {/* Fund Allocation Table */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Briefcase className="h-4 w-4" /> Fund Allocations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {portfolio.portfolio_funds.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-gray-500">No funds allocated.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fund</TableHead>
                  <TableHead>ISIN</TableHead>
                  <TableHead>Asset Class</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>TER</TableHead>
                  <TableHead className="text-right">Allocation</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolio.portfolio_funds.map((pf) => (
                  <TableRow key={pf.id}>
                    <TableCell className="font-medium">{pf.fund.name}</TableCell>
                    <TableCell className="text-gray-500 font-mono text-xs">{pf.fund.isin ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs">
                        {pf.fund.asset_class?.replace(/_/g, ' ') ?? '—'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 uppercase text-xs">{pf.fund.region ?? '—'}</TableCell>
                    <TableCell className="text-gray-500">{pf.fund.ter ? `${Number(pf.fund.ter).toFixed(2)}%` : '—'}</TableCell>
                    <TableCell className="text-right font-medium">{Number(pf.allocation_pct).toFixed(1)}%</TableCell>
                    <TableCell className="text-right font-mono">
                      {pf.value ? formatCurrency(pf.value, portfolio.currency) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Screening Controls */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Shield className="h-4 w-4" /> Values Screening
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={screeningMode === 'weighted' ? 'default' : 'outline'}
                onClick={() => setScreeningMode('weighted')}
              >
                Weighted
              </Button>
              <Button
                size="sm"
                variant={screeningMode === 'strict' ? 'default' : 'outline'}
                onClick={() => setScreeningMode('strict')}
              >
                Strict
              </Button>
            </div>
            <Button onClick={handleScreen} disabled={screenMutation.isPending}>
              <RefreshCw className={cn('mr-2 h-4 w-4', screenMutation.isPending && 'animate-spin')} />
              {screenMutation.isPending ? 'Screening...' : 'Run Screening'}
            </Button>
          </div>

          {/* Screening Result */}
          {screeningResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <ShieldCheck className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-700">{screeningResult.clean_pct.toFixed(1)}%</p>
                  <p className="text-xs text-green-600">Clean</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <ShieldAlert className="h-6 w-6 text-red-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-red-700">{screeningResult.compromised_pct.toFixed(1)}%</p>
                  <p className="text-xs text-red-600">Compromised</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-700 capitalize">{screeningResult.mode}</p>
                  <p className="text-xs text-gray-500">Mode</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-700">
                    {screeningResult.passed_strict_mode ? (
                      <span className="text-green-600">Pass</span>
                    ) : (
                      <span className="text-red-600">Fail</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">Strict Mode</p>
                </div>
              </div>

              {/* Category exposure */}
              {screeningResult.by_category.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Category Exposure</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Exposure</TableHead>
                        <TableHead>Affected Funds</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {screeningResult.by_category.map((cat) => (
                        <TableRow key={cat.category}>
                          <TableCell className="capitalize font-medium">{cat.category.replace(/_/g, ' ')}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-red-500 rounded-full"
                                  style={{ width: `${Math.min(100, cat.exposure_pct)}%` }}
                                />
                              </div>
                              <span className="text-sm">{cat.exposure_pct.toFixed(2)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{cat.affected_funds_count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Per-fund results */}
              {screeningResult.fund_results.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Fund Results</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fund</TableHead>
                        <TableHead>Clean %</TableHead>
                        <TableHead>Compromised %</TableHead>
                        <TableHead>Flagged Holdings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {screeningResult.fund_results.map((fr) => (
                        <TableRow key={fr.fund_id}>
                          <TableCell className="font-medium">{fr.fund_name}</TableCell>
                          <TableCell className="text-green-600 font-medium">{fr.clean_pct.toFixed(1)}%</TableCell>
                          <TableCell className="text-red-600 font-medium">{fr.compromised_pct.toFixed(1)}%</TableCell>
                          <TableCell>{fr.flagged_holdings_count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Replacement suggestions */}
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleReplacements} disabled={replacementsMutation.isPending}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  {replacementsMutation.isPending ? 'Finding...' : 'Find Replacement Funds'}
                </Button>
              </div>

              {replacements.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Replacement Suggestions</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Original Fund</TableHead>
                        <TableHead>Suggested Fund</TableHead>
                        <TableHead>Similarity</TableHead>
                        <TableHead>Exposure Reduction</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {replacements.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.original_fund?.name ?? r.original_fund_id}</TableCell>
                          <TableCell className="text-primary font-medium">{r.suggested_fund?.name ?? r.suggested_fund_id}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{(r.similarity_score * 100).toFixed(0)}%</Badge>
                          </TableCell>
                          <TableCell className="text-green-600">{r.exposure_reduction_pct.toFixed(1)}%</TableCell>
                          <TableCell className="text-sm text-gray-500 max-w-xs truncate">{r.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Screening History */}
      {history && history.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Screening History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Clean %</TableHead>
                  <TableHead>Compromised %</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="text-gray-500">
                      {new Date(h.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{h.mode}</Badge></TableCell>
                    <TableCell className="text-green-600 font-medium">{Number(h.clean_pct).toFixed(1)}%</TableCell>
                    <TableCell className="text-red-600 font-medium">{Number(h.compromised_pct).toFixed(1)}%</TableCell>
                    <TableCell>
                      {h.passed_strict_mode ? (
                        <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">Passed</Badge>
                      ) : (
                        <Badge variant="destructive">Failed</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
