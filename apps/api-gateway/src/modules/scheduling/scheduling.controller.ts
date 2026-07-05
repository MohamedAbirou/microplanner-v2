import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
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
      req.user.id,
      createDto,
      req.user.tier,
    );
  }

  /**
   * Get user's scheduling links
   */
  @Get('links')
  async getUserLinks(@Request() req: any) {
    return this.schedulingService.getUserSchedulingLinks(req.user.id);
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
   * Get a single scheduling link by ID (owner)
   */
  @Get('links/:id')
  async getLink(@Request() req: any, @Param('id') linkId: string) {
    return this.schedulingService.getSchedulingLink(linkId, req.user.id);
  }

  /**
   * Toggle a scheduling link's active state
   */
  @Put('links/:id/toggle')
  async toggleLink(@Request() req: any, @Param('id') linkId: string) {
    return this.schedulingService.toggleSchedulingLink(linkId, req.user.id);
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
    return this.schedulingService.updateSchedulingLink(linkId, req.user.id, updateDto);
  }

  /**
   * Delete scheduling link
   */
  @Delete('links/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLink(@Request() req: any, @Param('id') linkId: string) {
    await this.schedulingService.deleteSchedulingLink(linkId, req.user.id);
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
    return this.schedulingService.getLinkBookings(linkId, req.user.id);
  }

  /**
   * Get all bookings across the user's links
   */
  @Get('bookings')
  async getBookings(
    @Request() req: any,
    @Query('linkId') linkId?: string,
    @Query('status') status?: string,
  ) {
    return this.schedulingService.getUserBookings(req.user.id, { linkId, status });
  }

  /**
   * Get a single booking (owner)
   */
  @Get('bookings/:id')
  async getBooking(@Request() req: any, @Param('id') bookingId: string) {
    return this.schedulingService.getBooking(bookingId, req.user.id);
  }

  /**
   * Confirm a booking (owner)
   */
  @Post('bookings/:id/confirm')
  async confirmBooking(@Request() req: any, @Param('id') bookingId: string) {
    return this.schedulingService.updateBookingStatus(
      bookingId,
      req.user.id,
      'confirmed' as BookingStatus,
    );
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
    return this.schedulingService.updateBookingStatus(bookingId, req.user.id, status);
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
