import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { FeatureGateGuard } from './guards/feature-gate.guard';

@Module({
  imports: [ConfigModule],
  controllers: [BillingController],
  providers: [BillingService, FeatureGateGuard],
  exports: [BillingService, FeatureGateGuard],
})
export class BillingModule {}
