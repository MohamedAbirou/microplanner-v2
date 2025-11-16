import { Module } from '@nestjs/common';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import { UsageLimitService } from '../../common/middleware/usage-limit.middleware';

@Module({
  controllers: [GoalsController],
  providers: [GoalsService, UsageLimitService],
  exports: [GoalsService],
})
export class GoalsModule {}
