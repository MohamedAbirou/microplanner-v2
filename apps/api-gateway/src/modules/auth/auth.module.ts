import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { WebhookService } from './webhook.service';
import { AuthController } from './auth.controller';
import { ClerkStrategy } from './strategies/clerk.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ConfigModule, PassportModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService, WebhookService, ClerkStrategy],
  exports: [AuthService],
})
export class AuthModule {}
