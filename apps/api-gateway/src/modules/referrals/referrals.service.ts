import { Injectable, Logger } from '@nestjs/common';
import { ReferralStatus } from '@microplanner/database';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReferralsService {
  private readonly logger = new Logger(ReferralsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * The user's referral code is their stable user id — reversible so a redeem
   * can map a code straight back to the referrer without a schema migration.
   */
  private codeFor(userId: string): string {
    return userId;
  }

  /** Referral overview for the current user (as a referrer). */
  async getStats(userId: string) {
    const referrals = await this.prisma.referral.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' },
      include: { referred: { select: { name: true, email: true } } },
    });

    const active = referrals.filter((r) => r.status === ReferralStatus.ACTIVE).length;
    const pending = referrals.filter((r) => r.status === ReferralStatus.PENDING).length;

    return {
      code: this.codeFor(userId),
      totalReferrals: referrals.length,
      activeReferrals: active,
      pendingReferrals: pending,
      referrals: referrals.map((r) => ({
        id: r.id,
        status: r.status,
        // Only surface a masked name for privacy.
        referredName: r.referred?.name || maskEmail(r.referred?.email),
        createdAt: r.createdAt,
        completedAt: r.completedAt,
      })),
    };
  }

  /**
   * Redeem a referral code for the current (referred) user. Idempotent and
   * self-referral-safe. Returns true when a new referral was recorded.
   */
  async redeem(referredUserId: string, code: string): Promise<boolean> {
    const referrerId = code?.trim();
    if (!referrerId || referrerId === referredUserId) return false;

    const referrer = await this.prisma.user.findUnique({ where: { id: referrerId } });
    if (!referrer) return false;

    // Only allow being referred once (by anyone).
    const alreadyReferred = await this.prisma.referral.findFirst({
      where: { referredId: referredUserId },
    });
    if (alreadyReferred) return false;

    await this.prisma.referral.create({
      data: {
        referrerId,
        referredId: referredUserId,
        status: ReferralStatus.PENDING,
        referralCode: code,
        source: 'link',
      },
    });

    this.logger.log(`Referral recorded: ${referrerId} -> ${referredUserId}`);
    return true;
  }
}

function maskEmail(email?: string | null): string {
  if (!email) return 'A friend';
  const [name, domain] = email.split('@');
  if (!domain) return 'A friend';
  const shown = name.slice(0, 2);
  return `${shown}${'*'.repeat(Math.max(1, name.length - 2))}@${domain}`;
}
