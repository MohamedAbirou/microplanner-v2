import { ConfigService } from '@nestjs/config';

export interface RedisConnectionConfig {
  host: string;
  port: number;
  password?: string;
  username?: string;
  /** Required for Upstash and other TLS Redis hosts (rediss:// URLs). */
  tls?: Record<string, never>;
}

function configFromRedisUrl(redisUrl: string, fallbackPassword?: string): RedisConnectionConfig {
  const url = new URL(redisUrl);
  const useTls = url.protocol === 'rediss:';
  return {
    host: url.hostname,
    port: parseInt(url.port, 10) || 6379,
    username: url.username || undefined,
    password: url.password || fallbackPassword || undefined,
    ...(useTls ? { tls: {} } : {}),
  };
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
      return configFromRedisUrl(redisUrl, config.get<string>('REDIS_PASSWORD'));
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
