import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { SlackService } from './slack.service';

@Module({
  controllers: [IntegrationsController],
  providers: [IntegrationsService, SlackService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
