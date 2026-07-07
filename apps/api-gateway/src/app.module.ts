import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClerkAuthGuard } from './modules/auth/guards/clerk-auth.guard';
import { SubscriptionGuard } from './modules/auth/guards/subscription.guard';
import { UsersModule } from './modules/users/users.module';
import { GoalsModule } from './modules/goals/goals.module';
import { PlansModule } from './modules/plans/plans.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { BillingModule } from './modules/billing/billing.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { HealthModule } from './modules/health/health.module';
import { EmailModule } from './modules/email/email.module';
import { PremiumModule } from './modules/premium/premium.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { ProductivityModule } from './modules/productivity/productivity.module';
import { RedisModule } from './redis/redis.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';

/**
 * Maps HTTP status codes to GraphQL error codes
 */
function getGraphQLErrorCode(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHENTICATED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'UNPROCESSABLE_ENTITY';
    case 429:
      return 'TOO_MANY_REQUESTS';
    case 500:
      return 'INTERNAL_SERVER_ERROR';
    case 503:
      return 'SERVICE_UNAVAILABLE';
    default:
      return 'INTERNAL_SERVER_ERROR';
  }
}

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Cron Jobs
    ScheduleModule.forRoot(),

    // GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      context: ({ req }) => ({ req }),
      formatError: (error: GraphQLError): GraphQLFormattedError => {
        // Extract the original error from NestJS
        const originalError = error.extensions?.originalError as any;

        // Handle NestJS HTTP exceptions (ConflictException, BadRequestException, etc.)
        if (originalError?.statusCode) {
          return {
            message: originalError.message || error.message,
            extensions: {
              code: getGraphQLErrorCode(originalError.statusCode),
              statusCode: originalError.statusCode,
              error: originalError.error || 'Error',
            },
            locations: error.locations,
            path: error.path,
          };
        }

        // Default error formatting
        return {
          message: error.message,
          extensions: {
            code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
          },
          locations: error.locations,
          path: error.path,
        };
      },
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (_config: ConfigService) => [
        {
          ttl: 60000, // 1 minute
          limit: 600, // generous for SPA navigation bursts (guard not global yet)
        },
      ],
    }),

    // Bull Queue (Redis) - Optional, gracefully degrades if Redis unavailable
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        // Parse REDIS_URL if provided, otherwise use individual config vars
        const redisUrl = configService.get('REDIS_URL');
        let redisConfig: any;

        if (redisUrl) {
          try {
            const url = new URL(redisUrl);
            redisConfig = {
              host: url.hostname,
              port: parseInt(url.port) || 6379,
              password: url.password || configService.get('REDIS_PASSWORD'),
            };
          } catch (error) {
            redisConfig = {
              host: configService.get('REDIS_HOST') || 'localhost',
              port: configService.get('REDIS_PORT') || 6379,
              password: configService.get('REDIS_PASSWORD'),
            };
          }
        } else {
          redisConfig = {
            host: configService.get('REDIS_HOST') || 'localhost',
            port: configService.get('REDIS_PORT') || 6379,
            password: configService.get('REDIS_PASSWORD'),
          };
        }

        return {
          redis: {
            ...redisConfig,
            maxRetriesPerRequest: 3,
            enableOfflineQueue: false,
            retryStrategy: (times: number) => {
              if (times > 3) return null; // Give up after 3 retries
              return Math.min(times * 50, 200);
            },
          },
        };
      },
    }),

    // Database
    DatabaseModule,

    // Redis (Global module for caching, rate limiting, pub/sub)
    RedisModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    GoalsModule,
    PlansModule,
    TasksModule,
    CalendarModule,
    BillingModule,
    AnalyticsModule,
    PremiumModule,
    SchedulingModule,
    IntegrationsModule,
    ProductivityModule,
    HealthModule,
    EmailModule,
    OnboardingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global authentication guard - all routes require auth unless marked with @Public()
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
    // Global subscription tier guard - enforces @RequireSubscription() decorator
    {
      provide: APP_GUARD,
      useClass: SubscriptionGuard,
    },
  ],
})
export class AppModule {}
