import { Module } from '@nestjs/common';
import { CalendarModule } from '../calendar/calendar.module';
import { PushNotificationModule } from '../notifications/push-notification.module';
import { AutopilotController } from './autopilot.controller';
import { AutopilotService } from './autopilot.service';
import { CalendarWatchService } from './calendar-watch.service';
import { DayRescheduleJob } from './day-reschedule.job';

@Module({
  imports: [CalendarModule, PushNotificationModule],
  controllers: [AutopilotController],
  providers: [AutopilotService, CalendarWatchService, DayRescheduleJob],
  exports: [AutopilotService],
})
export class AutopilotModule {}
