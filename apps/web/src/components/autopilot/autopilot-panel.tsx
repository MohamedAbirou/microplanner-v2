'use client';

import * as React from 'react';
import { Wand2, Check, X, Loader2, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useAutopilotStatus,
  useApplyAutopilotProposal,
  useDismissAutopilotProposal,
} from '@/hooks/use-graphql-extended';

interface Move {
  taskId: string;
  title: string;
  fromStart?: string | null;
  toStart: string;
  toEnd: string;
  reason: string;
}

/**
 * Today-page autopilot surface: shows a pending suggestion (with apply/dismiss)
 * and the most recent applied run as a short log. Renders nothing when autopilot
 * is disabled and there's no history.
 */
export function AutopilotPanel() {
  const { status, loading } = useAutopilotStatus();
  const { applyProposal, loading: applying } = useApplyAutopilotProposal();
  const { dismissProposal, loading: dismissing } = useDismissAutopilotProposal();

  if (loading || !status) return null;
  if (!status.enabled && (!status.recent || status.recent.length === 0)) return null;

  const pending = status.pending;
  const lastApplied = (status.recent || []).find(
    (p: any) => p.status === 'AUTO_APPLIED' || p.status === 'APPLIED',
  );

  return (
    <div className="space-y-3">
      {pending ? (
        <Card className="rounded-[14px] border-primary/30 bg-primary/[0.03] shadow-[var(--sh-sm)]">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 min-w-0">
                <Wand2 className="h-4 w-4 mt-0.5 text-primary flex-none" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{pending.summary}</p>
                  <p className="text-[13px] text-muted-foreground">
                    Autopilot suggests moving {pending.moves.length} task
                    {pending.moves.length === 1 ? '' : 's'}.
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px]">Suggested</Badge>
            </div>

            <ul className="mt-3 space-y-1.5">
              {pending.moves.slice(0, 5).map((m: Move) => (
                <li key={m.taskId} className="flex items-center gap-2 text-[13px]">
                  <span className="truncate max-w-[45%]">{m.title}</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    {m.fromStart || '—'} <ArrowRight className="h-3 w-3" /> {m.toStart}
                  </span>
                </li>
              ))}
              {pending.moves.length > 5 && (
                <li className="text-[12px] text-muted-foreground">
                  +{pending.moves.length - 5} more
                </li>
              )}
            </ul>

            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                className="h-8"
                disabled={applying}
                onClick={() => applyProposal({ variables: { id: pending.id } })}
              >
                {applying ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
                Apply
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8"
                disabled={dismissing}
                onClick={() => dismissProposal({ variables: { id: pending.id } })}
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : lastApplied ? (
        <div className="flex items-center gap-2 rounded-[10px] border border-border bg-muted/30 px-3 py-2 text-[13px] text-muted-foreground">
          <Wand2 className="h-3.5 w-3.5 flex-none" />
          <span className="truncate">{lastApplied.summary}</span>
          <Badge variant="outline" className="ml-auto text-[10px]">Autopilot</Badge>
        </div>
      ) : null}
    </div>
  );
}
