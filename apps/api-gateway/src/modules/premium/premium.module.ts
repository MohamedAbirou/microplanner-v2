import { Module } from '@nestjs/common';
import { PremiumController } from './premium.controller';
import { TeamsController } from './teams.controller';
import { PremiumService } from './premium.service';

@Module({
  controllers: [PremiumController, TeamsController],
  providers: [PremiumService],
  exports: [PremiumService],
})
export class PremiumModule {}
