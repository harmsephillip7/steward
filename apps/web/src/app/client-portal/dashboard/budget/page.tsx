'use client';

import { useState, useRef } from 'react';
import { PiggyBank, Upload, Trash2, RefreshCw, Eye, EyeOff, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  usePortalBudget,
  useUploadStatement,
  useAnalyseBudget,
  useDeleteStatement,
  useToggleBudgetVisibility,
} from '@/lib/hooks/use-portal-budget';

// ── Types ─────────────────────────────────────────────────────────────────────

interface BlueprintEntry {
  label: string;
  target_pct: number;
  description: string;
}

interface BlueprintCategory {
  actual_amount: number;
  actual_pct: number;
  target_pct: number;
  variance_pct: number;
  status: 'on_track' | 'over' | 'under';
}

interface Analysis {
  score: number;
  score_label: string;
  strengths: string[];
  overspending_areas: string[];
  ai_advice: string;
  blueprint_comparison: Record<string, BlueprintCategory>;
  total_income_avg: number;
  total_expenses_avg: number;
  statements_analysed: number;
  streak_months: number;
  is_shared_with_advisor: boolean;
}

interface Statement {
  id: string;
  filename: string;
  statement_month: string;
  account_type: string;
  created_at: string;
}

// ── Score circle ───────────────────────────────────────────────────────────────

function ScoreCircle({ score, label }: { score: number; label: string }) {
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const dash = (score / 100) * circ;
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={130} height={130} className="-rotate-90">
        <circle cx={65} cy={65} r={radius} strokeWidth={10} stroke="#e5e7eb" fill="none" />
        <circle
          cx={65} cy={65} r={radius} strokeWidth={10}
          stroke={color} fill="none"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
      <Badge
        variant="outline"
        className="text-sm font-semibold"
        style={{ borderColor: color, color }}
      >
        {label}
      </Badge>
    </div>
  );
}

// ── Category row ──────────────────────────────────────────────────────────────

function CategoryRow({
  name,
  entry,
  actual,
}: {
  name: string;
  entry: BlueprintEntry;
  actual: BlueprintCategory | undefined;
}) {
  const a = actual ?? { actual_pct: 0, target_pct: entry.target_pct, status: 'under', variance_pct: 0, actual_amount: 0 };
  const pct = Math.min(a.actual_pct, 100);
  const targetPct = a.target_pct;
  const barColor = a.status === 'on_track' ? 'bg-green-500' : a.status === 'over' ? 'bg-red-400' : 'bg-amber-400';
  const StatusIcon = a.status === 'on_track' ? Minus : a.status === 'over' ? TrendingUp : TrendingDown;
  const statusColor = a.status === 'on_track' ? 'text-green-600' : a.status === 'over' ? 'text-red-500' : 'text-amber-500';

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-28 text-sm font-medium truncate">{entry.label}</div>
      <div className="flex-1 relative h-3 bg-muted rounded-full">
        {/* Target marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-foreground/30 rounded"
          style={{ left: `${targetPct}%` }}
        />
        {/* Actual bar */}
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="w-20 text-right text-xs text-muted-foreground">
        {a.actual_pct.toFixed(1)}% / {targetPct}%
      </div>
      <StatusIcon className={`w-4 h-4 ${statusColor}`} />
    </div>
  );
}

// ── Slot uploader ─────────────────────────────────────────────────────────────

function StatementSlot({
  slotMonth,
  existing,
  onUpload,
  onDelete,
  uploading,
  deleting,
}: {
  slotMonth: string;
  existing: Statement | undefined;
  onUpload: (file: File, month: string, accountType: string) => void;
  onDelete: (id: string) => void;
  uploading: boolean;
  deleting: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [accountType, setAccountType] = useState('cheque');

  return (
    <div className="border rounded-lg p-3 flex flex-col gap-2 bg-card">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{slotMonth}</span>
        {existing && (
          <Badge variant="secondary" className="text-xs">Uploaded</Badge>
        )}
      </div>

      {existing ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="truncate max-w-[160px]">{existing.filename}</span>
          <Button
            size="sm" variant="ghost"
            className="text-destructive hover:text-destructive"
            disabled={deleting}
            onClick={() => onDelete(existing.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Select value={accountType} onValueChange={setAccountType}>
            <SelectTrigger className="h-8 text-xs w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cheque">Cheque</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
              <SelectItem value="credit">Credit</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm" variant="outline" className="h-8 text-xs flex-1"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="w-3 h-3 mr-1" />
            {uploading ? 'Uploading…' : 'Choose PDF / CSV'}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.csv,.txt"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) { onUpload(f, slotMonth, accountType); e.target.value = ''; }
            }}
          />
        </div>
      )}
    </div>
  );
}

// ── Slots helper ──────────────────────────────────────────────────────────────

function buildLastThreeMonths(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PortalBudgetPage() {
  const { data, isLoading } = usePortalBudget();
  const uploadMutation = useUploadStatement();
  const analyseMutation = useAnalyseBudget();
  const deleteMutation = useDeleteStatement();
  const visibilityMutation = useToggleBudgetVisibility();

  const analysis: Analysis | null = data?.analysis ?? null;
  const statements: Statement[] = data?.statements ?? [];
  const blueprint: Record<string, BlueprintEntry> = data?.blueprint ?? {};

  const months = buildLastThreeMonths();

  function findStatement(month: string) {
    return statements.find(s => s.statement_month === month);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Loading your budget…
      </div>
    );
  }

  const scoreColor =
    !analysis ? '#6b7280'
    : analysis.score >= 75 ? '#22c55e'
    : analysis.score >= 50 ? '#f59e0b'
    : '#ef4444';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <PiggyBank className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Budget Analyser</h1>
        </div>

        {analysis !== null && (
          <Button
            variant="outline" size="sm"
            disabled={visibilityMutation.isPending}
            onClick={() => visibilityMutation.mutate()}
            className="flex items-center gap-1.5"
          >
            {analysis.is_shared_with_advisor ? (
              <><Eye className="w-4 h-4" /> Visible to advisor</>
            ) : (
              <><EyeOff className="w-4 h-4" /> Private</>
            )}
          </Button>
        )}
      </div>

      {/* Upload section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Bank Statements</CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload up to 3 months of statements (PDF or CSV) to get a personalised analysis.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            {months.map(month => (
              <StatementSlot
                key={month}
                slotMonth={month}
                existing={findStatement(month)}
                uploading={uploadMutation.isPending}
                deleting={deleteMutation.isPending}
                onUpload={(file, m, at) => uploadMutation.mutate({ file, statement_month: m, account_type: at })}
                onDelete={id => deleteMutation.mutate(id)}
              />
            ))}
          </div>

          <Button
            onClick={() => analyseMutation.mutate()}
            disabled={analyseMutation.isPending || statements.length === 0}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${analyseMutation.isPending ? 'animate-spin' : ''}`} />
            {analyseMutation.isPending ? 'Analysing…' : 'Analyse My Budget'}
          </Button>
        </CardContent>
      </Card>

      {/* No analysis yet */}
      {!analysis && (
        <div className="text-center py-12 text-muted-foreground">
          Upload your statements and click <strong>Analyse My Budget</strong> to see your Stewardship Score.
        </div>
      )}

      {/* Score + overview */}
      {analysis && (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Score */}
            <Card className="sm:col-span-1 flex flex-col items-center justify-center py-6">
              <p className="text-sm text-muted-foreground mb-3">Stewardship Score</p>
              <div className="relative flex flex-col items-center">
                <ScoreCircle score={analysis.score} label={analysis.score_label} />
              </div>
              {analysis.streak_months > 1 && (
                <Badge variant="secondary" className="mt-3 text-xs">
                  🔥 {analysis.streak_months}-month streak
                </Badge>
              )}
            </Card>

            {/* Income / expenses */}
            <Card className="sm:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Monthly Average</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Based on {analysis.statements_analysed} statement{analysis.statements_analysed !== 1 ? 's' : ''}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Income</span>
                  <span className="font-semibold text-green-600">
                    R {Number(analysis.total_income_avg).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Expenses</span>
                  <span className="font-semibold text-red-500">
                    R {Number(analysis.total_expenses_avg).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-sm font-medium">Net</span>
                  <span
                    className={`font-bold ${analysis.total_income_avg - analysis.total_expenses_avg >= 0 ? 'text-green-600' : 'text-red-500'}`}
                  >
                    R {(Number(analysis.total_income_avg) - Number(analysis.total_expenses_avg))
                        .toLocaleString('en-ZA', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Blueprint comparison */}
          {Object.keys(blueprint).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Biblical Blueprint Comparison</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Vertical line = target. Bar = your actual spend as % of income.
                </p>
              </CardHeader>
              <CardContent>
                {Object.entries(blueprint).map(([key, entry]) => (
                  <CategoryRow
                    key={key}
                    name={key}
                    entry={entry}
                    actual={analysis.blueprint_comparison?.[key]}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Insights */}
          <div className="grid sm:grid-cols-2 gap-4">
            {analysis.strengths?.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-600">Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 text-green-500">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {analysis.overspending_areas?.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-amber-600">Areas to Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {analysis.overspending_areas.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 text-amber-500">⚠</span>{s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* AI Advice */}
          {analysis.ai_advice && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Stewardship Advice</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-line">{analysis.ai_advice}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
