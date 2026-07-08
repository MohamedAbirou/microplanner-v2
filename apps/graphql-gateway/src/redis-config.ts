export interface RedisConnectionConfig {
  host: string;
  port: number;
  password?: string;
  username?: string;
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
 * Resolve Redis connection settings from REDIS_URL or REDIS_HOST/PORT.
 * In production, skip localhost fallback when unset.
 */
export function resolveRedisConfig(): RedisConnectionConfig | null {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    try {
      return configFromRedisUrl(redisUrl, process.env.REDIS_PASSWORD);
    } catch {
      // fall through
    }
  }

  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT;

  if (host || port) {
    return {
      host: host || 'localhost',
      port: port ? parseInt(port, 10) : 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    };
  }

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return {
    host: 'localhost',
    port: 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  };
}
