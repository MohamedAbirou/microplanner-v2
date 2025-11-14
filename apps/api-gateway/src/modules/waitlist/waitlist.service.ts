import { WaitlistStatus } from '@microplanner/database';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../email/email.service';
import { JoinWaitlistInput } from './dto/join-waitlist.input';
import { JoinWaitlistResult, WaitlistStats } from './dto/waitlist.types';

@Injectable()
export class WaitlistService {
  private readonly logger = new Logger(WaitlistService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async joinWaitlist(input: JoinWaitlistInput): Promise<JoinWaitlistResult> {
    // Check if email already exists
    const existing = await this.prisma.waitlist.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered on waitlist');
    }

    // Get current max position
    const maxPosition = await this.prisma.waitlist.findFirst({
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const newPosition = (maxPosition?.position || 0) + 1;

    // Create waitlist entry
    const entry = await this.prisma.waitlist.create({
      data: {
        email: input.email,
        name: input.name,
        useCase: input.useCase,
        referralSource: input.referralSource,
        position: newPosition,
        status: WaitlistStatus.PENDING,
      },
    });

    // Send welcome email (async, don't wait for it)
    this.emailService.sendWaitlistWelcome(
      entry.email,
      entry.name || '',
      entry.position,
    ).catch((error) => {
      this.logger.error(`Failed to send waitlist welcome email: ${error.message}`);
    });

    return {
      success: true,
      message: 'Successfully joined the waitlist!',
      position: entry.position,
      email: entry.email,
    };
  }

  async getWaitlistStats(): Promise<WaitlistStats> {
    const [total, pending, approved, invited, converted] = await Promise.all([
      this.prisma.waitlist.count(),
      this.prisma.waitlist.count({ where: { status: WaitlistStatus.PENDING } }),
      this.prisma.waitlist.count({ where: { status: WaitlistStatus.INVITED } }),
      this.prisma.waitlist.count({ where: { status: WaitlistStatus.INVITED } }),
      this.prisma.waitlist.count({ where: { status: WaitlistStatus.CONVERTED } }),
    ]);

    // Calculate average wait days for converted users
    const convertedUsers = await this.prisma.waitlist.findMany({
      where: {
        status: WaitlistStatus.CONVERTED,
        convertedAt: { not: null },
      },
      select: {
        createdAt: true,
        convertedAt: true,
      },
    });

    let averageWaitDays: number | null = null;
    if (convertedUsers.length > 0) {
      const totalDays = convertedUsers.reduce((sum, user) => {
        const days = Math.floor(
          (user.convertedAt!.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0);
      averageWaitDays = Math.round(totalDays / convertedUsers.length);
    }

    return {
      total,
      pending,
      approved,
      invited,
      converted,
      averageWaitDays,
    };
  }
}
