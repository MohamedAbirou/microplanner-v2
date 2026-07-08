import Redis from 'ioredis';
import { Logger } from '@nestjs/common';
import type { ThrottlerStorage } from '@nestjs/throttler';
import type { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';

/**
 * Redis-backed ThrottlerStorage so per-user rate limits are shared across all
 * api-gateway instances (in-memory storage only limits per-process). Uses the
 * already-installed ioredis; falls back cleanly is handled by the caller (only
 * used when REDIS_URL is present).
 */
export class RedisThrottlerStorage implements ThrottlerStorage {
  private readonly logger = new Logger(RedisThrottlerStorage.name);
  private readonly prefix = 'throttle:';

  constructor(private readonly client: Redis) {}

  async increment(key: string, ttl: number): Promise<ThrottlerStorageRecord> {
    const redisKey = this.prefix + key;
    try {
      const totalHits = await this.client.incr(redisKey);
      if (totalHits === 1) {
        await this.client.pexpire(redisKey, ttl);
      }
      let pttl = await this.client.pttl(redisKey);
      if (pttl < 0) {
        // Key exists without an expiry (shouldn't happen) — reset the window.
        await this.client.pexpire(redisKey, ttl);
        pttl = ttl;
      }
      return { totalHits, timeToExpire: Math.ceil(pttl / 1000) };
    } catch (err) {
      // Never let a Redis blip take down request handling: fail open.
      this.logger.warn(`Throttler Redis error (failing open): ${err instanceof Error ? err.message : err}`);
      return { totalHits: 1, timeToExpire: Math.ceil(ttl / 1000) };
    }
  }
}
