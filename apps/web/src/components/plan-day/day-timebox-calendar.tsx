'use client';

import * as React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { AlertTriangle, Inbox, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarTaskBlock } from '@/components/calendar/calendar-task-block';
import {
  CALENDAR_HOURS,
  CALENDAR_HOUR_START,
  CALENDAR_HOUR_END,
  CALENDAR_SLOT_HEIGHT_PX,
  CalendarEventLike,
  CalendarTaskLike,
  formatHourLabel,
  getEventLayoutPx,
  getTaskDurationMinutes,
  getTaskHeightPx,
  timeToMinutes,
} from '@/lib/calendar-utils';

export interface TimeboxUpdate {
  startTime?: string;
  endTime?: string;
  priority?: number;
}

interface DayTimeboxCalendarProps {
  date: Date;
  tasks: CalendarTaskLike[];
  events?: CalendarEventLike[];
  /** Persist a change. Optimistic UI is handled locally; reject to roll back. */
  onUpdate: (taskId: string, input: TimeboxUpdate) => Promise<void>;
  onTaskClick?: (task: CalendarTaskLike) => void;
}

const DURATION_PRESETS = [15, 30, 60, 90];
const PRIORITY_OPTIONS = [
  { label: 'High', value: 1, variant: 'destructive' as const },
  { label: 'Med', value: 2, variant: 'default' as const },
  { label: 'Low', value: 3, variant: 'secondary' as const },
];

const GRID_START_MIN = CALENDAR_HOUR_START * 60;
const GRID_END_MIN = (CALENDAR_HOUR_END + 1) * 60;

/** A task belongs in the timeline when its start lands inside the visible grid. */
function isScheduled(task: CalendarTaskLike): boolean {
  const start = timeToMinutes(task.startTime);
  return start >= GRID_START_MIN && start < GRID_END_MIN;
}

function minutesToTime(mins: number): string {
  const clamped = Math.max(0, Math.min(24 * 60 - 1, mins));
  return `${String(Math.floor(clamped / 60)).padStart(2, '0')}:${String(clamped % 60).padStart(2, '0')}`;
}

function taskStartsInHour(startTime: string, hour: number): boolean {
  return parseInt(startTime.split(':')[0], 10) === hour;
}

function getTaskTopWithinSlot(startTime: string, slotHour: number): number {
  const offsetMinutes = timeToMinutes(startTime) - slotHour * 60;
  return Math.max(1, (offsetMinutes / 60) * CALENDAR_SLOT_HEIGHT_PX);
}

/**
 * Greedy overlap layout: assign each scheduled task a column within its cluster
 * of mutually-overlapping tasks so conflicts render side-by-side (Sunsama-style)
 * rather than stacked on top of each other.
 */
function computeOverlapLayout(tasks: CalendarTaskLike[]): Map<string, { col: number; cols: number }> {
  const layout = new Map<string, { col: number; cols: number }>();
  const sorted = [...tasks].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );

  let cluster: CalendarTaskLike[] = [];
  let clusterEnd = -1;

  const flush = () => {
    if (cluster.length === 0) return;
    // Assign columns greedily; a task reuses the earliest free column.
    const colEnds: number[] = [];
    const colOf = new Map<string, number>();
    for (const t of cluster) {
      const s = timeToMinutes(t.startTime);
      const e = s + getTaskDurationMinutes(t);
      let placed = -1;
      for (let c = 0; c < colEnds.length; c++) {
        if (colEnds[c] <= s) {
          colEnds[c] = e;
          placed = c;
          break;
        }
      }
      if (placed === -1) {
        colEnds.push(e);
        placed = colEnds.length - 1;
      }
      colOf.set(t.id, placed);
    }
    const cols = colEnds.length;
    for (const t of cluster) {
      layout.set(t.id, { col: colOf.get(t.id) ?? 0, cols });
    }
    cluster = [];
    clusterEnd = -1;
  };

  for (const t of sorted) {
    const s = timeToMinutes(t.startTime);
    const e = s + getTaskDurationMinutes(t);
    if (cluster.length > 0 && s >= clusterEnd) flush();
    cluster.push(t);
    clusterEnd = Math.max(clusterEnd, e);
  }
  flush();
  return layout;
}

export function DayTimeboxCalendar({
  date,
  tasks,
  events = [],
  onUpdate,
  onTaskClick,
}: DayTimeboxCalendarProps) {
  const [optimistic, setOptimistic] = React.useState(tasks);
  const [isDragging, setIsDragging] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setOptimistic(tasks);
  }, [tasks]);

  const activeTasks = React.useMemo(
    () => optimistic.filter((t) => !t.parentTaskId),
    [optimistic],
  );
  const unscheduled = React.useMemo(
    () => activeTasks.filter((t) => !isScheduled(t)),
    [activeTasks],
  );
  const scheduled = React.useMemo(
    () => activeTasks.filter((t) => isScheduled(t)),
    [activeTasks],
  );
  const overlapLayout = React.useMemo(() => computeOverlapLayout(scheduled), [scheduled]);

  const dayEvents = React.useMemo(
    () => events.filter((e) => !e.isAllDay),
    [events],
  );

  const patchLocal = React.useCallback((taskId: string, patch: Partial<CalendarTaskLike>) => {
    setOptimistic((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t)));
  }, []);

  const persist = React.useCallback(
    async (taskId: string, input: TimeboxUpdate, patch: Partial<CalendarTaskLike>, okMsg?: string) => {
      const snapshot = optimistic;
      patchLocal(taskId, patch);
      try {
        await onUpdate(taskId, input);
        if (okMsg) toast.success(okMsg);
      } catch (err) {
        setOptimistic(snapshot);
        console.error('Timebox update failed:', err);
        toast.error('Failed to update task');
      }
    },
    [optimistic, onUpdate, patchLocal],
  );

  const scheduleAt = React.useCallback(
    (task: CalendarTaskLike, startMinutes: number) => {
      const duration = getTaskDurationMinutes(task);
      const startTime = minutesToTime(startMinutes);
      const endTime = minutesToTime(startMinutes + duration);
      void persist(
        task.id,
        { startTime, endTime },
        { startTime, endTime },
        `Timeboxed to ${startTime}`,
      );
    },
    [persist],
  );

  const handleDragEnd = React.useCallback(
    (result: DropResult) => {
      setIsDragging(false);
      const { draggableId, destination } = result;
      if (!destination) return;

      const task = activeTasks.find((t) => t.id === draggableId);
      if (!task) return;

      if (destination.droppableId === 'unscheduled') {
        if (!isScheduled(task)) return; // already parked
        const duration = getTaskDurationMinutes(task);
        // Park before the grid so it drops back into the unscheduled pool.
        void persist(
          task.id,
          { startTime: '00:00', endTime: minutesToTime(duration) },
          { startTime: '00:00', endTime: minutesToTime(duration) },
          'Moved to unscheduled',
        );
        return;
      }

      const parts = destination.droppableId.split('-');
      if (parts[0] !== 'tslot') return;
      const hour = parseInt(parts[1], 10);
      if (Number.isNaN(hour)) return;
      scheduleAt(task, hour * 60);
    },
    [activeTasks, persist, scheduleAt],
  );

  const setDuration = React.useCallback(
    (task: CalendarTaskLike, durationMinutes: number) => {
      const startMin = timeToMinutes(task.startTime);
      const endTime = minutesToTime(startMin + durationMinutes);
      void persist(
        task.id,
        { startTime: task.startTime, endTime },
        { startTime: task.startTime, endTime, durationMinutes },
      );
    },
    [persist],
  );

  const setPriority = React.useCallback(
    (task: CalendarTaskLike, priority: number) => {
      void persist(task.id, { priority }, { priority });
    },
    [persist],
  );

  const selectedTask = selectedId ? activeTasks.find((t) => t.id === selectedId) ?? null : null;

  return (
    <DragDropContext onDragStart={() => setIsDragging(true)} onDragEnd={handleDragEnd}>
      <div className={cn('flex flex-col gap-3 lg:flex-row', isDragging && 'select-none')}>
        {/* ---- Unscheduled pool (top strip on mobile, sidebar on desktop) ---- */}
        <Droppable droppableId="unscheduled">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                'shrink-0 rounded-[12px] border border-border p-2.5 transition-colors lg:w-64',
                'flex max-h-40 flex-col overflow-auto lg:max-h-none',
                snapshot.isDraggingOver && 'bg-primary/10 ring-2 ring-primary ring-inset',
              )}
            >
              <div className="mb-2 flex items-center gap-1.5 px-0.5 text-[13px] font-medium text-muted-foreground">
                <Inbox className="h-3.5 w-3.5" />
                Unscheduled
                <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-[11px]">
                  {unscheduled.length}
                </Badge>
              </div>

              {unscheduled.length === 0 ? (
                <div className="rounded-[8px] border border-dashed border-border px-2 py-6 text-center text-[12px] text-muted-foreground">
                  Everything is timeboxed. Drag a block here to unschedule it.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {unscheduled.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(drag, dragSnap) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                          onClick={() => setSelectedId(task.id)}
                          className={cn(
                            'rounded-[9px] border border-border bg-card p-2 text-left shadow-[var(--sh-sm)]',
                            'cursor-grab active:cursor-grabbing hover:border-primary/40',
                            dragSnap.isDragging && 'cursor-grabbing shadow-xl ring-2 ring-primary/40',
                            selectedId === task.id && 'ring-2 ring-primary/40',
                          )}
                          style={drag.draggableProps.style}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{task.goal?.emoji ?? '📌'}</span>
                            <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                              {task.title}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-1 pl-6 text-[11px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {getTaskDurationMinutes(task)}m
                            {task.priority === 1 && (
                              <Badge variant="destructive" className="ml-1 h-4 px-1 text-[9px]">
                                High
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
              )}
              <div className="hidden">{provided.placeholder}</div>
            </div>
          )}
        </Droppable>

        {/* ---- Day timeline ---- */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between px-0.5">
            <div className="text-[13px] font-medium text-muted-foreground">
              {format(date, 'EEEE, MMM d')}
            </div>
            <div className="text-[12px] text-muted-foreground">
              {scheduled.length} timeboxed
            </div>
          </div>

          <div className="mp-scroll max-h-[560px] overflow-auto rounded-[14px] border border-border shadow-[var(--sh-sm)]">
            <div className="grid grid-cols-[56px_1fr]">
              {/* Hour gutter */}
              <div className="border-r border-border">
                {CALENDAR_HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-border px-2 py-1 text-right font-mono text-xs text-muted-foreground"
                    style={{ height: CALENDAR_SLOT_HEIGHT_PX }}
                  >
                    {formatHourLabel(hour)}
                  </div>
                ))}
              </div>

              {/* Day column */}
              <div className="relative">
                {/* External calendar events, painted behind tasks. */}
                {dayEvents.map((event) => {
                  const { topPx, heightPx } = getEventLayoutPx(event.start, event.end);
                  return (
                    <div
                      key={event.id}
                      className="pointer-events-none absolute left-1 right-1 z-0 overflow-hidden rounded-[6px] border-l-2 border-slate-400 bg-slate-200/70 px-1.5 py-0.5 text-[11px] text-slate-700 dark:border-slate-500 dark:bg-slate-700/50 dark:text-slate-200"
                      style={{ top: topPx, height: heightPx }}
                      title={`${event.title} (external calendar)`}
                    >
                      <div className="truncate font-medium">{event.title}</div>
                      <div className="truncate opacity-70">
                        {format(new Date(event.start), 'h:mm a')}
                      </div>
                    </div>
                  );
                })}

                {CALENDAR_HOURS.map((hour) => {
                  const slotId = `tslot-${hour}`;
                  const slotTasks = scheduled.filter((t) => taskStartsInHour(t.startTime, hour));
                  return (
                    <Droppable key={slotId} droppableId={slotId}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={cn(
                            'relative border-b border-border transition-colors',
                            snapshot.isDraggingOver
                              ? 'bg-primary/10 ring-2 ring-primary ring-inset'
                              : 'hover:bg-accent/30',
                          )}
                          style={{ height: CALENDAR_SLOT_HEIGHT_PX }}
                        >
                          <div className="hidden">{provided.placeholder}</div>

                          {slotTasks.map((task, index) => {
                            const heightPx = getTaskHeightPx(getTaskDurationMinutes(task));
                            const topPx = getTaskTopWithinSlot(task.startTime, hour);
                            const lay = overlapLayout.get(task.id) ?? { col: 0, cols: 1 };
                            const conflict = lay.cols > 1;
                            const widthPct = 100 / lay.cols;
                            return (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(drag, dragSnap) => (
                                  <div
                                    ref={drag.innerRef}
                                    {...drag.draggableProps}
                                    {...drag.dragHandleProps}
                                    onClick={() => setSelectedId(task.id)}
                                    className={cn('z-10', !dragSnap.isDragging && 'absolute', dragSnap.isDragging && 'cursor-grabbing opacity-90')}
                                    style={
                                      dragSnap.isDragging
                                        ? { ...drag.draggableProps.style, height: heightPx }
                                        : {
                                            ...drag.draggableProps.style,
                                            top: topPx,
                                            height: heightPx,
                                            left: `calc(${lay.col * widthPct}% + 2px)`,
                                            width: `calc(${widthPct}% - 4px)`,
                                          }
                                    }
                                  >
                                    <div className="relative h-full">
                                      {conflict && (
                                        <span
                                          className="absolute -top-1 -right-1 z-20 rounded-full bg-amber-500 p-0.5 text-white shadow"
                                          title="Overlaps another task"
                                        >
                                          <AlertTriangle className="h-2.5 w-2.5" />
                                        </span>
                                      )}
                                      <CalendarTaskBlock
                                        task={task}
                                        heightPx={heightPx}
                                        isDragging={dragSnap.isDragging}
                                        onClick={(t) => {
                                          setSelectedId(t.id);
                                          onTaskClick?.(t);
                                        }}
                                        className={conflict ? 'ring-1 ring-amber-400' : undefined}
                                      />
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                        </div>
                      )}
                    </Droppable>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ---- Inline fine-tune for the selected block (secondary to DnD) ---- */}
          {selectedTask && (
            <div className="mt-2 flex flex-wrap items-center gap-2 rounded-[10px] border border-border bg-card p-2.5">
              <span className="max-w-[40%] truncate text-[13px] font-medium">
                {selectedTask.title}
              </span>
              <span className="text-[11px] text-muted-foreground">Duration</span>
              {DURATION_PRESETS.map((d) => (
                <Button
                  key={d}
                  size="sm"
                  variant={getTaskDurationMinutes(selectedTask) === d ? 'secondary' : 'outline'}
                  className="h-7 px-2 text-xs"
                  onClick={() => setDuration(selectedTask, d)}
                >
                  {d}m
                </Button>
              ))}
              <span className="ml-2 text-[11px] text-muted-foreground">Priority</span>
              {PRIORITY_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  size="sm"
                  variant={(selectedTask.priority || 2) === opt.value ? opt.variant : 'outline'}
                  className="h-7 px-2 text-xs"
                  onClick={() => setPriority(selectedTask, opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </DragDropContext>
  );
}
