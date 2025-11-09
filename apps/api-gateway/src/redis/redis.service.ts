import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Redis Service for MicroPlanner
 *
 * Handles:
 * - Caching (user sessions, API responses)
 * - Rate limiting
 * - Pub/Sub (real-time updates)
 * - Job queue backing store (BullMQ)
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  private subscriber: Redis | null = null;

  constructor(private config: ConfigService) {
    this.client = new Redis({
      host: config.get('REDIS_HOST', 'localhost'),
      port: config.get('REDIS_PORT', 6379),
      password: config.get('REDIS_PASSWORD'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true,
      lazyConnect: false,
    });

    this.client.on('connect', () => {
      this.logger.log('✅ Redis connected');
    });

    this.client.on('error', (error) => {
      this.logger.error('❌ Redis connection error:', error);
    });

    this.client.on('ready', () => {
      this.logger.log('🚀 Redis ready for commands');
    });
  }

  // ==================== CACHING ====================

  /**
   * Get value from cache
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Get value as JSON
   */
  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Redis GET JSON error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      this.logger.error(`Redis SET error for key ${key}:`, error);
    }
  }

  /**
   * Set value as JSON
   */
  async setJSON(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const json = JSON.stringify(value);
      await this.set(key, json, ttl);
    } catch (error) {
      this.logger.error(`Redis SET JSON error for key ${key}:`, error);
    }
  }

  /**
   * Delete key
   */
  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Redis DEL error for key ${key}:`, error);
    }
  }

  /**
   * Delete keys by pattern
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      this.logger.error(`Redis DEL PATTERN error for pattern ${pattern}:`, error);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Set expiration on key
   */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      this.logger.error(`Redis EXPIRE error for key ${key}:`, error);
    }
  }

  // ==================== RATE LIMITING ====================

  /**
   * Check rate limit using sliding window
   * Returns true if request should be allowed
   */
  async rateLimit(key: string, limit: number, window: number): Promise<boolean> {
    try {
      const current = await this.client.incr(key);

      if (current === 1) {
        // First request, set expiration
        await this.client.expire(key, window);
      }

      return current <= limit;
    } catch (error) {
      this.logger.error(`Redis RATE LIMIT error for key ${key}:`, error);
      // On error, allow the request (fail open)
      return true;
    }
  }

  /**
   * Get remaining requests in rate limit window
   */
  async getRateLimitRemaining(key: string, limit: number): Promise<number> {
    try {
      const current = await this.client.get(key);
      const used = current ? parseInt(current, 10) : 0;
      return Math.max(0, limit - used);
    } catch (error) {
      this.logger.error(`Redis GET RATE LIMIT error for key ${key}:`, error);
      return limit; // On error, assume no usage
    }
  }

  // ==================== PUB/SUB ====================

  /**
   * Publish message to channel
   */
  async publish(channel: string, message: string): Promise<void> {
    try {
      await this.client.publish(channel, message);
    } catch (error) {
      this.logger.error(`Redis PUBLISH error for channel ${channel}:`, error);
    }
  }

  /**
   * Publish JSON message to channel
   */
  async publishJSON(channel: string, message: any): Promise<void> {
    try {
      await this.publish(channel, JSON.stringify(message));
    } catch (error) {
      this.logger.error(`Redis PUBLISH JSON error for channel ${channel}:`, error);
    }
  }

  /**
   * Subscribe to channel
   */
  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    try {
      if (!this.subscriber) {
        this.subscriber = this.client.duplicate();
      }

      await this.subscriber.subscribe(channel);
      this.subscriber.on('message', (ch, msg) => {
        if (ch === channel) {
          callback(msg);
        }
      });

      this.logger.log(`Subscribed to channel: ${channel}`);
    } catch (error) {
      this.logger.error(`Redis SUBSCRIBE error for channel ${channel}:`, error);
    }
  }

  /**
   * Unsubscribe from channel
   */
  async unsubscribe(channel: string): Promise<void> {
    try {
      if (this.subscriber) {
        await this.subscriber.unsubscribe(channel);
        this.logger.log(`Unsubscribed from channel: ${channel}`);
      }
    } catch (error) {
      this.logger.error(`Redis UNSUBSCRIBE error for channel ${channel}:`, error);
    }
  }

  // ==================== HASH OPERATIONS ====================

  /**
   * Set hash field
   */
  async hset(key: string, field: string, value: string): Promise<void> {
    try {
      await this.client.hset(key, field, value);
    } catch (error) {
      this.logger.error(`Redis HSET error for key ${key}:`, error);
    }
  }

  /**
   * Get hash field
   */
  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      this.logger.error(`Redis HGET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Get all hash fields
   */
  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      this.logger.error(`Redis HGETALL error for key ${key}:`, error);
      return {};
    }
  }

  /**
   * Delete hash field
   */
  async hdel(key: string, field: string): Promise<void> {
    try {
      await this.client.hdel(key, field);
    } catch (error) {
      this.logger.error(`Redis HDEL error for key ${key}:`, error);
    }
  }

  // ==================== LIST OPERATIONS ====================

  /**
   * Push to list (right)
   */
  async rpush(key: string, value: string): Promise<void> {
    try {
      await this.client.rpush(key, value);
    } catch (error) {
      this.logger.error(`Redis RPUSH error for key ${key}:`, error);
    }
  }

  /**
   * Pop from list (left)
   */
  async lpop(key: string): Promise<string | null> {
    try {
      return await this.client.lpop(key);
    } catch (error) {
      this.logger.error(`Redis LPOP error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Get list range
   */
  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lrange(key, start, stop);
    } catch (error) {
      this.logger.error(`Redis LRANGE error for key ${key}:`, error);
      return [];
    }
  }

  // ==================== SORTED SET OPERATIONS ====================

  /**
   * Add to sorted set
   */
  async zadd(key: string, score: number, member: string): Promise<void> {
    try {
      await this.client.zadd(key, score, member);
    } catch (error) {
      this.logger.error(`Redis ZADD error for key ${key}:`, error);
    }
  }

  /**
   * Get sorted set range by score
   */
  async zrangebyscore(key: string, min: number, max: number): Promise<string[]> {
    try {
      return await this.client.zrangebyscore(key, min, max);
    } catch (error) {
      this.logger.error(`Redis ZRANGEBYSCORE error for key ${key}:`, error);
      return [];
    }
  }

  // ==================== UTILITY ====================

  /**
   * Ping Redis
   */
  async ping(): Promise<boolean> {
    try {
      const response = await this.client.ping();
      return response === 'PONG';
    } catch (error) {
      this.logger.error('Redis PING error:', error);
      return false;
    }
  }

  /**
   * Get Redis info
   */
  async info(): Promise<string> {
    try {
      return await this.client.info();
    } catch (error) {
      this.logger.error('Redis INFO error:', error);
      return '';
    }
  }

  /**
   * Flush database (DANGER: clears all data!)
   */
  async flushdb(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      this.logger.warn('⚠️ FLUSHDB blocked in production!');
      return;
    }

    try {
      await this.client.flushdb();
      this.logger.warn('🗑️ Redis database flushed');
    } catch (error) {
      this.logger.error('Redis FLUSHDB error:', error);
    }
  }

  // ==================== CLEANUP ====================

  async onModuleDestroy() {
    this.logger.log('⏳ Closing Redis connections...');

    if (this.subscriber) {
      await this.subscriber.quit();
    }

    await this.client.quit();
    this.logger.log('✅ Redis connections closed');
  }
}
