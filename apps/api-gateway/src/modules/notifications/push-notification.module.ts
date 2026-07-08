import { Module } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';
import { PushScheduler } from './push.scheduler';
import { PushNotificationController } from './push-notification.controller';

/**
 * Web Push send pipeline: the send service plus the schedulers that fire
 * task-due / focus-start / morning-ritual pushes. Import this module wherever
 * you need to send a push (e.g. autopilot, plan automation).
 */
@Module({
  controllers: [PushNotificationController],
  providers: [PushNotificationService, PushScheduler],
  exports: [PushNotificationService],
})
export class PushNotificationModule {}
