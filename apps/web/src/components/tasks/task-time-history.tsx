'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, Check, X, Loader2, History, Timer as TimerIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  useTaskTimeEntries,
  useUpdateTimeEntry,
  useDeleteTimeEntry,
} from '@/hooks/use-graphql';

interface TimeEntry {
  id: string;
  minutes: number;
  note?: string | null;
  source: string;
  startedAt: string;
}

interface Props {
  taskId: string;
  /** Only fetch when the panel is actually visible (lazy detail load). */
  enabled: boolean;
  /** Keep the parent's tracked-minutes total in sync after edits/deletes. */
  onTotalChanged?: (deltaMinutes: number) => void;
}

export function TaskTimeHistory({ taskId, enabled, onTotalChanged }: Props) {
  const { entries, loading, refetch } = useTaskTimeEntries(taskId, !enabled);
  const { updateTimeEntry, loading: saving } = useUpdateTimeEntry();
  const { deleteTimeEntry } = useDeleteTimeEntry();

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editMinutes, setEditMinutes] = React.useState('');
  const [editNote, setEditNote] = React.useState('');
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const startEdit = (e: TimeEntry) => {
    setEditingId(e.id);
    setEditMinutes(String(e.minutes));
    setEditNote(e.note ?? '');
  };

  const saveEdit = async (entry: TimeEntry) => {
    const minutes = parseInt(editMinutes, 10);
    if (!minutes || minutes <= 0) return;
    try {
      await updateTimeEntry({
        variables: { id: entry.id, input: { minutes, note: editNote || null } },
      });
      onTotalChanged?.(minutes - entry.minutes);
      setEditingId(null);
      await refetch();
    } catch {
      /* hook surfaces the error */
    }
  };

  const remove = async (entry: TimeEntry) => {
    setPendingId(entry.id);
    try {
      await deleteTimeEntry({ variables: { id: entry.id } });
      onTotalChanged?.(-entry.minutes);
      await refetch();
    } catch {
      /* hook surfaces the error */
    } finally {
      setPendingId(null);
    }
  };

  if (!enabled) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <History className="h-3.5 w-3.5" />
        History
        {entries.length > 0 && <span className="text-muted-foreground/70">({entries.length})</span>}
      </div>

      {loading && entries.length === 0 ? (
        <div className="py-2 text-center text-xs text-muted-foreground">
          <Loader2 className="mx-auto h-4 w-4 animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <p className="rounded-[8px] border border-dashed border-border px-2 py-3 text-center text-xs text-muted-foreground">
          No time logged yet.
        </p>
      ) : (
        <ul className="space-y-1">
          {(entries as TimeEntry[]).map((e) => {
            const isEditing = editingId === e.id;
            return (
              <li
                key={e.id}
                className="flex items-center gap-2 rounded-[8px] border border-border px-2 py-1.5 text-xs"
              >
                {isEditing ? (
                  <>
                    <Input
                      type="number"
                      min={1}
                      value={editMinutes}
                      onChange={(ev) => setEditMinutes(ev.target.value)}
                      className="h-7 w-16"
                      aria-label="Minutes"
                    />
                    <Input
                      value={editNote}
                      onChange={(ev) => setEditNote(ev.target.value)}
                      placeholder="Note (optional)"
                      className="h-7 flex-1"
                      aria-label="Note"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-green-600"
                      disabled={saving}
                      onClick={() => saveEdit(e)}
                      aria-label="Save"
                    >
                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setEditingId(null)}
                      aria-label="Cancel"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 font-medium tabular-nums',
                        'w-14',
                      )}
                    >
                      {e.source === 'timer' && <TimerIcon className="h-3 w-3 text-muted-foreground" />}
                      {e.minutes}m
                    </span>
                    <span className="text-muted-foreground">
                      {format(new Date(e.startedAt), 'MMM d, h:mm a')}
                    </span>
                    {e.note && <span className="min-w-0 flex-1 truncate">· {e.note}</span>}
                    <div className="ml-auto flex items-center gap-0.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => startEdit(e)}
                        aria-label="Edit entry"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        disabled={pendingId === e.id}
                        onClick={() => remove(e)}
                        aria-label="Delete entry"
                      >
                        {pendingId === e.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
