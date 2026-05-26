/**
 * In-Memory Caching Utility
 * Wrapper around node-cache for consistent caching strategy
 */

const NodeCache = require('node-cache');
const logger = require('./logger');

class CacheService {
    constructor(ttlSeconds = 600) { // Default TTL: 10 minutes
        this.cache = new NodeCache({
            stdTTL: ttlSeconds,
            checkperiod: ttlSeconds * 0.2,
            useClones: false
        });

        logger.info('Cache service initialized', { defaultTTL: ttlSeconds });
    }

    /**
     * Get value from cache
     * @param {string} key - Cache key
     * @returns {any|undefined} Cached value or undefined
     */
    get(key) {
        const value = this.cache.get(key);
        if (value) {
            logger.debug(`Cache hit: ${key}`);
        } else {
            logger.debug(`Cache miss: ${key}`);
        }
        return value;
    }

    /**
     * Set value in cache
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} [ttl] - Optional TTL in seconds
     * @returns {boolean} Success status
     */
    set(key, value, ttl) {
        return this.cache.set(key, value, ttl);
    }

    /**
     * Delete value from cache
     * @param {string} key - Cache key
     * @returns {number} Number of deleted entries
     */
    del(key) {
        return this.cache.del(key);
    }

    /**
     * Flush entire cache
     */
    flush() {
        this.cache.flushAll();
        logger.info('Cache flushed');
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return this.cache.getStats();
    }

    /**
     * Get or set pattern
     * @param {string} key - Cache key
     * @param {Function} fetchFn - Async function to fetch data if miss
     * @param {number} [ttl] - Optional TTL
     */
    async getOrSet(key, fetchFn, ttl) {
        const value = this.get(key);
        if (value) return value;

        try {
            const result = await fetchFn();
            this.set(key, result, ttl);
            return result;
        } catch (error) {
            logger.error('Error in getOrSet fetch function', { key, error: error.message });
            throw error;
        }
    }
}

// Create singleton instance
const cache = new CacheService();

module.exports = cache;
