/**
 * Validation schemas and utilities using Zod
 */
import { z } from 'zod';

// Common field validations
export const emailSchema = z.string().email('Invalid email address');

export const urlSchema = z.string().url('Invalid URL');

export const phoneSchema = z
  .string()
  .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[0-9]/, 'Password must contain number');

// Goal validation
export const goalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  emoji: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color').optional(),
  frequencyPerWeek: z.number().int().min(1).max(7),
  durationMinutes: z.number().int().min(15).max(480),
  preferredTimes: z.array(z.string()).optional(),
  flexibilityScore: z.number().int().min(1).max(10).optional(),
  priority: z.number().int().min(1).max(10).optional(),
  projectId: z.string().uuid().optional(),
});

export type GoalInput = z.infer<typeof goalSchema>;

// Task validation
export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  notes: z.string().max(1000, 'Notes are too long').optional(),
  priority: z.number().int().min(1).max(10).optional(),
  tags: z.array(z.string()).optional(),
  scheduledDate: z.string().or(z.date()),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  durationMinutes: z.number().int().min(15).max(480),
  goalId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
});

export type TaskInput = z.infer<typeof taskSchema>;

// Project validation
export const projectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color'),
  icon: z.string().max(50).optional(),
  startDate: z.string().or(z.date()).optional(),
  targetDate: z.string().or(z.date()).optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;

// User settings validation
export const userSettingsSchema = z.object({
  theme: z.enum(['LIGHT', 'DARK', 'SYSTEM']).optional(),
  energyPattern: z.enum(['MORNING', 'EVENING', 'FLEXIBLE']).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    weeklySummary: z.boolean().optional(),
    planReminders: z.boolean().optional(),
    taskReminders: z.boolean().optional(),
    goalMilestones: z.boolean().optional(),
    productivityInsights: z.boolean().optional(),
  }).optional(),
});

export type UserSettingsInput = z.infer<typeof userSettingsSchema>;

// Work hours validation
export const workHoursSchema = z.object({
  timezone: z.string().optional(),
  schedule: z.record(z.string()).optional(),
  enforceWorkHours: z.boolean().optional(),
  maxMeetingsPerDay: z.number().int().min(0).max(20).optional(),
  maxMeetingHoursPerDay: z.number().int().min(0).max(24).optional(),
  maxConsecutiveMeetings: z.number().int().min(0).max(10).optional(),
});

export type WorkHoursInput = z.infer<typeof workHoursSchema>;

// Focus time block validation
export const focusTimeBlockSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  frequency: z.string(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  durationMinutes: z.number().int().min(15).max(480),
  priority: z.number().int().min(1).max(10).optional(),
  protected: z.boolean().optional(),
  autoSchedule: z.boolean().optional(),
  preferredTimeSlots: z.array(z.string()).optional(),
  color: z.string().optional(),
});

export type FocusTimeBlockInput = z.infer<typeof focusTimeBlockSchema>;

// Helper function to validate data
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string[]> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });

  return { success: false, errors };
}
