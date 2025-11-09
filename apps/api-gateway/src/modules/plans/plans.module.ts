import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { RuleBasedPlannerService } from './strategies/rule-based-planner.service';
import { GPT4oMiniPlannerService } from './strategies/gpt-4o-mini-planner.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [HttpModule, EmailModule],
  controllers: [PlansController],
  providers: [PlansService, RuleBasedPlannerService, GPT4oMiniPlannerService],
  exports: [PlansService],
})
export class PlansModule {}
