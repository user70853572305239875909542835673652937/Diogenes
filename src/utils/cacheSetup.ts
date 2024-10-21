import { createRedisCache } from "./cache";

/**
 * Initialize a Redis Cache instance
 */
export const cache = createRedisCache<any>();
