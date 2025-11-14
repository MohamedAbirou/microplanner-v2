import { Module } from '@nestjs/common';
import { WaitlistResolver } from './waitlist.resolver';
import { WaitlistService } from './waitlist.service';
import { DatabaseModule } from '../../database/database.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [DatabaseModule, EmailModule],
  providers: [WaitlistResolver, WaitlistService],
  exports: [WaitlistService],
})
export class WaitlistModule {}
