import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { Public } from '../auth/decorators/public.decorator';
import { RequireSubscription } from '../auth/decorators/require-subscription.decorator';
import { SubscriptionTier } from '@microplanner/database';
import {
  CreateSchedulingLinkDto,
  UpdateSchedulingLinkDto,
  CreateBookingDto,
  BookingStatus,
} from './types/scheduling.types';

/**
 * Scheduling Controller
 *
 * Handles scheduling links (Calendly-like booking pages):
 * - Public booking pages
 * - Availability calculation
 * - Booking management
 */
@Controller('scheduling')
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  // ==================== SCHEDULING LINKS ====================

  /**
   * Create a new scheduling link (PRO/PREMIUM only)
   */
  @Post('links')
  @RequireSubscription([SubscriptionTier.PRO, SubscriptionTier.PREMIUM])
  async createLink(@Request() req: any, @Body() createDto: CreateSchedulingLinkDto) {
    return this.schedulingService.createSchedulingLink(
      req.user.userId,
      createDto,
      req.user.tier,
    );
  }

  /**
   * Get user's scheduling links
   */
  @Get('links')
  async getUserLinks(@Request() req: any) {
    return this.schedulingService.getUserSchedulingLinks(req.user.userId);
  }

  /**
   * Get scheduling link by slug (public)
   */
  @Get('links/slug/:slug')
  @Public()
  async getLinkBySlug(@Param('slug') slug: string) {
    return this.schedulingService.getSchedulingLinkBySlug(slug);
  }

  /**
   * Update scheduling link
   */
  @Put('links/:id')
  async updateLink(
    @Request() req: any,
    @Param('id') linkId: string,
    @Body() updateDto: UpdateSchedulingLinkDto,
  ) {
    return this.schedulingService.updateSchedulingLink(linkId, req.user.userId, updateDto);
  }

  /**
   * Delete scheduling link
   */
  @Delete('links/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLink(@Request() req: any, @Param('id') linkId: string) {
    await this.schedulingService.deleteSchedulingLink(linkId, req.user.userId);
  }

  // ==================== AVAILABILITY ====================

  /**
   * Get available time slots for a scheduling link (public)
   */
  @Get('links/slug/:slug/slots')
  @Public()
  async getAvailableSlots(
    @Param('slug') slug: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate
      ? new Date(endDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    return this.schedulingService.getAvailableSlots(slug, start, end);
  }

  // ==================== BOOKINGS ====================

  /**
   * Create a booking (public)
   */
  @Post('links/slug/:slug/bookings')
  @Public()
  async createBooking(@Param('slug') slug: string, @Body() createDto: CreateBookingDto) {
    return this.schedulingService.createBooking(slug, createDto);
  }

  /**
   * Get bookings for a scheduling link
   */
  @Get('links/:id/bookings')
  async getLinkBookings(@Request() req: any, @Param('id') linkId: string) {
    return this.schedulingService.getLinkBookings(linkId, req.user.userId);
  }

  /**
   * Update booking status (confirm/reject)
   */
  @Put('bookings/:id/status')
  async updateBookingStatus(
    @Request() req: any,
    @Param('id') bookingId: string,
    @Body('status') status: BookingStatus,
  ) {
    return this.schedulingService.updateBookingStatus(bookingId, req.user.userId, status);
  }

  /**
   * Cancel a booking (public with token or authenticated)
   */
  @Post('bookings/:id/cancel')
  @Public()
  @HttpCode(HttpStatus.OK)
  async cancelBooking(
    @Param('id') bookingId: string,
    @Query('token') cancellationToken?: string,
  ) {
    return this.schedulingService.cancelBooking(bookingId, cancellationToken);
  }
}
