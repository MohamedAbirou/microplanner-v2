import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { PlanAutomationService } from './plan-automation.service';
import { PlanTemplatesService } from './plan-templates.service';
import { RuleBasedPlannerService } from './strategies/rule-based-planner.service';
import { GPT4oMiniPlannerService } from './strategies/gpt-4o-mini-planner.service';
import { ClaudeSonnetPlannerService } from './strategies/claude-sonnet-planner.service';
import { EmailModule } from '../email/email.module';
import { CalendarModule } from '../calendar/calendar.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AiMemoryModule } from '../ai-memory/ai-memory.module';
import { UsageLimitService } from '../../common/middleware/usage-limit.middleware';

@Module({
  imports: [HttpModule, EmailModule, CalendarModule, AnalyticsModule, AiMemoryModule],
  controllers: [PlansController],
  providers: [
    PlansService,
    PlanAutomationService,
    PlanTemplatesService,
    RuleBasedPlannerService,
    GPT4oMiniPlannerService,
    ClaudeSonnetPlannerService,
    UsageLimitService,
  ],
  exports: [PlansService, PlanAutomationService, PlanTemplatesService],
})
export class PlansModule {}
