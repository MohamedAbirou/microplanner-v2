/**
 * Scheduling Links Types (Calendly-like)
 *
 * PREMIUM tier feature for creating booking links
 */

// ==================== SCHEDULING LINKS ====================

/**
 * Scheduling link
 */
export interface SchedulingLink {
  id: string;
  userId: string;
  name: string;
  slug: string; // Unique URL slug
  description: string | null;
  duration: number; // Minutes
  bufferBefore: number; // Minutes
  bufferAfter: number; // Minutes;
  meetingType: MeetingType;
  location: string | null;
  color: string;
  isActive: boolean;
  isPublic: boolean;
  requiresConfirmation: boolean;
  maxBookingsPerDay: number | null;
  noticeTime: number; // Minimum hours notice
  availability: AvailabilitySettings;
  customQuestions: CustomQuestion[];
  redirectUrl: string | null;
  confirmationMessage: string | null;
  bookingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Meeting types
 */
export enum MeetingType {
  ONE_ON_ONE = 'one-on-one',
  GROUP = 'group',
  ROUND_ROBIN = 'round-robin',
}

/**
 * Availability settings
 */
export interface AvailabilitySettings {
  timezone: string;
  dateRange: {
    type: 'indefinitely' | 'date-range' | 'rolling-days';
    startDate?: string;
    endDate?: string;
    rollingDays?: number;
  };
  schedule: WeeklySchedule;
  overrides: DateOverride[];
}

/**
 * Weekly schedule
 */
export interface WeeklySchedule {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

/**
 * Time slot
 */
export interface TimeSlot {
  start: string; // HH:MM
  end: string; // HH:MM
}

/**
 * Date override (specific dates unavailable)
 */
export interface DateOverride {
  date: string; // YYYY-MM-DD
  available: boolean;
  slots?: TimeSlot[];
}

/**
 * Custom question
 */
export interface CustomQuestion {
  id: string;
  question: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'multiselect';
  required: boolean;
  options?: string[];
}

/**
 * Booking
 */
export interface Booking {
  id: string;
  linkId: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string | null;
  startTime: Date;
  endTime: Date;
  timezone: string;
  status: BookingStatus;
  canceledAt: Date | null;
  cancelReason: string | null;
  customResponses: Record<string, any>;
  meetingUrl: string | null;
  calendarEventId: string | null;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Booking status
 */
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELED = 'canceled',
  COMPLETED = 'completed',
}

/**
 * Create scheduling link DTO
 */
export interface CreateSchedulingLinkDto {
  name: string;
  slug: string;
  description?: string;
  duration: number;
  bufferBefore?: number;
  bufferAfter?: number;
  meetingType?: MeetingType;
  location?: string;
  color?: string;
  isPublic?: boolean;
  requiresConfirmation?: boolean;
  maxBookingsPerDay?: number;
  noticeTime?: number;
  availability?: AvailabilitySettings;
  customQuestions?: CustomQuestion[];
  redirectUrl?: string;
  confirmationMessage?: string;
}

/**
 * Update scheduling link DTO
 */
export interface UpdateSchedulingLinkDto {
  name?: string;
  description?: string;
  duration?: number;
  bufferBefore?: number;
  bufferAfter?: number;
  location?: string;
  color?: string;
  isActive?: boolean;
  isPublic?: boolean;
  requiresConfirmation?: boolean;
  maxBookingsPerDay?: number;
  noticeTime?: number;
  availability?: AvailabilitySettings;
  customQuestions?: CustomQuestion[];
  redirectUrl?: string;
  confirmationMessage?: string;
}

/**
 * Create booking DTO
 */
export interface CreateBookingDto {
  linkSlug: string;
  startTime: string; // ISO datetime
  timezone: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  customResponses?: Record<string, any>;
}

/**
 * Available slots response
 */
export interface AvailableSlotsResponse {
  date: string;
  slots: Array<{
    start: string; // ISO datetime
    end: string; // ISO datetime
    available: boolean;
  }>;
}

/**
 * Scheduling link statistics
 */
export interface SchedulingLinkStats {
  linkId: string;
  totalBookings: number;
  confirmedBookings: number;
  canceledBookings: number;
  completedBookings: number;
  upcomingBookings: number;
  conversionRate: number;
  popularTimeSlots: Array<{
    hour: number;
    count: number;
  }>;
  popularDays: Array<{
    day: number;
    count: number;
  }>;
}
