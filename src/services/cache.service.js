const Redis = require("ioredis");
const env = require("../config/env");

class CacheService {
  constructor() {
    this.redisClient = null;
    this.memoryCache = new Map();
    this.useRedis = false;

    if (env.cache.redisUrl) {
      try {
        this.redisClient = new Redis(env.cache.redisUrl, {
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false
        });
        this.redisClient.on("error", () => {
          this.useRedis = false;
        });
        this.useRedis = true;
      } catch (_error) {
        this.useRedis = false;
      }
    }
  }

  async get(key) {
    if (this.useRedis && this.redisClient) {
      const value = await this.redisClient.get(key);
      return value ? JSON.parse(value) : null;
    }

    const entry = this.memoryCache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key, value, ttlSeconds = env.cache.ttlSeconds) {
    if (this.useRedis && this.redisClient) {
      await this.redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
      return;
    }

    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  async delByPrefix(prefix) {
    if (this.useRedis && this.redisClient) {
      const keys = await this.redisClient.keys(`${prefix}*`);
      if (keys.length) {
        await this.redisClient.del(keys);
      }
      return;
    }

    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    }
  }
}

module.exports = new CacheService();
