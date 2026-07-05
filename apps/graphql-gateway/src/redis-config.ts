export interface RedisConnectionConfig {
  host: string;
  port: number;
  password?: string;
}

/**
 * Resolve Redis connection settings from REDIS_URL or REDIS_HOST/PORT.
 * In production, skip localhost fallback when unset.
 */
export function resolveRedisConfig(): RedisConnectionConfig | null {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    try {
      const url = new URL(redisUrl);
      return {
        host: url.hostname,
        port: parseInt(url.port, 10) || 6379,
        password: url.password || process.env.REDIS_PASSWORD || undefined,
      };
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
