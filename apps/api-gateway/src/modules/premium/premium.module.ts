import { Module } from '@nestjs/common';
import { PremiumController } from './premium.controller';
import { TeamsController } from './teams.controller';
import { PremiumService } from './premium.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [PremiumController, TeamsController],
  providers: [PremiumService],
  exports: [PremiumService],
})
export class PremiumModule {}
