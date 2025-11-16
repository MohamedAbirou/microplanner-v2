'use client';

import { MonthCalendar } from '@/components/calendar/month-calendar';
import { addDays, subDays } from 'date-fns';

// Mock data - will be replaced with GraphQL query
const mockMonthTasks = [
  // Today
  {
    id: '1',
    title: 'Morning workout',
    scheduledDate: new Date().toISOString(),
    isCompleted: true,
    goal: { id: '2', emoji: '💪', title: 'Fitness', color: '#10B981' },
  },
  {
    id: '2',
    title: 'Review project proposal',
    scheduledDate: new Date().toISOString(),
    isCompleted: true,
    goal: { id: '1', emoji: '💼', title: 'Career Growth', color: '#3B82F6' },
  },
  {
    id: '3',
    title: 'Team standup meeting',
    scheduledDate: new Date().toISOString(),
    isCompleted: true,
    goal: { id: '1', emoji: '💼', title: 'Work', color: '#F59E0B' },
  },
  {
    id: '4',
    title: 'Deep work: Code review',
    scheduledDate: new Date().toISOString(),
    isCompleted: false,
    goal: { id: '3', emoji: '⚡', title: 'Development', color: '#8B5CF6' },
  },
  // Tomorrow
  {
    id: '5',
    title: 'Client presentation',
    scheduledDate: addDays(new Date(), 1).toISOString(),
    isCompleted: false,
    goal: { id: '1', emoji: '💼', title: 'Career Growth', color: '#3B82F6' },
  },
  {
    id: '6',
    title: 'Yoga session',
    scheduledDate: addDays(new Date(), 1).toISOString(),
    isCompleted: false,
    goal: { id: '2', emoji: '💪', title: 'Fitness', color: '#10B981' },
  },
  // Day after tomorrow
  {
    id: '7',
    title: 'Focus block: Writing',
    scheduledDate: addDays(new Date(), 2).toISOString(),
    isCompleted: false,
    goal: { id: '5', emoji: '✍️', title: 'Content Creation', color: '#F97316' },
  },
  {
    id: '8',
    title: 'Lunch with mentor',
    scheduledDate: addDays(new Date(), 2).toISOString(),
    isCompleted: false,
    goal: { id: '1', emoji: '💼', title: 'Career Growth', color: '#3B82F6' },
  },
  {
    id: '9',
    title: 'Read for 30 minutes',
    scheduledDate: addDays(new Date(), 2).toISOString(),
    isCompleted: false,
    goal: { id: '4', emoji: '📚', title: 'Learning', color: '#EC4899' },
  },
  // +3 days
  {
    id: '10',
    title: 'Team retrospective',
    scheduledDate: addDays(new Date(), 3).toISOString(),
    isCompleted: false,
    goal: { id: '1', emoji: '💼', title: 'Work', color: '#F59E0B' },
  },
  {
    id: '11',
    title: 'Swimming',
    scheduledDate: addDays(new Date(), 3).toISOString(),
    isCompleted: false,
    goal: { id: '2', emoji: '💪', title: 'Fitness', color: '#10B981' },
  },
  // +5 days
  {
    id: '12',
    title: 'Weekend project work',
    scheduledDate: addDays(new Date(), 5).toISOString(),
    isCompleted: false,
    goal: { id: '6', emoji: '🎨', title: 'Creative Projects', color: '#8B5CF6' },
  },
  {
    id: '13',
    title: 'Family time',
    scheduledDate: addDays(new Date(), 5).toISOString(),
    isCompleted: false,
    goal: { id: '7', emoji: '❤️', title: 'Personal', color: '#EF4444' },
  },
  // +7 days
  {
    id: '14',
    title: 'Weekly review',
    scheduledDate: addDays(new Date(), 7).toISOString(),
    isCompleted: false,
    goal: { id: '1', emoji: '📋', title: 'Productivity', color: '#6366F1' },
  },
  // Yesterday
  {
    id: '15',
    title: 'Completed workout',
    scheduledDate: subDays(new Date(), 1).toISOString(),
    isCompleted: true,
    goal: { id: '2', emoji: '💪', title: 'Fitness', color: '#10B981' },
  },
  {
    id: '16',
    title: 'Completed reading',
    scheduledDate: subDays(new Date(), 1).toISOString(),
    isCompleted: true,
    goal: { id: '4', emoji: '📚', title: 'Learning', color: '#EC4899' },
  },
];

export default function MonthPage() {
  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
    // TODO: Navigate to day view or show day details
  };

  const handleTaskClick = (task: any) => {
    console.log('Task clicked:', task);
    // TODO: Open task detail modal
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] p-6">
      <MonthCalendar
        tasks={mockMonthTasks}
        onDateClick={handleDateClick}
        onTaskClick={handleTaskClick}
      />
    </div>
  );
}
