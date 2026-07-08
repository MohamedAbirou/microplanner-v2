import { Module } from '@nestjs/common';
import { CalendarModule } from '../calendar/calendar.module';
import { ProductivityController } from './productivity.controller';
import { ProductivityService } from './productivity.service';
import { FocusCalendarSyncService } from './focus-calendar-sync.service';
import { CalendarDefenseExecutor } from './calendar-defense.executor';
import { HabitService } from './habit.service';

@Module({
  imports: [CalendarModule],
  controllers: [ProductivityController],
  providers: [ProductivityService, FocusCalendarSyncService, CalendarDefenseExecutor, HabitService],
  exports: [ProductivityService, HabitService],
})
export class ProductivityModule {}
