import { gql } from '@apollo/client';

/**
 * Get waitlist statistics
 *
 * Returns overall statistics about the waitlist:
 * - Total entries
 * - Pending, approved, invited, converted counts
 * - Average wait time
 */
export const GET_WAITLIST_STATS = gql`
  query WaitlistStats {
    waitlistStats {
      total
      pending
      approved
      invited
      converted
      averageWaitDays
    }
  }
`;

/**
 * TypeScript types for waitlist stats
 */
export interface WaitlistStats {
  total: number;
  pending: number;
  approved: number;
  invited: number;
  converted: number;
  averageWaitDays: number | null;
}

export interface WaitlistStatsData {
  waitlistStats: WaitlistStats;
}
