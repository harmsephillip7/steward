'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Clock, Lightbulb, Target } from 'lucide-react';
import type { StageGuidance } from '@steward/shared';

interface StageGuidancePanelProps {
  guidance: StageGuidance;
  progress: { completed: number; total: number; pct: number; completedKeys: string[] };
  timeInStageDays: number;
}

export function StageGuidancePanel({ guidance, progress, timeInStageDays }: StageGuidancePanelProps) {
  return (
    <Card className="border-primary/20 bg-primary/[0.02]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{guidance.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {timeInStageDays === 0 ? 'Today' : `${timeInStageDays}d in stage`}
            </Badge>
            <Badge className={progress.pct === 100 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-primary/10 text-primary'}>
              {progress.pct}% complete
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{guidance.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Objective */}
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Objective</p>
          <p className="text-sm">{guidance.objective}</p>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium">Stage Progress</span>
            <span className="text-xs text-muted-foreground">{progress.completed}/{progress.total} actions</span>
          </div>
          <Progress value={progress.pct} className="h-2" />
        </div>

        {/* Recommended Actions Checklist */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Recommended Actions</p>
          <div className="space-y-1.5">
            {guidance.recommended_actions.map(action => {
              const done = progress.completedKeys.includes(action.key);
              return (
                <div key={action.key} className="flex items-center gap-2 text-sm">
                  {done ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <span className={done ? 'text-muted-foreground line-through' : ''}>{action.label}</span>
                  {action.required && !done && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 ml-auto">Required</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        {guidance.tips.length > 0 && (
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
              <p className="text-xs font-medium text-yellow-800 dark:text-yellow-400">Tips</p>
            </div>
            <ul className="space-y-1">
              {guidance.tips.map((tip, i) => (
                <li key={i} className="text-xs text-yellow-800 dark:text-yellow-300/80 pl-2 border-l-2 border-yellow-300 dark:border-yellow-700">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
