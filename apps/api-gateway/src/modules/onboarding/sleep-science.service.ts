import { EnergyPattern, EnergyPatternType } from '@microplanner/database';
import { Injectable, Logger } from '@nestjs/common';

export interface SleepRecommendation {
  wakeTime: string;
  optimalSleepTime: string;
  totalSleepHours: number;
  cycles: number;
  energyPattern: EnergyPatternType; // Use existing enum
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
    this.logger.debug(
      `Calculating sleep recommendation for wake time: ${wakeTimeStr}, timezone: ${timezone}`
    );

    const wakeTime = this.parseTime(wakeTimeStr);
    const energyPattern = this.inferEnergyPattern(wakeTime.hour);

    // Calculate optimal sleep time (5 complete cycles = 7.5 hours)
    const cycles = this.getOptimalCycles(energyPattern);
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

    // Calculate productivity window based on energy pattern
    const productivityWindow = this.calculateProductivityWindow(energyPattern);

    // Calculate wind-down time (2 hours before sleep)
    const windDownHour = finalSleepHour - 2;
    const windDownTime = this.formatTime(
      windDownHour < 0 ? 24 + windDownHour : windDownHour,
      finalSleepMinute
    );

    // Build explanation and recommendations
    const explanation = this.buildExplanation(
      wakeTimeStr,
      optimalSleepTime,
      totalSleepHours,
      cycles,
      energyPattern
    );
    const benefits = this.getBenefits(energyPattern, totalSleepHours);
    const tips = this.getTips(energyPattern);

    return {
      wakeTime: wakeTimeStr,
      optimalSleepTime,
      totalSleepHours,
      cycles,
      energyPattern,
      productivityWindow,
      windDownTime,
      explanation,
      benefits,
      tips,
    };
  }

  /**
   * Infer energy pattern from wake time
   */
  private inferEnergyPattern(wakeHour: number): EnergyPatternType {
    // Map wake time to existing EnergyPattern enum
    if (wakeHour <= 8) return EnergyPattern.MORNING_PERSON; // Early risers (5-8 AM)
    if (wakeHour >= 10) return EnergyPattern.NIGHT_OWL; // Late risers/night owls (10 AM+)
    return EnergyPattern.BALANCED; // Moderates (8-10 AM)
  }

  /**
   * Get optimal sleep cycles based on energy pattern
   */
  private getOptimalCycles(energyPattern: EnergyPatternType): number {
    // Morning people tend to do well with 5 cycles (7.5 hours)
    // Night owls may need 6 cycles (9 hours)
    switch (energyPattern) {
      case EnergyPattern.MORNING_PERSON:
        return 5; // 7.5 hours
      case EnergyPattern.NIGHT_OWL:
        return 6; // 9 hours
      case EnergyPattern.BALANCED:
      default:
        return 5; // 7.5 hours
    }
  }

  /**
   * Calculate productivity window based on energy pattern
   * Based on circadian rhythm research
   */
  private calculateProductivityWindow(energyPattern: EnergyPatternType): {
    start: string;
    end: string;
    peak: string;
  } {
    const windows = {
      [EnergyPattern.MORNING_PERSON]: {
        start: '09:00',
        end: '13:00',
        peak: 'Morning (9 AM - 1 PM)',
      },
      [EnergyPattern.BALANCED]: {
        start: '10:00',
        end: '14:00',
        peak: 'Late Morning (10 AM - 2 PM)',
      },
      [EnergyPattern.NIGHT_OWL]: {
        start: '14:00',
        end: '18:00',
        peak: 'Afternoon (2 PM - 6 PM)',
      },
    };

    return windows[energyPattern];
  }

  /**
   * Build human-readable explanation
   */
  private buildExplanation(
    wakeTime: string,
    sleepTime: string,
    hours: number,
    cycles: number,
    energyPattern: EnergyPatternType
  ): string {
    const energyPatternNames = {
      [EnergyPattern.MORNING_PERSON]: 'a Morning Person',
      [EnergyPattern.BALANCED]: 'Balanced',
      [EnergyPattern.NIGHT_OWL]: 'a Night Owl',
    };

    return (
      `Based on your wake time of ${wakeTime}, you're ${energyPatternNames[energyPattern]}. ` +
      `To get ${cycles} complete sleep cycles (${hours} hours of restorative sleep), ` +
      `you should aim to be asleep by ${sleepTime}. This aligns with your natural circadian rhythm ` +
      `and maximizes deep sleep, which is crucial for memory consolidation, muscle recovery, and cognitive performance.`
    );
  }

  /**
   * Get benefits specific to energy pattern and sleep duration
   */
  private getBenefits(energyPattern: EnergyPatternType, hours: number): string[] {
    const baseBenefits = [
      `${hours} hours of quality sleep for optimal brain function`,
      'Complete sleep cycles prevent grogginess from waking mid-cycle',
      'Consistent schedule regulates your circadian rhythm',
    ];

    const energyPatternBenefits = {
      [EnergyPattern.MORNING_PERSON]: [
        'Peak productivity during morning hours when focus is sharpest',
        'Natural alignment with traditional schedules',
        'More daylight exposure for better mood and vitamin D',
      ],
      [EnergyPattern.BALANCED]: [
        'Balanced energy throughout the day',
        'Flexibility to handle both morning and afternoon tasks',
        "Optimal for most people's natural rhythm",
      ],
      [EnergyPattern.NIGHT_OWL]: [
        'Peak creativity and problem-solving in afternoons/evenings',
        'Better suited for flexible work schedules',
        'Natural energy boost in late afternoon and evening',
      ],
    };

    return [...baseBenefits, ...energyPatternBenefits[energyPattern]];
  }

  /**
   * Get personalized tips based on energy pattern
   */
  private getTips(energyPattern: EnergyPatternType): string[] {
    const baseTips = [
      'Avoid screens 1 hour before bedtime',
      'Keep your bedroom cool (65-68°F / 18-20°C)',
      'Maintain the same sleep schedule on weekends',
    ];

    const energyPatternTips = {
      [EnergyPattern.MORNING_PERSON]: [
        'Schedule your most important work between 9 AM - 1 PM',
        'Get natural sunlight exposure early in the morning',
        'Avoid caffeine after 2 PM',
      ],
      [EnergyPattern.BALANCED]: [
        'Plan deep work sessions for late morning',
        'Take a short walk after lunch to boost afternoon energy',
        'Limit caffeine after 3 PM',
      ],
      [EnergyPattern.NIGHT_OWL]: [
        'Save your hardest work for afternoon/evening hours',
        'Use blue light blocking glasses if working late',
        'Avoid caffeine after 4 PM to ensure sleep quality',
      ],
    };

    return [...baseTips, ...energyPatternTips[energyPattern]];
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
