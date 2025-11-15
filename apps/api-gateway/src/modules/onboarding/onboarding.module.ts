import { Module } from '@nestjs/common';
import { OnboardingResolver } from './onboarding.resolver';
import { SleepScienceService } from './sleep-science.service';
import { GoalSuggestionService } from './goal-suggestion.service';
import { UsersModule } from '../users/users.module';
import { GoalsModule } from '../goals/goals.module';

@Module({
  imports: [UsersModule, GoalsModule],
  providers: [OnboardingResolver, SleepScienceService, GoalSuggestionService],
  exports: [SleepScienceService, GoalSuggestionService],
})
export class OnboardingModule {}
