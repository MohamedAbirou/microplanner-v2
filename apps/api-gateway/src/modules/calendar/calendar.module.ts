import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { GoogleOAuthService } from './services/google-oauth.service';
import { EncryptionService } from './services/encryption.service';

@Module({
  imports: [ConfigModule],
  controllers: [CalendarController],
  providers: [CalendarService, GoogleOAuthService, EncryptionService],
  exports: [CalendarService, GoogleOAuthService],
})
export class CalendarModule {}
