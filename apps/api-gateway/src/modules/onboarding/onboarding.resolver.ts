import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@microplanner/database';
import { SleepScienceService } from './sleep-science.service';
import { GoalSuggestionService } from './goal-suggestion.service';
import { UsersService } from '../users/users.service';
import { GoalsService } from '../goals/goals.service';
import {
  SleepRecommendationOutput,
  GoalSuggestion,
  CalculateSleepInput,
  GetGoalSuggestionsInput,
  CompleteOnboardingInput,
  UpdateOnboardingProgressInput,
} from './dto/onboarding.dto';

/**
 * Onboarding GraphQL Resolver
 *
 * Handles all onboarding-related queries and mutations
 */
@Resolver()
@UseGuards(ClerkAuthGuard)
export class OnboardingResolver {
  private readonly logger = new Logger(OnboardingResolver.name);

  constructor(
    private sleepScienceService: SleepScienceService,
    private goalSuggestionService: GoalSuggestionService,
    private usersService: UsersService,
    private goalsService: GoalsService,
  ) {}

  /**
   * Calculate sleep recommendation based on wake time
   */
  @Query(() => SleepRecommendationOutput, { name: 'calculateSleepRecommendation' })
  async calculateSleepRecommendation(
    @Args('input') input: CalculateSleepInput,
  ): Promise<SleepRecommendationOutput> {
    this.logger.debug(`Calculating sleep recommendation for wake time: ${input.wakeTime}`);
    return this.sleepScienceService.calculateSleepRecommendation(input.wakeTime, input.timezone);
  }

  /**
   * Get AI-powered goal suggestions
   */
  @Query(() => [GoalSuggestion], { name: 'getGoalSuggestions' })
  async getGoalSuggestions(
    @Args('input') input: GetGoalSuggestionsInput,
  ): Promise<GoalSuggestion[]> {
    this.logger.debug(`Getting goal suggestions for context: ${input.context}`);
    return this.goalSuggestionService.generateGoalSuggestions(input.context, input.focusAreas);
  }

  /**
   * Update onboarding progress (auto-save)
   */
  @Mutation(() => Boolean, { name: 'updateOnboardingProgress' })
  async updateOnboardingProgress(
    @CurrentUser() user: User,
    @Args('input') input: UpdateOnboardingProgressInput,
  ): Promise<boolean> {
    this.logger.debug(`Updating onboarding progress for user ${user.id}, step: ${input.step}`);

    await this.usersService.update(user.id, {
      onboardingStep: input.step,
      ...(input.context && { context: input.context }),
      ...(input.focusAreas && { focusAreas: input.focusAreas }),
      ...(input.wakeTime && { wakeTime: input.wakeTime }),
      ...(input.timezone && { timezone: input.timezone }),
    });

    return true;
  }

  /**
   * Complete onboarding and create first goal
   */
  @Mutation(() => Boolean, { name: 'completeOnboarding' })
  async completeOnboarding(
    @CurrentUser() user: User,
    @Args('input') input: CompleteOnboardingInput,
  ): Promise<boolean> {
    this.logger.log(`Completing onboarding for user ${user.id}`);

    // Calculate sleep recommendations
    const sleepRec = this.sleepScienceService.calculateSleepRecommendation(
      input.wakeTime,
      input.timezone,
    );

    // Update user profile with onboarding data
    await this.usersService.update(user.id, {
      context: input.context,
      focusAreas: input.focusAreas,
      timezone: input.timezone,
      wakeTime: input.wakeTime,
      sleepTime: sleepRec.optimalSleepTime,
      energyPattern: sleepRec.chronotype,
      productivityPeaks: [sleepRec.productivityWindow.peak],
      onboardingCompleted: true,
      onboardingStep: 5,
    });

    // Create first goal
    await this.goalsService.create(user.id, {
      title: input.firstGoalTitle,
      description: input.firstGoalDescription || '',
      targetDate: this.calculateTargetDate(), // 2 weeks from now
      priority: 'high',
    });

    this.logger.log(`Onboarding completed for user ${user.id}`);
    return true;
  }

  /**
   * Calculate default target date (2 weeks from now)
   */
  private calculateTargetDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date;
  }
}
