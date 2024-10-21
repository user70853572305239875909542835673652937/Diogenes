import { redisCache } from "./cache";

/**
 * Initialize a Redis Cache instance
 */
export const cache = redisCache<any>();
