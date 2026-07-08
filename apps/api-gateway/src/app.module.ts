import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import IoRedis from 'ioredis';
import { RedisThrottlerStorage } from './common/redis-throttler.storage';
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
import { UserThrottlerGuard } from './common/guards/user-throttler.guard';
import { UsersModule } from './modules/users/users.module';
import { AiMemoryModule } from './modules/ai-memory/ai-memory.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { GoalsModule } from './modules/goals/goals.module';
import { PlansModule } from './modules/plans/plans.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { AutopilotModule } from './modules/autopilot/autopilot.module';
import { PushNotificationModule } from './modules/notifications/push-notification.module';
import { DailyRitualModule } from './modules/daily-ritual/daily-ritual.module';
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
      // Disable schema exposure in production — no playground, no introspection.
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
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

    // Rate limiting — enforced globally via UserThrottlerGuard (keyed by
    // authenticated user id, falling back to IP). Only one global throttler:
    // Nest applies every entry in `throttlers` to all routes unless skipped,
    // so expensive-route limits must use per-route @Throttle({ default: ... }).
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const throttlers = [
          {
            name: 'default',
            ttl: 60000, // 1 minute
            limit: 600, // per user/IP per minute — SPA dashboard bursts
          },
        ];

        // Multi-instance: back the limiter with Redis so limits are shared
        // across processes. Falls back to in-memory when REDIS_URL is unset.
        const redisUrl = config.get<string>('REDIS_URL');
        if (redisUrl) {
          try {
            const client = new IoRedis(redisUrl, {
              maxRetriesPerRequest: 2,
              enableOfflineQueue: false,
              lazyConnect: false,
              retryStrategy: (times: number) => (times > 3 ? null : Math.min(times * 50, 200)),
            });
            client.on('error', () => {
              /* handled by fail-open in the storage */
            });
            return { throttlers, storage: new RedisThrottlerStorage(client) };
          } catch {
            // Fall through to in-memory storage.
          }
        }
        return { throttlers };
      },
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
    AiMemoryModule,
    ReferralsModule,
    GoalsModule,
    PlansModule,
    TasksModule,
    CalendarModule,
    AutopilotModule,
    PushNotificationModule,
    DailyRitualModule,
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
    // MUST be registered before UserThrottlerGuard so req.user is populated
    // and the throttler can bucket by user id rather than IP.
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
    // Global rate-limit guard - keyed by authenticated user id (fallback IP).
    // Returns 429 + Retry-After. @SkipThrottle() on health probes.
    {
      provide: APP_GUARD,
      useClass: UserThrottlerGuard,
    },
    // Global subscription tier guard - enforces @RequireSubscription() decorator
    {
      provide: APP_GUARD,
      useClass: SubscriptionGuard,
    },
  ],
})
export class AppModule {}
