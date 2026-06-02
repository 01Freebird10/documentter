import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient = null;
let isMockRedis = false;

// Robust In-Memory Mock Redis Client to guarantee execution in localized/test setups without a Redis daemon
class MockRedis {
  constructor() {
    this.store = new Map();
    console.log('[REDIS MOCK] Initialized fully functional in-memory Mock Redis connection.');
  }

  async get(key) {
    return this.store.get(key) || null;
  }

  async set(key, value, expiryMode, time) {
    this.store.set(key, value);
    if (expiryMode === 'EX' && time) {
      setTimeout(() => {
        this.store.delete(key);
      }, time * 1000);
    }
    return 'OK';
  }

  async del(key) {
    const existed = this.store.has(key);
    this.store.delete(key);
    return existed ? 1 : 0;
  }

  async incr(key) {
    let val = parseInt(this.store.get(key) || 0, 10);
    val++;
    this.store.set(key, val.toString());
    return val;
  }

  async decr(key) {
    let val = parseInt(this.store.get(key) || 0, 10);
    val--;
    this.store.set(key, val.toString());
    return val;
  }

  async keys(pattern) {
    const allKeys = Array.from(this.store.keys());
    if (!pattern || pattern === '*') return allKeys;
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return allKeys.filter(k => regex.test(k));
  }

  async ping() {
    return 'PONG';
  }

  async quit() {
    return 'OK';
  }

  on(event, callback) {
    // Mock event emitter interface
    if (event === 'connect' || event === 'ready') {
      setTimeout(callback, 50);
    }
    return this;
  }
}

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

try {
  if (process.env.USE_MOCK_REDIS === 'true') {
    redisClient = new MockRedis();
    isMockRedis = true;
  } else {
    // Attempt standard connection
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      connectTimeout: 2000,
      reconnectOnError: () => false,
      retryStrategy: (times) => {
        if (times > 2) {
          console.warn('[REDIS WARNING] Connection attempts exceeded limit. Engaging Mock Redis Fallback...');
          isMockRedis = true;
          redisClient = new MockRedis();
          return null; // Stop retrying connection
        }
        return Math.min(times * 100, 1000);
      }
    });

    redisClient.on('error', (err) => {
      console.warn(`[REDIS CONNECTION ERROR] Redis failed or offline: ${err.message}`);
      if (!isMockRedis) {
        console.warn('[REDIS FAILOVER] Swapping connection to in-memory Mock Redis...');
        isMockRedis = true;
        redisClient = new MockRedis();
      }
    });

    redisClient.on('connect', () => {
      if (!isMockRedis) {
        console.log(`[REDIS] Connected successfully to Redis database at ${REDIS_URL}`);
      }
    });
  }
} catch (error) {
  console.warn(`[REDIS CONFIG EXCEPTION] Catch-all engaged: ${error.message}. Enabling mock client.`);
  redisClient = new MockRedis();
  isMockRedis = true;
}

export { redisClient, isMockRedis };
export default redisClient;
