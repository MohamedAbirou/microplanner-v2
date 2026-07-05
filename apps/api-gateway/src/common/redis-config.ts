import { ConfigService } from '@nestjs/config';

export interface RedisConnectionConfig {
  host: string;
  port: number;
  password?: string;
}

/**
 * Resolve Redis connection settings.
 * In production, do not fall back to localhost — return null so callers skip Redis.
 */
export function resolveRedisConfig(
  config: ConfigService,
): RedisConnectionConfig | null {
  const redisUrl = config.get<string>('REDIS_URL');

  if (redisUrl) {
    try {
      const url = new URL(redisUrl);
      return {
        host: url.hostname,
        port: parseInt(url.port, 10) || 6379,
        password: url.password || config.get<string>('REDIS_PASSWORD') || undefined,
      };
    } catch {
      // Invalid URL — fall through to explicit host/port or production skip
    }
  }

  const host = config.get<string>('REDIS_HOST');
  const port = config.get<number>('REDIS_PORT');

  if (host || port) {
    return {
      host: host || 'localhost',
      port: port || 6379,
      password: config.get<string>('REDIS_PASSWORD') || undefined,
    };
  }

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return {
    host: 'localhost',
    port: 6379,
    password: config.get<string>('REDIS_PASSWORD') || undefined,
  };
}
