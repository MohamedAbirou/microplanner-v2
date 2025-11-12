import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PatternRecognitionService } from './pattern-recognition.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, PatternRecognitionService],
  exports: [AnalyticsService, PatternRecognitionService],
})
export class AnalyticsModule {}
