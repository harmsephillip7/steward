'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useFunds, useAiScreeningStatus, fundKeys } from '@/lib/hooks/use-funds';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { TrendingUp, Search, AlertTriangle, CheckCircle, Sparkles, RefreshCw } from 'lucide-react';

export default function FundsPage() {
  const { data: funds, isLoading } = useFunds();
  const { data: aiStatus } = useAiScreeningStatus();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  // Build a quick lookup map: fund_id → ai_flags count
  const flagsByFund = new Map<string, number>(
    aiStatus?.map((s) => [s.fund_id, s.ai_flags]) ?? [],
  );

  const screenAll = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/ai-screening/all');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: fundKeys.all });
      queryClient.invalidateQueries({ queryKey: fundKeys.aiStatus });
      const { total_flags_created, total_holdings_analysed, funds_processed } = data;
      toast.success(
        `AI screen complete — ${funds_processed} funds, ${total_holdings_analysed} holdings analysed, ${total_flags_created} flag${total_flags_created !== 1 ? 's' : ''} found`,
      );
    },
    onError: () => toast.error('AI screen failed. Check your OpenAI API key and API server logs.'),
  });

  const filtered = funds?.filter((f) => {
    const q = search.toLowerCase();
    return f.name.toLowerCase().includes(q) || (f.isin || '').toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Funds</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {funds?.length ?? 0} faith & ESG screened funds
          </p>
        </div>
        <Button
          onClick={() => screenAll.mutate()}
          disabled={screenAll.isPending}
          variant="outline"
          className="gap-2"
        >
          {screenAll.isPending ? (
            <><RefreshCw className="h-4 w-4 animate-spin" /> Screening all funds…</>
          ) : (
            <><Sparkles className="h-4 w-4" /> Screen all funds</>
          )}
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
        <Input placeholder="Search by name or ISIN..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : filtered?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="font-semibold text-foreground">No funds found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {search ? 'Try a different search.' : 'Fund data is loaded via the ingestion service.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fund Name</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Asset Class</TableHead>
                <TableHead>TER</TableHead>
                <TableHead>Christian Screen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((fund) => {
                const flagCount = flagsByFund.get(fund.id) ?? null;
                return (
                  <TableRow
                    key={fund.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/funds/${fund.id}`)}
                  >
                    <TableCell className="font-medium">{fund.name}</TableCell>
                    <TableCell className="text-muted-foreground">{fund.provider || '—'}</TableCell>
                    <TableCell>
                      {fund.asset_class ? <Badge variant="outline">{fund.asset_class}</Badge> : <span className="text-muted-foreground/70">—</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {fund.ter != null ? `${parseFloat(fund.ter).toFixed(2)}%` : '—'}
                    </TableCell>
                    <TableCell>
                      {flagCount === null ? (
                        <span className="text-muted-foreground/70 text-xs">Not screened</span>
                      ) : flagCount === 0 ? (
                        <span className="inline-flex items-center gap-1 text-green-700 text-xs font-medium">
                          <CheckCircle className="h-3.5 w-3.5" /> Clean
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 text-xs font-medium">
                          <AlertTriangle className="h-3 w-3" />
                          {flagCount} flag{flagCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
