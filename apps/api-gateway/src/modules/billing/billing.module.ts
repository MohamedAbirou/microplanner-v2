import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { BillingReconciliationService } from './billing-reconciliation.service';
import { FeatureGateGuard } from './guards/feature-gate.guard';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [ConfigModule, EmailModule],
  controllers: [BillingController],
  providers: [BillingService, BillingReconciliationService, FeatureGateGuard],
  exports: [BillingService, BillingReconciliationService, FeatureGateGuard],
})
export class BillingModule {}
