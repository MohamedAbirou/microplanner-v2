import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { AdvancedTasksController } from './advanced-tasks.controller';
import { AdvancedTasksService } from './advanced-tasks.service';
import { RecurringTaskService } from './recurring-task.service';
import { GoalsModule } from '../goals/goals.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { UsageLimitService } from '../../common/middleware/usage-limit.middleware';

@Module({
  imports: [GoalsModule, AnalyticsModule],
  controllers: [TasksController, AdvancedTasksController],
  providers: [TasksService, AdvancedTasksService, RecurringTaskService, UsageLimitService],
  exports: [TasksService, AdvancedTasksService, RecurringTaskService],
})
export class TasksModule {}
