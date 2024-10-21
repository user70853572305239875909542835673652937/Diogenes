import { createClient } from "redis";
import logger from "./logger"; // Import the centralized logger

/**
 * Cache Interface
 */
interface Cache<T> {
  has: (key: string) => Promise<boolean>;
  get: (key: string) => Promise<T | null>;
  set: (key: string, value: T, ttlSeconds?: number) => Promise<void>;
  delete: (key: string) => Promise<void>;
}

/**
 * Initialize Redis Client
 */
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redisClient = createClient({
  url: redisUrl,
});

redisClient.on("error", (err) =>
  logger.error("Redis Client Error: " + err.message),
);

/**
 * Connect to Redis
 */
(async () => {
  try {
    await redisClient.connect();
    logger.info("Connected to Redis");
  } catch (error: any) {
    logger.error("Failed to connect to Redis: " + error.message);
  }
})();

/**
 * Create a Redis-based Cache
 */
export const createRedisCache = <T>(): Cache<T> => ({
  /**
   * Check if a key exists in Redis
   */
  has: async (key: string) => {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error: any) {
      logger.error(`Redis error on has(${key}): ${error.message}`);
      return false;
    }
  },

  /**
   * Get a value from Redis and deserialize it
   */
  get: async (key: string) => {
    try {
      const data = await redisClient.get(key);
      if (data) {
        logger.info(`Cache hit for key: ${key}`);
        return JSON.parse(data) as T;
      }
      logger.info(`Cache miss for key: ${key}`);
      return null;
    } catch (error: any) {
      logger.error(`Redis error on get(${key}): ${error.message}`);
      return null;
    }
  },

  /**
   * Set a value in Redis with optional TTL
   */
  set: async (key: string, value: T, ttlSeconds: number = 3600) => {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttlSeconds > 0) {
        await redisClient.set(key, serializedValue, {
          EX: ttlSeconds,
        });
        logger.info(
          `Set cache for key: ${key} with TTL: ${ttlSeconds} seconds`,
        );
      } else {
        await redisClient.set(key, serializedValue);
        logger.info(`Set cache for key: ${key} without TTL`);
      }
    } catch (error: any) {
      logger.error(`Redis error on set(${key}): ${error.message}`);
    }
  },

  /**
   * Delete a key from Redis
   */
  delete: async (key: string) => {
    try {
      await redisClient.del(key);
      logger.info(`Deleted cache for key: ${key}`);
    } catch (error: any) {
      logger.error(`Redis error on delete(${key}): ${error.message}`);
    }
  },
});
