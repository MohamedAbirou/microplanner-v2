import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * Global Logging Interceptor
 * Logs all HTTP requests and responses with timing information
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getResponse<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, ip } = request;

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - now;
          const statusCode = response.statusCode;

          // Different log levels based on status code
          if (statusCode >= 500) {
            this.logger.error(
              `${method} ${url} ${statusCode} - ${duration}ms - ${ip}`
            );
          } else if (statusCode >= 400) {
            this.logger.warn(
              `${method} ${url} ${statusCode} - ${duration}ms - ${ip}`
            );
          } else {
            this.logger.log(
              `${method} ${url} ${statusCode} - ${duration}ms - ${ip}`
            );
          }
        },
        error: (error) => {
          const duration = Date.now() - now;
          const statusCode = error.status || 500;

          this.logger.error(
            `${method} ${url} ${statusCode} - ${duration}ms - ${ip} - ${error.message}`,
            error.stack
          );
        },
      })
    );
  }
}
