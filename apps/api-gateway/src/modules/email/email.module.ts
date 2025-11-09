import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ReminderScheduler } from './reminder.scheduler';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [EmailService, ReminderScheduler],
  exports: [EmailService],
})
export class EmailModule {}
