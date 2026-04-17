'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useFund, useFundHoldings, fundKeys } from '@/lib/hooks/use-funds';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, AlertTriangle, Globe, Sparkles, RefreshCw } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

interface CompromiseFlag {
  id: string;
  holding_id: string;
  category: string;
  confidence_score: string;
  flagged_by: string;
  notes: string;
}

interface Holding {
  id: string;
  fund_id: string;
  company_name: string;
  isin?: string;
  weight_pct: string;
  sector?: string;
  country?: string;
  is_fund: boolean;
  compromise_flags: CompromiseFlag[];
}

const categoryColors: Record<string, string> = {
  alcohol: 'bg-amber-50 text-amber-700 border-amber-200',
  tobacco: 'bg-amber-50 text-amber-700 border-amber-200',
  gambling: 'bg-red-50 text-red-700 border-red-200',
  weapons: 'bg-red-50 text-red-700 border-red-200',
  adult_entertainment: 'bg-red-50 text-red-700 border-red-200',
  default: 'bg-orange-50 text-orange-700 border-orange-200',
};

function assetClassLabel(ac?: string) {
  const map: Record<string, string> = {
    equity: 'Equity',
    multi_asset: 'Multi-Asset',
    fixed_income: 'Fixed Income',
    money_market: 'Money Market',
    property: 'Property',
    global_equity: 'Global Equity',
    alternative: 'Alternative',
  };
  return ac ? (map[ac] ?? ac) : null;
}

export default function FundDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: fund, isLoading: loadingFund } = useFund(id);
  const { data: holdings, isLoading: loadingHoldings } = useFundHoldings(id);

  const screenFund = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/ai-screening/fund/${id}`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: fundKeys.holdings(id) });
      queryClient.invalidateQueries({ queryKey: fundKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: fundKeys.aiStatus });
      const { flags_created, holdings_analysed } = data;
      if (flags_created > 0) {
        toast.warning(
          `AI screen complete — ${flags_created} compromise flag${flags_created !== 1 ? 's' : ''} found across ${holdings_analysed} holdings`,
        );
      } else {
        toast.success(`AI screen complete — all ${holdings_analysed} holdings are clean`);
      }
    },
    onError: () => toast.error('AI screen failed. Check your OpenAI API key.'),
  });

  const flaggedHoldings = (holdings as Holding[] | undefined)?.filter(
    (h) => h.compromise_flags.length > 0,
  ) ?? [];

  if (loadingFund) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!fund) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Fund not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{fund.name}</h1>
          {fund.isin && (
            <p className="text-sm font-mono text-gray-500 mt-1">{fund.isin}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {flaggedHoldings.length > 0 && (
            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4" />
              {flaggedHoldings.length} compromise flag{flaggedHoldings.length !== 1 ? 's' : ''}
            </div>
          )}
          <Button
            onClick={() => screenFund.mutate()}
            disabled={screenFund.isPending}
            variant="outline"
            className="gap-2"
          >
            {screenFund.isPending ? (
              <><RefreshCw className="h-4 w-4 animate-spin" /> Screening…</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Run AI Screen</>
            )}
          </Button>
        </div>
      </div>

      {/* Fund metadata */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Fund Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Provider</p>
              <p className="font-medium mt-0.5">{fund.provider || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Asset Class</p>
              <div className="mt-0.5">
                {fund.asset_class ? (
                  <Badge variant="outline">{assetClassLabel(fund.asset_class)}</Badge>
                ) : '—'}
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Region</p>
              <p className="mt-0.5 capitalize flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-gray-400" />
                {fund.region?.toUpperCase() || '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">TER</p>
              <p className="font-mono mt-0.5">
                {fund.ter != null ? `${parseFloat(fund.ter).toFixed(2)}%` : '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Benchmark</p>
              <p className="mt-0.5">{fund.benchmark || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Inception Date</p>
              <p className="mt-0.5">
                {fund.inception_date
                  ? new Date(fund.inception_date).toLocaleDateString('en-ZA', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })
                  : '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Christian screen summary */}
      {flaggedHoldings.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Christian Screen — Compromise Holdings ({flaggedHoldings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Flagged By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flaggedHoldings.map((holding) =>
                  holding.compromise_flags.map((flag) => (
                    <TableRow key={flag.id} className="bg-amber-50/50">
                      <TableCell className="font-medium">{holding.company_name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize ${categoryColors[flag.category] ?? categoryColors.default}`}
                        >
                          {flag.category.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {parseFloat(holding.weight_pct).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-sm">
                        {Math.round(parseFloat(flag.confidence_score) * 100)}%
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm capitalize">{flag.flagged_by}</TableCell>
                    </TableRow>
                  )),
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All holdings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Holdings {holdings ? `(${(holdings as Holding[]).length})` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingHoldings ? (
            <div className="space-y-2 p-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : !(holdings as Holding[])?.length ? (
            <div className="px-6 py-8 text-center text-sm text-gray-500">
              No holdings data available for this fund.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>ISIN</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Weight</TableHead>
                  <TableHead>Screen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(holdings as Holding[])
                  ?.sort((a, b) => parseFloat(b.weight_pct) - parseFloat(a.weight_pct))
                  .map((holding) => (
                    <TableRow
                      key={holding.id}
                      className={holding.compromise_flags.length > 0 ? 'bg-amber-50/30' : undefined}
                    >
                      <TableCell className="font-medium">{holding.company_name}</TableCell>
                      <TableCell className="font-mono text-xs text-gray-500">{holding.isin || '—'}</TableCell>
                      <TableCell className="text-gray-500">{holding.sector || '—'}</TableCell>
                      <TableCell className="text-gray-500">{holding.country || '—'}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {parseFloat(holding.weight_pct).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        {holding.compromise_flags.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {holding.compromise_flags.map((f) => (
                              <Badge
                                key={f.id}
                                variant="outline"
                                className={`text-xs capitalize ${categoryColors[f.category] ?? categoryColors.default}`}
                              >
                                {f.category.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-green-600 text-xs font-medium">✓ Clean</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
