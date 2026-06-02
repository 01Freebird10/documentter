import { redisClient, isMockRedis } from '../config/redis.js';

/**
 * Intelligent Caching Layer for RepoMind AI
 * Stores technology stack footprints, AST maps, dashboard stats, and AI contexts.
 */
class CacheService {
  constructor() {
    this.localCache = new Map();
    this.enabled = true;
  }

  /**
   * Fetch item from cache
   * @param {string} key 
   */
  async get(key) {
    if (!this.enabled) return null;
    
    try {
      if (isMockRedis) {
        const item = this.localCache.get(key);
        if (!item) return null;
        if (item.expiry && item.expiry < Date.now()) {
          this.localCache.delete(key);
          return null;
        }
        return item.value;
      }
      
      const raw = await redisClient.get(key);
      if (!raw) return null;
      
      try {
        return JSON.parse(raw);
      } catch {
        return raw; // return raw string if not JSON
      }
    } catch (err) {
      console.warn(`[CACHE SERVICE ERROR] Failed to fetch cache key "${key}": ${err.message}`);
      return null;
    }
  }

  /**
   * Set item inside cache with TTL in seconds
   * @param {string} key 
   * @param {any} value 
   * @param {number} ttlSeconds 
   */
  async set(key, value, ttlSeconds = 3600) {
    if (!this.enabled) return 'OK';
    
    try {
      const dataToStore = typeof value === 'object' ? JSON.stringify(value) : value;
      
      if (isMockRedis) {
        const expiry = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null;
        this.localCache.set(key, { value, expiry });
        return 'OK';
      }
      
      if (ttlSeconds) {
        return await redisClient.set(key, dataToStore, 'EX', ttlSeconds);
      } else {
        return await redisClient.set(key, dataToStore);
      }
    } catch (err) {
      console.warn(`[CACHE SERVICE ERROR] Failed to write cache key "${key}": ${err.message}`);
      return 'FAIL';
    }
  }

  /**
   * Invalidate item from cache
   * @param {string} key 
   */
  async del(key) {
    if (!this.enabled) return 0;
    
    try {
      if (isMockRedis) {
        const existed = this.localCache.has(key);
        this.localCache.delete(key);
        return existed ? 1 : 0;
      }
      return await redisClient.del(key);
    } catch (err) {
      console.warn(`[CACHE SERVICE ERROR] Failed to delete cache key "${key}": ${err.message}`);
      return 0;
    }
  }

  /**
   * Delete keys matching a pattern (e.g. "projects:user123:*")
   * @param {string} pattern 
   */
  async invalidatePattern(pattern) {
    if (!this.enabled) return 0;
    
    try {
      if (isMockRedis) {
        let count = 0;
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        for (const key of this.localCache.keys()) {
          if (regex.test(key)) {
            this.localCache.delete(key);
            count++;
          }
        }
        return count;
      }
      
      const matchingKeys = await redisClient.keys(pattern);
      if (matchingKeys.length > 0) {
        for (const k of matchingKeys) {
          await redisClient.del(k);
        }
      }
      return matchingKeys.length;
    } catch (err) {
      console.warn(`[CACHE SERVICE ERROR] Failed to invalidate pattern "${pattern}": ${err.message}`);
      return 0;
    }
  }

  /**
   * Helper specifically for caching repository analysis outputs
   */
  async getOrSetAnalysis(projectId, fetchFn, ttl = 3600) {
    const key = `projects:${projectId}:analysis`;
    const cached = await this.get(key);
    if (cached) {
      console.log(`[CACHE HIT] AST Analysis retrieved from cache for Project: ${projectId}`);
      return cached;
    }
    
    const fresh = await fetchFn();
    await this.set(key, fresh, ttl);
    return fresh;
  }
}

export const cacheService = new CacheService();
export default cacheService;
