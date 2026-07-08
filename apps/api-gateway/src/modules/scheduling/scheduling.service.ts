import { SubscriptionTier, SubscriptionTierType } from '@microplanner/database';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../email/email.service';
import {
  AvailabilitySettings,
  Booking,
  BookingStatus,
  CreateBookingDto,
  CreateSchedulingLinkDto,
  SchedulingLink,
  UpdateSchedulingLinkDto,
  WeeklySchedule
} from './types/scheduling.types';

// Internal time slot type for getAvailableSlots return
export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

/**
 * Scheduling Service
 *
 * Handles scheduling links (Calendly-like booking pages):
 * - Create/manage scheduling links
 * - Calculate available time slots
 * - Book appointments
 * - Manage bookings
 */
@Injectable()
export class SchedulingService {
  private readonly logger = new Logger(SchedulingService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Notify the link owner and attendee about a booking event.
   * Fire-and-forget: email failures never break bookings.
   */
  private notifyBooking(
    booking: { attendeeName: string; attendeeEmail: string; startTime: Date; endTime: Date; timezone?: string | null },
    link: { name: string; userId: string },
    status: 'pending' | 'confirmed' | 'canceled'
  ): void {
    (async () => {
      const payload = {
        linkName: link.name,
        attendeeName: booking.attendeeName,
        startTime: booking.startTime,
        endTime: booking.endTime,
        timezone: booking.timezone || undefined,
        status,
      };
      const owner = await this.prisma.user.findUnique({ where: { id: link.userId } });
      if (owner?.email) {
        await this.emailService.sendBookingEmail(owner.email, payload);
      }
      if (booking.attendeeEmail) {
        await this.emailService.sendBookingEmail(booking.attendeeEmail, payload);
      }
    })().catch((error) => {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn('Failed to send booking email: ' + message);
    });
  }

  // ==================== SCHEDULING LINKS ====================

  /**
   * Create a new scheduling link (PRO or PREMIUM only)
   */
  async createSchedulingLink(
    userId: string,
    createDto: CreateSchedulingLinkDto,
    userTier: SubscriptionTierType
  ): Promise<SchedulingLink> {
    if (userTier !== SubscriptionTier.PRO && userTier !== SubscriptionTier.PREMIUM) {
      throw new ForbiddenException('Scheduling links are only available for PRO and PREMIUM users');
    }

    // Generate unique slug
    let slug = createDto.slug || this.generateSlug(createDto.name);
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const existing = await this.prisma.schedulingLink.findUnique({ where: { slug } });
      if (!existing) {
        isUnique = true;
      } else {
        slug = `${slug}-${crypto.randomBytes(3).toString('hex')}`;
        attempts++;
      }
    }

    if (!isUnique) {
      throw new BadRequestException('Unable to generate unique slug. Please try a different name.');
    }

    const defaultAvailability: AvailabilitySettings = {
      timezone: createDto.availability?.timezone || 'UTC',
      schedule: createDto.availability?.schedule || this.getDefaultSchedule(),
      dateRange: createDto.availability?.dateRange || { type: 'indefinitely' },
      overrides: createDto.availability?.overrides || [],
    };

    const link = await this.prisma.schedulingLink.create({
      data: {
        userId,
        slug,
        name: createDto.name,
        description: createDto.description || null,
        duration: createDto.duration,
        bufferBefore: createDto.bufferBefore || 0,
        bufferAfter: createDto.bufferAfter || 0,
        noticeTime: createDto.noticeTime || 60,
        meetingType: createDto.meetingType || 'one-on-one',
        location: createDto.location || null,
        color: createDto.color || '#3B82F6',
        isPublic: createDto.isPublic !== undefined ? createDto.isPublic : true,
        requiresConfirmation: createDto.requiresConfirmation || false,
        maxBookingsPerDay: createDto.maxBookingsPerDay || null,
        redirectUrl: createDto.redirectUrl || null,
        confirmationMessage: createDto.confirmationMessage || null,
        availability: defaultAvailability as any,
        customQuestions: (createDto.customQuestions || []) as any,
        isActive: true,
      },
    });

    this.logger.log(`Scheduling link created: ${link.id} (${slug}) by user ${userId}`);

    return link as unknown as SchedulingLink;
  }

  /**
   * Get user's scheduling links
   */
  async getUserSchedulingLinks(userId: string): Promise<SchedulingLink[]> {
    const links = await this.prisma.schedulingLink.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return links as unknown as SchedulingLink[];
  }

  /**
   * Get scheduling link by slug (public)
   */
  async getSchedulingLinkBySlug(slug: string): Promise<SchedulingLink> {
    const link = await this.prisma.schedulingLink.findUnique({
      where: { slug },
      include: {
        user: {
          select: { name: true, email: true, avatar: true },
        },
      },
    });

    if (!link) {
      throw new NotFoundException('Scheduling link not found');
    }

    if (!link.isActive) {
      throw new BadRequestException('This scheduling link is no longer active');
    }

    return link as unknown as SchedulingLink;
  }

  /**
   * Update scheduling link
   */
  async updateSchedulingLink(
    linkId: string,
    userId: string,
    updateDto: UpdateSchedulingLinkDto
  ): Promise<SchedulingLink> {
    const link = await this.prisma.schedulingLink.findFirst({
      where: { id: linkId, userId },
    });

    if (!link) {
      throw new NotFoundException('Scheduling link not found');
    }

    const updated = await this.prisma.schedulingLink.update({
      where: { id: linkId },
      data: {
        name: updateDto.name,
        description: updateDto.description,
        duration: updateDto.duration,
        bufferBefore: updateDto.bufferBefore,
        bufferAfter: updateDto.bufferAfter,
        noticeTime: updateDto.noticeTime,
        location: updateDto.location,
        color: updateDto.color,
        isActive: updateDto.isActive,
        isPublic: updateDto.isPublic,
        requiresConfirmation: updateDto.requiresConfirmation,
        maxBookingsPerDay: updateDto.maxBookingsPerDay,
        redirectUrl: updateDto.redirectUrl,
        confirmationMessage: updateDto.confirmationMessage,
        availability: updateDto.availability as any,
        customQuestions: updateDto.customQuestions as any,
      },
    });

    this.logger.log(`Scheduling link updated: ${linkId}`);

    return updated as unknown as SchedulingLink;
  }

  /**
   * Delete scheduling link
   */
  async deleteSchedulingLink(linkId: string, userId: string): Promise<void> {
    const link = await this.prisma.schedulingLink.findFirst({
      where: { id: linkId, userId },
    });

    if (!link) {
      throw new NotFoundException('Scheduling link not found');
    }

    // Delete all bookings first
    await this.prisma.booking.deleteMany({
      where: { linkId },
    });

    await this.prisma.schedulingLink.delete({
      where: { id: linkId },
    });

    this.logger.log(`Scheduling link deleted: ${linkId}`);
  }

  // ==================== AVAILABILITY ====================

  /**
   * Get available time slots for a scheduling link
   */
  async getAvailableSlots(slug: string, startDate: Date, endDate: Date): Promise<TimeSlot[]> {
    const link = await this.getSchedulingLinkBySlug(slug);
    const availability = link.availability as unknown as AvailabilitySettings;

    // Get user's existing calendar events and bookings
    const [calendarEvents, existingBookings] = await Promise.all([
      this.getUserCalendarEvents(link.userId, startDate, endDate),
      this.prisma.booking.findMany({
        where: {
          linkId: link.id,
          status: { in: ['confirmed', 'pending'] },
          startTime: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    const slots: TimeSlot[] = [];
    const currentDate = new Date(startDate);

    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ] as const;

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const dayName = dayNames[dayOfWeek];
      const daySchedule = availability.schedule[dayName];

      if (daySchedule && daySchedule.length > 0) {
        // Check for date overrides
        const override = availability.overrides?.find(
          o => new Date(o.date).toDateString() === currentDate.toDateString()
        );

        if (override && !override.available) {
          // Date is blocked
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        const timeRanges = override?.slots || daySchedule;

        for (const range of timeRanges) {
          const [startHour, startMinute] = range.start.split(':').map(Number);
          const [endHour, endMinute] = range.end.split(':').map(Number);

          let slotStart = new Date(currentDate);
          slotStart.setHours(startHour, startMinute, 0, 0);

          const rangeEnd = new Date(currentDate);
          rangeEnd.setHours(endHour, endMinute, 0, 0);

          while (slotStart < rangeEnd) {
            const slotEnd = new Date(slotStart.getTime() + link.duration * 60000);

            if (slotEnd > rangeEnd) break;

            // Check if slot is available
            const isAvailable = this.isSlotAvailable(
              slotStart,
              slotEnd,
              calendarEvents,
              existingBookings,
              link
            );

            if (isAvailable) {
              slots.push({
                start: new Date(slotStart),
                end: new Date(slotEnd),
                available: true,
              });
            }

            // Move to next slot (15-minute intervals)
            slotStart = new Date(slotStart.getTime() + 15 * 60000);
          }
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
  }

  // ==================== BOOKINGS ====================

  /**
   * Create a booking
   */
  async createBooking(slug: string, createDto: CreateBookingDto): Promise<Booking> {
    const link = await this.getSchedulingLinkBySlug(slug);

    const startTime = new Date(createDto.startTime);

    // Validate time slot is available
    const endTime = new Date(startTime.getTime() + link.duration * 60000);
    const availableSlots = await this.getAvailableSlots(
      slug,
      new Date(startTime.getTime() - 24 * 60 * 60000), // 1 day before
      new Date(startTime.getTime() + 24 * 60 * 60000) // 1 day after
    );

    const isSlotAvailable = availableSlots.some(
      slot =>
        slot.start.getTime() === startTime.getTime() && slot.end.getTime() === endTime.getTime()
    );

    if (!isSlotAvailable) {
      throw new BadRequestException('Selected time slot is not available');
    }

    const booking = await this.prisma.booking.create({
      data: {
        linkId: link.id,
        attendeeName: createDto.attendeeName,
        attendeeEmail: createDto.attendeeEmail,
        attendeePhone: createDto.attendeePhone || null,
        startTime,
        endTime,
        timezone: createDto.timezone || 'UTC',
        customResponses: createDto.customResponses || {},
        status: link.requiresConfirmation ? 'pending' : 'confirmed',
      },
    });

    // Increment booking count
    await this.prisma.schedulingLink.update({
      where: { id: link.id },
      data: { bookingCount: { increment: 1 } },
    });

    this.logger.log(`Booking created: ${booking.id} for link ${link.id}`);

    this.notifyBooking(
      booking as any,
      link as any,
      link.requiresConfirmation ? 'pending' : 'confirmed'
    );

    return booking as unknown as Booking;
  }

  /**
   * Get bookings for a scheduling link
   */
  async getLinkBookings(linkId: string, userId: string): Promise<Booking[]> {
    // Verify link ownership
    const link = await this.prisma.schedulingLink.findFirst({
      where: { id: linkId, userId },
    });

    if (!link) {
      throw new NotFoundException('Scheduling link not found');
    }

    const bookings = await this.prisma.booking.findMany({
      where: { linkId },
      orderBy: { startTime: 'asc' },
    });

    return bookings as unknown as Booking[];
  }

  /**
   * Get a single scheduling link by ID (owner only)
   */
  async getSchedulingLink(linkId: string, userId: string): Promise<SchedulingLink> {
    const link = await this.prisma.schedulingLink.findFirst({
      where: { id: linkId, userId },
    });

    if (!link) {
      throw new NotFoundException('Scheduling link not found');
    }

    return link as unknown as SchedulingLink;
  }

  /**
   * Toggle a scheduling link's active state
   */
  async toggleSchedulingLink(linkId: string, userId: string): Promise<SchedulingLink> {
    const link = await this.prisma.schedulingLink.findFirst({
      where: { id: linkId, userId },
    });

    if (!link) {
      throw new NotFoundException('Scheduling link not found');
    }

    const updated = await this.prisma.schedulingLink.update({
      where: { id: linkId },
      data: { isActive: !link.isActive },
    });

    this.logger.log(`Scheduling link ${linkId} ${updated.isActive ? 'activated' : 'deactivated'}`);
    return updated as unknown as SchedulingLink;
  }

  /**
   * Get all bookings across the user's links (optionally filtered)
   */
  async getUserBookings(
    userId: string,
    filters: { linkId?: string; status?: string } = {}
  ): Promise<Booking[]> {
    const bookings = await this.prisma.booking.findMany({
      where: {
        link: { userId },
        ...(filters.linkId ? { linkId: filters.linkId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      include: { link: { select: { id: true, name: true, slug: true } } },
      orderBy: { startTime: 'desc' },
    });

    return bookings as unknown as Booking[];
  }

  /**
   * Get a single booking (owner only)
   */
  async getBooking(bookingId: string, userId: string): Promise<Booking> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { link: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.link.userId !== userId) {
      throw new ForbiddenException('You do not own this booking');
    }

    return booking as unknown as Booking;
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(
    bookingId: string,
    userId: string,
    status: BookingStatus
  ): Promise<Booking> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { link: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.link.userId !== userId) {
      throw new ForbiddenException('You do not own this booking');
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    this.logger.log(`Booking ${bookingId} status updated to ${status}`);

    this.notifyBooking(
      updated as any,
      booking.link as any,
      status === 'confirmed' ? 'confirmed' : 'canceled'
    );

    return updated as unknown as Booking;
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string, _cancellationToken?: string): Promise<Booking> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { link: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // If cancellation token provided, validate it
    // Otherwise, caller must have proper authorization

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
      },
    });

    this.logger.log(`Booking cancelled: ${bookingId}`);

    this.notifyBooking(updated as any, booking.link as any, 'canceled');

    return updated as unknown as Booking;
  }

  // ==================== HELPER METHODS ====================

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }

  private getDefaultSchedule(): WeeklySchedule {
    const workdaySchedule = [{ start: '09:00', end: '17:00' }];
    return {
      sunday: [],
      monday: workdaySchedule,
      tuesday: workdaySchedule,
      wednesday: workdaySchedule,
      thursday: workdaySchedule,
      friday: workdaySchedule,
      saturday: [],
    };
  }

  private async getUserCalendarEvents(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ start: Date; end: Date }>> {
    // Busy times come from the user's own MicroPlanner tasks in the range.
    // External-calendar busy times additionally flow in once the user
    // connects Google Calendar (tasks synced there carry the same times).
    const tasks = await this.prisma.task.findMany({
      where: {
        userId,
        isCompleted: false,
        isSkipped: false,
        scheduledDate: { gte: startDate, lte: endDate },
      },
      select: { scheduledDate: true, startTime: true, endTime: true },
    });

    return tasks
      .filter((t) => t.startTime && t.endTime)
      .map((t) => {
        const start = new Date(t.scheduledDate);
        const [sh, sm] = t.startTime!.split(':').map(Number);
        start.setHours(sh, sm, 0, 0);
        const end = new Date(t.scheduledDate);
        const [eh, em] = t.endTime!.split(':').map(Number);
        end.setHours(eh, em, 0, 0);
        return { start, end };
      });
  }

  private isSlotAvailable(
    slotStart: Date,
    slotEnd: Date,
    calendarEvents: Array<{ start: Date; end: Date }>,
    existingBookings: any[],
    link: any // SchedulingLink
  ): boolean {
    // Check min notice
    const now = new Date();
    const minNoticeMs = (link.noticeTime || 60) * 60000;
    if (slotStart.getTime() - now.getTime() < minNoticeMs) {
      return false;
    }

    // Check max days out (default 60 days)
    const maxDaysOutMs = 60 * 24 * 60 * 60000;
    if (slotStart.getTime() - now.getTime() > maxDaysOutMs) {
      return false;
    }

    // Check calendar conflicts (with buffer)
    const bufferBefore = (link.bufferBefore || 0) * 60000;
    const bufferAfter = (link.bufferAfter || 0) * 60000;

    for (const event of calendarEvents) {
      const eventStart = new Date(event.start).getTime() - bufferBefore;
      const eventEnd = new Date(event.end).getTime() + bufferAfter;

      if (
        (slotStart.getTime() >= eventStart && slotStart.getTime() < eventEnd) ||
        (slotEnd.getTime() > eventStart && slotEnd.getTime() <= eventEnd) ||
        (slotStart.getTime() <= eventStart && slotEnd.getTime() >= eventEnd)
      ) {
        return false;
      }
    }

    // Check existing bookings
    for (const booking of existingBookings) {
      const bookingStart = new Date(booking.startTime).getTime() - bufferBefore;
      const bookingEnd = new Date(booking.endTime).getTime() + bufferAfter;

      if (
        (slotStart.getTime() >= bookingStart && slotStart.getTime() < bookingEnd) ||
        (slotEnd.getTime() > bookingStart && slotEnd.getTime() <= bookingEnd) ||
        (slotStart.getTime() <= bookingStart && slotEnd.getTime() >= bookingEnd)
      ) {
        return false;
      }
    }

    return true;
  }
}
