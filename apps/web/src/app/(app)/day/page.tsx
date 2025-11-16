'use client';

import { DayCalendar } from '@/components/calendar/day-calendar';

// Mock data - will be replaced with GraphQL query
const mockDayTasks = [
  {
    id: '1',
    title: 'Morning workout',
    notes: 'Cardio + strength training',
    goal: { id: '2', emoji: '💪', title: 'Fitness', color: '#10B981' },
    startTime: '07:00',
    endTime: '08:00',
    scheduledDate: new Date().toISOString(),
    durationMinutes: 60,
    isCompleted: true,
    priority: 1,
  },
  {
    id: '2',
    title: 'Review project proposal',
    notes: 'Review the Q4 proposal and provide feedback',
    goal: { id: '1', emoji: '💼', title: 'Career Growth', color: '#3B82F6' },
    startTime: '09:00',
    endTime: '10:00',
    scheduledDate: new Date().toISOString(),
    durationMinutes: 60,
    isCompleted: true,
    priority: 1,
  },
  {
    id: '3',
    title: 'Team standup meeting',
    notes: null,
    goal: { id: '1', emoji: '💼', title: 'Work', color: '#F59E0B' },
    startTime: '10:00',
    endTime: '10:30',
    scheduledDate: new Date().toISOString(),
    durationMinutes: 30,
    isCompleted: true,
    priority: 2,
  },
  {
    id: '4',
    title: 'Deep work: Code review',
    notes: 'Review PRs from the team',
    goal: { id: '3', emoji: '⚡', title: 'Development', color: '#8B5CF6' },
    startTime: '14:00',
    endTime: '16:00',
    scheduledDate: new Date().toISOString(),
    durationMinutes: 120,
    isCompleted: false,
    priority: 1,
  },
  {
    id: '5',
    title: 'Read for 30 minutes',
    notes: 'Continue reading "Atomic Habits"',
    goal: { id: '4', emoji: '📚', title: 'Learning', color: '#EC4899' },
    startTime: '20:00',
    endTime: '20:30',
    scheduledDate: new Date().toISOString(),
    durationMinutes: 30,
    isCompleted: false,
    priority: 2,
  },
  {
    id: '6',
    title: 'Plan tomorrow',
    notes: 'Review schedule and priorities',
    goal: { id: '1', emoji: '📋', title: 'Productivity', color: '#6366F1' },
    startTime: '21:00',
    endTime: '21:15',
    scheduledDate: new Date().toISOString(),
    durationMinutes: 15,
    isCompleted: false,
    priority: 3,
  },
];

export default function DayPage() {
  const handleTaskClick = (task: any) => {
    console.log('Task clicked:', task);
    // TODO: Open task detail modal
  };

  const handleTimeSlotClick = (hour: number, minute: number) => {
    console.log('Time slot clicked:', hour, minute);
    // TODO: Open quick add task modal with pre-filled time
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] p-6">
      <DayCalendar
        tasks={mockDayTasks}
        onTaskClick={handleTaskClick}
        onTimeSlotClick={handleTimeSlotClick}
      />
    </div>
  );
}
