import crypto from 'crypto';
// Make crypto globally available for @nestjs/schedule
(globalThis as any).crypto = crypto;

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  // Initialize Sentry (before any other code)
  const sentryDsn = process.env.SENTRY_DSN;
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: process.env.NODE_ENV || 'development',
      integrations: [
        nodeProfilingIntegration(),
      ],
      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in production, 100% in dev
      // Profiling
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    });
    console.log('✓ Sentry error tracking initialized');
  } else {
    console.log('⚠ Sentry DSN not configured, error tracking disabled');
  }

  // Winston logger configuration
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
            return `${timestamp} [${level}] ${context ? `[${context}]` : ''} ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
          })
        ),
      }),
    ],
  });

  const app = await NestFactory.create(AppModule, {
    logger,
  });

  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // CORS configuration
  const allowedOrigins = [
    'http://localhost:3000', // Next.js web app (dev)
    'http://localhost:3001', // Next.js web app (dev)
    'http://localhost:19006', // Expo web (dev)
    'exp://localhost:19000', // Expo mobile (dev)
  ];

  // Add production URLs if in production
  if (configService.get('NODE_ENV') === 'production') {
    const appUrl = configService.get<string>('APP_URL');
    if (appUrl) {
      allowedOrigins.push(appUrl);
    }
    // Add Vercel production URLs
    allowedOrigins.push('https://microplanner-web.vercel.app');
    allowedOrigins.push('https://microplanner-web-git-main.vercel.app'); // Git branch preview
  }

  // Allow all Vercel preview deployments in production
  const isVercelPreview = (origin: string) => {
    return origin?.includes('.vercel.app');
  };

  // Allow Railway/Render deployments
  const isAllowedPlatform = (origin: string) => {
    return origin?.includes('.vercel.app') ||
           origin?.includes('.railway.app') ||
           origin?.includes('.render.com') ||
           origin?.includes('localhost');
  };

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Allow all deployment platforms
      if (isAllowedPlatform(origin)) {
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'stripe-signature'],
  });

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global exception filter (error handling)
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('MicroPlanner API')
    .setDescription('Mobile-first AI weekly planner API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('health', 'Health check endpoints')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('goals', 'Goal management')
    .addTag('plans', 'Weekly plan generation')
    .addTag('tasks', 'Task management')
    .addTag('calendar', 'Calendar integration')
    .addTag('billing', 'Subscription and billing')
    .addTag('analytics', 'Analytics and insights')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT') || 3001;

  // Only listen if not in serverless environment
  if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
    await app.listen(port);

    logger.log(`
      🚀 MicroPlanner API Gateway is running!
      🔗 API: http://localhost:${port}/api
      📚 Docs: http://localhost:${port}/api/docs
      🌍 Environment: ${configService.get('NODE_ENV')}
    `);
  }

  return app;
}

// For local development
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  bootstrap();
}

// For Vercel serverless
export default async function handler(req: any, res: any) {
  const app = await bootstrap();
  const expressApp = app.getHttpAdapter().getInstance();
  return expressApp(req, res);
}
