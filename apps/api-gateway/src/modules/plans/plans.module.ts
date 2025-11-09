import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { RuleBasedPlannerService } from './strategies/rule-based-planner.service';

@Module({
  imports: [HttpModule],
  controllers: [PlansController],
  providers: [PlansService, RuleBasedPlannerService],
  exports: [PlansService],
})
export class PlansModule {}
