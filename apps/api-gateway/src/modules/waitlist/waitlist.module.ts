import { Module } from '@nestjs/common';
import { WaitlistController } from './waitlist.controller';
import { WaitlistResolver } from './waitlist.resolver';
import { WaitlistService } from './waitlist.service';
import { DatabaseModule } from '../../database/database.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [DatabaseModule, EmailModule],
  controllers: [WaitlistController],
  providers: [WaitlistResolver, WaitlistService],
  exports: [WaitlistService],
})
export class WaitlistModule {}
