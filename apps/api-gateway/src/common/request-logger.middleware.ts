import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

/**
 * Assigns an x-request-id (honouring an inbound one) and emits one structured
 * JSON log line per request with method, path, status, and duration. Correlate
 * logs across services by the shared request id.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    const line = {
      level: res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
      service: 'api-gateway',
      requestId,
      method: req.method,
      path: (req.originalUrl || req.url || '').split('?')[0],
      status: res.statusCode,
      durationMs: Date.now() - start,
      time: new Date().toISOString(),
    };
    // Single-line JSON for log aggregators.
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(line));
  });

  next();
}
