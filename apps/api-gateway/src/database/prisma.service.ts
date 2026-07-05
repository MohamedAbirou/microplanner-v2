import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@microplanner/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });

    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      this.$on('query' as never, (e: any) => {
        this.logger.debug(`Query: ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`);
      });
    }

    this.$on('error' as never, (e: any) => {
      this.logger.error(`Prisma Error: ${e.message}`);
    });

    this.$on('warn' as never, (e: any) => {
      this.logger.warn(`Prisma Warning: ${e.message}`);
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✓ Database connected');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (message.includes('tenant/user') && message.includes('not found')) {
        this.logger.error(
          'DATABASE_URL points to a Neon user/project that no longer exists (tenant/user not found). ' +
            'In Render: create a Postgres database, set DATABASE_URL to its Internal URL, ' +
            'and set DIRECT_URL to the same value. Remove any stale Neon connection strings.',
        );
      } else if (!process.env.DIRECT_URL) {
        this.logger.error(
          'DIRECT_URL is not set. Prisma requires it alongside DATABASE_URL. ' +
            'For Render Postgres, set DIRECT_URL to the same connection string as DATABASE_URL.',
        );
      } else if (
        message.includes('ENOTFOUND') ||
        message.includes('ECONNREFUSED') ||
        message.includes('Environment variable not found')
      ) {
        this.logger.error(
          'Cannot connect to Postgres. Verify DATABASE_URL and DIRECT_URL in Render environment variables.',
        );
      }

      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('✗ Database disconnected');
  }

  async enableShutdownHooks(app: any) {
    this.$on('beforeExit' as never, async () => {
      await app.close();
    });
  }
}
