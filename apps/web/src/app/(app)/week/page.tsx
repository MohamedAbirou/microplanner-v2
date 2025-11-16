'use client';

import { WeekCalendar } from '@/components/calendar/week-calendar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// Mock data - will be replaced with GraphQL query
const mockWeekTasks = [
  {
    id: '1',
    title: 'Morning workout',
    notes: 'Cardio + strength training',
    goal: { id: '2', emoji: '💪', title: 'Fitness', color: '#10B981' },
    startTime: '07:00',
    endTime: '08:00',
    scheduledDate: new Date(2025, 10, 17).toISOString(), // Monday
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
    scheduledDate: new Date(2025, 10, 17).toISOString(),
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
    scheduledDate: new Date(2025, 10, 17).toISOString(),
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
    scheduledDate: new Date(2025, 10, 17).toISOString(),
    durationMinutes: 120,
    isCompleted: false,
    priority: 1,
  },
  {
    id: '5',
    title: 'Morning workout',
    notes: 'Cardio + strength training',
    goal: { id: '2', emoji: '💪', title: 'Fitness', color: '#10B981' },
    startTime: '07:00',
    endTime: '08:00',
    scheduledDate: new Date(2025, 10, 18).toISOString(), // Tuesday
    durationMinutes: 60,
    isCompleted: false,
    priority: 1,
  },
  {
    id: '6',
    title: 'Client presentation',
    notes: 'Present Q4 roadmap to stakeholders',
    goal: { id: '1', emoji: '💼', title: 'Career Growth', color: '#3B82F6' },
    startTime: '11:00',
    endTime: '12:30',
    scheduledDate: new Date(2025, 10, 18).toISOString(),
    durationMinutes: 90,
    isCompleted: false,
    priority: 1,
  },
  {
    id: '7',
    title: 'Read for 30 minutes',
    notes: 'Continue reading "Atomic Habits"',
    goal: { id: '4', emoji: '📚', title: 'Learning', color: '#EC4899' },
    startTime: '20:00',
    endTime: '20:30',
    scheduledDate: new Date(2025, 10, 18).toISOString(),
    durationMinutes: 30,
    isCompleted: false,
    priority: 2,
  },
  {
    id: '8',
    title: 'Yoga session',
    notes: 'Flexibility and mindfulness',
    goal: { id: '2', emoji: '💪', title: 'Fitness', color: '#10B981' },
    startTime: '07:00',
    endTime: '08:00',
    scheduledDate: new Date(2025, 10, 19).toISOString(), // Wednesday
    durationMinutes: 60,
    isCompleted: false,
    priority: 2,
  },
  {
    id: '9',
    title: 'Focus block: Writing',
    notes: 'Work on blog post draft',
    goal: { id: '5', emoji: '✍️', title: 'Content Creation', color: '#F97316' },
    startTime: '09:00',
    endTime: '11:00',
    scheduledDate: new Date(2025, 10, 19).toISOString(),
    durationMinutes: 120,
    isCompleted: false,
    priority: 1,
  },
  {
    id: '10',
    title: 'Lunch with mentor',
    notes: 'Career discussion at Cafe Roma',
    goal: { id: '1', emoji: '💼', title: 'Career Growth', color: '#3B82F6' },
    startTime: '12:00',
    endTime: '13:30',
    scheduledDate: new Date(2025, 10, 19).toISOString(),
    durationMinutes: 90,
    isCompleted: false,
    priority: 1,
  },
];

export default function WeekPage() {
  const handleTaskClick = (task: any) => {
    console.log('Task clicked:', task);
    // TODO: Open task detail modal
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    console.log('Time slot clicked:', date, hour);
    // TODO: Open quick add task modal with pre-filled date/time
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] p-6">
      <WeekCalendar
        tasks={mockWeekTasks}
        onTaskClick={handleTaskClick}
        onTimeSlotClick={handleTimeSlotClick}
      />
    </div>
  );
}
