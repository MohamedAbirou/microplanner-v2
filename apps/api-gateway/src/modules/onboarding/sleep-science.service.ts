import { Injectable, Logger } from '@nestjs/common';

export enum Chronotype {
  EARLY_RISER = 'early_riser',   // 5-7 AM wakers
  MODERATE = 'moderate',          // 7-9 AM wakers
  LATE_RISER = 'late_riser',      // 9-11 AM wakers
  NIGHT_OWL = 'night_owl',        // 11+ AM wakers
}

export interface SleepRecommendation {
  wakeTime: string;
  optimalSleepTime: string;
  totalSleepHours: number;
  cycles: number;
  chronotype: Chronotype;
  productivityWindow: {
    start: string;
    end: string;
    peak: string;
  };
  windDownTime: string;
  explanation: string;
  benefits: string[];
  tips: string[];
}

/**
 * Sleep Science Service
 *
 * Implements sleep cycle calculations and chronotype detection
 * based on circadian rhythm research and sleep science.
 *
 * References:
 * - Sleep cycles are 90 minutes (NREM + REM)
 * - Most adults need 5-6 complete cycles (7.5-9 hours)
 * - Chronotypes affect productivity windows
 * - 15-minute buffer for falling asleep
 */
@Injectable()
export class SleepScienceService {
  private readonly logger = new Logger(SleepScienceService.name);

  /**
   * Calculate optimal sleep schedule based on desired wake time
   */
  calculateSleepRecommendation(wakeTimeStr: string, timezone: string): SleepRecommendation {
    this.logger.debug(`Calculating sleep recommendation for wake time: ${wakeTimeStr}, timezone: ${timezone}`);

    const wakeTime = this.parseTime(wakeTimeStr);
    const chronotype = this.inferChronotype(wakeTime.hour);

    // Calculate optimal sleep time (5 complete cycles = 7.5 hours)
    const cycles = this.getOptimalCycles(chronotype);
    const sleepMinutes = cycles * 90; // 90-minute cycles
    const fallAsleepBuffer = 15; // Time to fall asleep
    const totalMinutes = sleepMinutes + fallAsleepBuffer;

    // Work backwards from wake time
    const sleepHour = wakeTime.hour - Math.floor(totalMinutes / 60);
    const sleepMinute = wakeTime.minute - (totalMinutes % 60);

    // Handle negative minutes
    let finalSleepHour = sleepHour;
    let finalSleepMinute = sleepMinute;

    if (sleepMinute < 0) {
      finalSleepMinute = 60 + sleepMinute;
      finalSleepHour -= 1;
    }

    // Handle negative hours (previous day)
    if (finalSleepHour < 0) {
      finalSleepHour = 24 + finalSleepHour;
    }

    const optimalSleepTime = this.formatTime(finalSleepHour, finalSleepMinute);
    const totalSleepHours = sleepMinutes / 60;

    // Calculate productivity window based on chronotype
    const productivityWindow = this.calculateProductivityWindow(chronotype);

    // Calculate wind-down time (2 hours before sleep)
    const windDownHour = finalSleepHour - 2;
    const windDownTime = this.formatTime(windDownHour < 0 ? 24 + windDownHour : windDownHour, finalSleepMinute);

    // Build explanation and recommendations
    const explanation = this.buildExplanation(wakeTimeStr, optimalSleepTime, totalSleepHours, cycles, chronotype);
    const benefits = this.getBenefits(chronotype, totalSleepHours);
    const tips = this.getTips(chronotype);

    return {
      wakeTime: wakeTimeStr,
      optimalSleepTime,
      totalSleepHours,
      cycles,
      chronotype,
      productivityWindow,
      windDownTime,
      explanation,
      benefits,
      tips,
    };
  }

  /**
   * Infer chronotype from wake time
   */
  private inferChronotype(wakeHour: number): Chronotype {
    if (wakeHour <= 7) return Chronotype.EARLY_RISER;
    if (wakeHour <= 9) return Chronotype.MODERATE;
    if (wakeHour <= 11) return Chronotype.LATE_RISER;
    return Chronotype.NIGHT_OWL;
  }

  /**
   * Get optimal sleep cycles based on chronotype
   */
  private getOptimalCycles(chronotype: Chronotype): number {
    // Early risers and moderates do well with 5 cycles
    // Late risers and night owls may need 6 cycles
    switch (chronotype) {
      case Chronotype.EARLY_RISER:
      case Chronotype.MODERATE:
        return 5; // 7.5 hours
      case Chronotype.LATE_RISER:
      case Chronotype.NIGHT_OWL:
        return 6; // 9 hours
      default:
        return 5;
    }
  }

  /**
   * Calculate productivity window based on chronotype
   * Based on circadian rhythm research
   */
  private calculateProductivityWindow(chronotype: Chronotype): { start: string; end: string; peak: string } {
    const windows = {
      [Chronotype.EARLY_RISER]: {
        start: '09:00',
        end: '13:00',
        peak: 'Morning (9 AM - 1 PM)',
      },
      [Chronotype.MODERATE]: {
        start: '11:00',
        end: '15:00',
        peak: 'Midday (11 AM - 3 PM)',
      },
      [Chronotype.LATE_RISER]: {
        start: '14:00',
        end: '18:00',
        peak: 'Afternoon (2 PM - 6 PM)',
      },
      [Chronotype.NIGHT_OWL]: {
        start: '20:00',
        end: '00:00',
        peak: 'Evening (8 PM - Midnight)',
      },
    };

    return windows[chronotype];
  }

  /**
   * Build human-readable explanation
   */
  private buildExplanation(
    wakeTime: string,
    sleepTime: string,
    hours: number,
    cycles: number,
    chronotype: Chronotype
  ): string {
    const chronotypeNames = {
      [Chronotype.EARLY_RISER]: 'an Early Riser',
      [Chronotype.MODERATE]: 'a Moderate',
      [Chronotype.LATE_RISER]: 'a Late Riser',
      [Chronotype.NIGHT_OWL]: 'a Night Owl',
    };

    return `Based on your wake time of ${wakeTime}, you're ${chronotypeNames[chronotype]}. ` +
      `To get ${cycles} complete sleep cycles (${hours} hours of restorative sleep), ` +
      `you should aim to be asleep by ${sleepTime}. This aligns with your natural circadian rhythm ` +
      `and maximizes deep sleep, which is crucial for memory consolidation, muscle recovery, and cognitive performance.`;
  }

  /**
   * Get benefits specific to chronotype and sleep duration
   */
  private getBenefits(chronotype: Chronotype, hours: number): string[] {
    const baseBenefits = [
      `${hours} hours of quality sleep for optimal brain function`,
      'Complete sleep cycles prevent grogginess from waking mid-cycle',
      'Consistent schedule regulates your circadian rhythm',
    ];

    const chronotypeBenefits = {
      [Chronotype.EARLY_RISER]: [
        'Peak productivity during morning hours when focus is sharpest',
        'Natural alignment with traditional work schedules',
        'More daylight exposure for better mood and vitamin D',
      ],
      [Chronotype.MODERATE]: [
        'Balanced energy throughout the day',
        'Flexibility to handle both morning and afternoon tasks',
        'Optimal for most people\'s natural rhythm',
      ],
      [Chronotype.LATE_RISER]: [
        'Peak creativity and problem-solving in afternoons',
        'Better suited for flexible or evening work schedules',
        'Natural energy boost in late afternoon',
      ],
      [Chronotype.NIGHT_OWL]: [
        'Maximum focus during evening hours',
        'Ideal for creative work and deep thinking at night',
        'Perfect for global collaboration across time zones',
      ],
    };

    return [...baseBenefits, ...chronotypeBenefits[chronotype]];
  }

  /**
   * Get personalized tips based on chronotype
   */
  private getTips(chronotype: Chronotype): string[] {
    const baseTips = [
      'Avoid screens 1 hour before bedtime',
      'Keep your bedroom cool (65-68°F / 18-20°C)',
      'Maintain the same sleep schedule on weekends',
    ];

    const chronotypeTips = {
      [Chronotype.EARLY_RISER]: [
        'Schedule your most important work between 9 AM - 1 PM',
        'Get natural sunlight exposure early in the morning',
        'Avoid caffeine after 2 PM',
      ],
      [Chronotype.MODERATE]: [
        'Plan deep work sessions for late morning',
        'Take a short walk after lunch to boost afternoon energy',
        'Limit caffeine after 3 PM',
      ],
      [Chronotype.LATE_RISER]: [
        'Use mornings for routine tasks, afternoons for complex work',
        'Consider a morning workout to help wake up',
        'Limit caffeine after 4 PM',
      ],
      [Chronotype.NIGHT_OWL]: [
        'Save your hardest work for evening hours',
        'Use blue light blocking glasses if working late',
        'Avoid caffeine after 6 PM to ensure sleep quality',
      ],
    };

    return [...baseTips, ...chronotypeTips[chronotype]];
  }

  /**
   * Parse time string to hour/minute
   */
  private parseTime(timeStr: string): { hour: number; minute: number } {
    const [hour, minute] = timeStr.split(':').map(Number);
    return { hour, minute };
  }

  /**
   * Format time as HH:MM
   */
  private formatTime(hour: number, minute: number): string {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m}`;
  }
}
