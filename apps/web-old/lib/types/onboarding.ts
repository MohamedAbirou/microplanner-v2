export interface OnboardingData {
  // Step 1: Welcome
  fullName?: string;
  timezone?: string;

  // Step 2: Work Hours
  workDays?: string[]; // ['monday', 'tuesday', etc.]
  workStartTime?: string; // '09:00'
  workEndTime?: string; // '17:00'
  maxMeetingsPerDay?: number;

  // Step 3: Energy Pattern
  energyPattern?: 'morning' | 'evening' | 'flexible';
  preferredFocusHours?: string[]; // ['09:00-11:00', '14:00-16:00']

  // Step 4: Initial Goals
  goals?: {
    title: string;
    emoji: string;
    frequency: number;
  }[];

  // Step 5: Calendar Connection
  skipCalendarConnection?: boolean;
}

export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

export const TOTAL_STEPS = 5;

export const STEP_TITLES: Record<OnboardingStep, string> = {
  1: 'Welcome',
  2: 'Work Hours',
  3: 'Energy Pattern',
  4: 'Your Goals',
  5: 'Connect Calendar',
};
