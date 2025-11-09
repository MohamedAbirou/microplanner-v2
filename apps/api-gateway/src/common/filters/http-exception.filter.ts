import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';

/**
 * Global HTTP Exception Filter
 * Catches all HTTP exceptions and formats them consistently
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determine status code and error message
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, any>;
        message = responseObj.message || message;
        error = responseObj.error || exception.name;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Log error details
    const errorLog = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
      ...(exception instanceof Error && { stack: exception.stack }),
    };

    // Log errors (not client errors like 4xx)
    if (status >= 500) {
      this.logger.error(
        `HTTP ${status} Error: ${JSON.stringify(errorLog)}`,
        exception instanceof Error ? exception.stack : undefined
      );

      // Capture in Sentry (only for 5xx errors)
      if (exception instanceof Error) {
        Sentry.captureException(exception, {
          contexts: {
            http: {
              method: request.method,
              url: request.url,
              status_code: status,
            },
          },
          tags: {
            endpoint: request.url,
            method: request.method,
          },
        });
      }
    } else {
      this.logger.warn(`HTTP ${status} Warning: ${JSON.stringify(errorLog)}`);
    }

    // Send formatted error response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
      message,
    });
  }
}
