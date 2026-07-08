import { Module } from '@nestjs/common';
import { CalendarModule } from '../calendar/calendar.module';
import { PushNotificationModule } from '../notifications/push-notification.module';
import { AiMemoryModule } from '../ai-memory/ai-memory.module';
import { AutopilotController } from './autopilot.controller';
import { CalendarWebhookController } from './calendar-webhook.controller';
import { AutopilotService } from './autopilot.service';
import { CalendarWatchService } from './calendar-watch.service';
import { DayRescheduleJob } from './day-reschedule.job';

@Module({
  imports: [CalendarModule, PushNotificationModule, AiMemoryModule],
  controllers: [AutopilotController, CalendarWebhookController],
  providers: [AutopilotService, CalendarWatchService, DayRescheduleJob],
  exports: [AutopilotService],
})
export class AutopilotModule {}
