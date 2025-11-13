import { Module } from '@nestjs/common';
import { WaitlistResolver } from './waitlist.resolver';
import { WaitlistService } from './waitlist.service';

@Module({
  providers: [WaitlistResolver, WaitlistService],
  exports: [WaitlistService],
})
export class WaitlistModule {}
