'use client';

/**
 * Professional Calendar View Component
 * - FullCalendar integration with drag & drop
 * - Week/Month/Day views
 * - Task scheduling and time blocking
 * - Focus time blocks visualization
 */

import { useCallback, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useMutation } from '@apollo/client';
import { UPDATE_TASK } from '@/lib/graphql/mutations';
import { GET_TASKS } from '@/lib/graphql/queries';
import { useToast } from '@/lib/hooks/use-toast';
import { Card } from '@microplanner/ui';
import { Button } from '@microplanner/ui';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
  goal?: {
    emoji?: string;
    color?: string;
  };
  project?: {
    color?: string;
  };
}

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDateClick: (date: Date) => void;
  onCreateTask: () => void;
}

export function CalendarView({ tasks, onTaskClick, onDateClick, onCreateTask }: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'timeGridWeek' | 'timeGridDay' | 'dayGridMonth'>('timeGridWeek');

  const [updateTask] = useMutation(UPDATE_TASK, {
    refetchQueries: [{ query: GET_TASKS }],
    onCompleted: () => {
      toast({
        title: 'Task Rescheduled',
        description: 'Task has been moved successfully.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      });
    },
  });

  // Convert tasks to FullCalendar events
  const events = tasks.map((task) => ({
    id: task.id,
    title: `${task.goal?.emoji || '📌'} ${task.title}`,
    start: `${task.scheduledDate}T${task.startTime}`,
    end: `${task.scheduledDate}T${task.endTime}`,
    backgroundColor: task.project?.color || task.goal?.color || '#2563EB',
    borderColor: task.project?.color || task.goal?.color || '#2563EB',
    textColor: '#FFFFFF',
    classNames: task.isCompleted ? ['opacity-50'] : [],
    extendedProps: {
      task,
    },
  }));

  const handleEventDrop = useCallback(
    (info: any) => {
      const { event } = info;
      const task = event.extendedProps.task;

      const newDate = format(event.start, 'yyyy-MM-dd');
      const newStartTime = format(event.start, 'HH:mm');
      const newEndTime = format(event.end || event.start, 'HH:mm');

      updateTask({
        variables: {
          id: task.id,
          input: {
            scheduledDate: newDate,
            startTime: newStartTime,
            endTime: newEndTime,
          },
        },
      });
    },
    [updateTask]
  );

  const handleEventResize = useCallback(
    (info: any) => {
      const { event } = info;
      const task = event.extendedProps.task;

      const newStartTime = format(event.start, 'HH:mm');
      const newEndTime = format(event.end || event.start, 'HH:mm');

      updateTask({
        variables: {
          id: task.id,
          input: {
            startTime: newStartTime,
            endTime: newEndTime,
          },
        },
      });
    },
    [updateTask]
  );

  const handleEventClick = useCallback(
    (info: any) => {
      const task = info.event.extendedProps.task;
      onTaskClick(task);
    },
    [onTaskClick]
  );

  const handleDateClick = useCallback(
    (info: any) => {
      onDateClick(new Date(info.dateStr));
    },
    [onDateClick]
  );

  const handlePrev = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.prev();
    setCurrentDate(calendarApi?.getDate() || new Date());
  };

  const handleNext = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.next();
    setCurrentDate(calendarApi?.getDate() || new Date());
  };

  const handleToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.today();
    setCurrentDate(new Date());
  };

  const handleViewChange = (newView: typeof view) => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.changeView(newView);
    setView(newView);
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <Card className="glass-card p-4">
        <div className="flex items-center justify-between">
          {/* Date Navigation */}
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={handlePrev}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="secondary" size="sm" onClick={handleNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 ml-3">
              <CalendarIcon className="w-4 h-4 text-dark-text-secondary" />
              <h2 className="text-base font-semibold text-dark-text-primary">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
            </div>
          </div>

          {/* View Switcher & Create Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-dark-bg-tertiary rounded-lg p-0.5">
              <Button
                variant={view === 'timeGridDay' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('timeGridDay')}
                className="h-8 px-3"
              >
                Day
              </Button>
              <Button
                variant={view === 'timeGridWeek' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('timeGridWeek')}
                className="h-8 px-3"
              >
                Week
              </Button>
              <Button
                variant={view === 'dayGridMonth' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('dayGridMonth')}
                className="h-8 px-3"
              >
                Month
              </Button>
            </div>
            <Button size="sm" onClick={onCreateTask}>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>
      </Card>

      {/* Calendar */}
      <Card className="glass-card p-4">
        <div className="calendar-container">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={view}
            headerToolbar={false}
            events={events}
            editable={true}
            droppable={true}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            height="auto"
            slotMinTime="06:00:00"
            slotMaxTime="23:00:00"
            slotDuration="00:30:00"
            allDaySlot={false}
            nowIndicator={true}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }}
          />
        </div>
      </Card>

      {/* Calendar Styles */}
      <style jsx global>{`
        .calendar-container {
          --fc-border-color: #262626;
          --fc-today-bg-color: rgba(37, 99, 235, 0.05);
          --fc-neutral-bg-color: #171717;
        }

        .fc {
          font-size: 0.875rem;
        }

        .fc .fc-toolbar-title {
          font-size: 1rem;
          font-weight: 600;
          color: #fafafa;
        }

        .fc .fc-button {
          background: #262626;
          border: 1px solid #404040;
          color: #fafafa;
          font-size: 0.8125rem;
          padding: 0.375rem 0.75rem;
          height: 2rem;
        }

        .fc .fc-button:hover {
          background: #404040;
        }

        .fc .fc-button-active {
          background: #2563eb;
          border-color: #2563eb;
        }

        .fc-theme-standard td,
        .fc-theme-standard th {
          border-color: #262626;
        }

        .fc-theme-standard .fc-scrollgrid {
          border-color: #262626;
        }

        .fc .fc-col-header-cell {
          background: #171717;
          padding: 0.5rem;
        }

        .fc .fc-col-header-cell-cushion {
          color: #a1a1a1;
          font-weight: 500;
          font-size: 0.75rem;
          text-transform: uppercase;
        }

        .fc .fc-daygrid-day-number {
          color: #fafafa;
          font-size: 0.8125rem;
          padding: 0.375rem;
        }

        .fc .fc-timegrid-slot-label-cushion {
          color: #a1a1a1;
          font-size: 0.75rem;
        }

        .fc .fc-event {
          border-radius: 0.375rem;
          padding: 0.25rem 0.5rem;
          font-size: 0.8125rem;
          cursor: pointer;
          border-width: 1px;
        }

        .fc .fc-event:hover {
          filter: brightness(1.1);
        }

        .fc .fc-event-title {
          font-weight: 500;
        }

        .fc .fc-timegrid-now-indicator-line {
          border-color: #2563eb;
          border-width: 2px;
        }

        .fc .fc-timegrid-now-indicator-arrow {
          border-color: #2563eb;
        }

        .fc .fc-daygrid-day.fc-day-today {
          background: rgba(37, 99, 235, 0.05);
        }

        .fc .fc-timegrid-col.fc-day-today {
          background: rgba(37, 99, 235, 0.02);
        }
      `}</style>
    </div>
  );
}
