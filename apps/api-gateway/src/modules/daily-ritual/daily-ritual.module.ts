import { Module } from '@nestjs/common';
import { DailyRitualController } from './daily-ritual.controller';
import { DailyRitualService } from './daily-ritual.service';

@Module({
  controllers: [DailyRitualController],
  providers: [DailyRitualService],
  exports: [DailyRitualService],
})
export class DailyRitualModule {}
