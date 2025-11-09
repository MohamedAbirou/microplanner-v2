import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  HealthIndicatorResult,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../../database/prisma.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Simple health check endpoint' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  simpleHealthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('detailed')
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Detailed health check with database and system metrics' })
  @ApiResponse({ status: 200, description: 'Detailed health status' })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  detailedHealthCheck() {
    return this.health.check([
      // Database health
      async (): Promise<HealthIndicatorResult> => {
        try {
          // Simple database query to check connection
          await this.prisma.$queryRaw`SELECT 1`;
          return {
            database: {
              status: 'up',
            },
          };
        } catch (error) {
          return {
            database: {
              status: 'down',
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          };
        }
      },

      // Memory health (heap should not exceed 300MB)
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),

      // Memory health (RSS should not exceed 500MB)
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),

      // Disk health (should have at least 50% free space)
      () =>
        this.disk.checkStorage('disk', {
          path: '/',
          thresholdPercent: 0.5,
        }),
    ]);
  }

  @Get('liveness')
  @Public()
  @ApiOperation({ summary: 'Kubernetes liveness probe' })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  liveness() {
    return { status: 'ok' };
  }

  @Get('readiness')
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Kubernetes readiness probe' })
  @ApiResponse({ status: 200, description: 'Application is ready to serve traffic' })
  @ApiResponse({ status: 503, description: 'Application is not ready' })
  async readiness() {
    return this.health.check([
      // Check if database is accessible
      async (): Promise<HealthIndicatorResult> => {
        try {
          await this.prisma.$queryRaw`SELECT 1`;
          return {
            database: {
              status: 'up',
            },
          };
        } catch (error) {
          throw new Error('Database is not accessible');
        }
      },
    ]);
  }
}
