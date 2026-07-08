import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { GoogleOAuthService } from './services/google-oauth.service';
import { OutlookOAuthService } from './services/outlook-oauth.service';
import { GoogleCalendarProvider } from './services/google-calendar.provider';
import { OutlookCalendarProvider } from './services/outlook-calendar.provider';
import { EncryptionService } from './services/encryption.service';
import { CalendarWatchChannelService } from './services/calendar-watch-channel.service';

@Module({
  imports: [ConfigModule],
  controllers: [CalendarController],
  providers: [
    CalendarService,
    GoogleOAuthService,
    OutlookOAuthService,
    GoogleCalendarProvider,
    OutlookCalendarProvider,
    EncryptionService,
    CalendarWatchChannelService,
  ],
  exports: [
    CalendarService,
    GoogleOAuthService,
    OutlookOAuthService,
    CalendarWatchChannelService,
  ],
})
export class CalendarModule {}
