const cache = require('./cache');
const logger = require('./logger');

const TokenBlacklist = {
    /**
     * Add a JWT token to the blacklist
     * @param {string} token - The raw JWT token string
     * @param {number} expiresInSeconds - Remaining lifetime of the token in seconds
     * @returns {Promise<boolean>}
     */
    async blacklistToken(token, expiresInSeconds) {
        if (!token) return false;
        
        try {
            // Keep the token cached for the remainder of its expiration time
            cache.set(`blacklist:${token}`, true, expiresInSeconds);
            logger.warn('Token successfully blacklisted', {
                tokenSnippet: token.substring(0, 10) + '...'
            });
            return true;
        } catch (error) {
            logger.error('Failed to blacklist token in cache', { error: error.message });
            return false;
        }
    },

    /**
     * Check if a JWT token has been blacklisted
     * @param {string} token - The raw JWT token string
     * @returns {boolean}
     */
    isBlacklisted(token) {
        if (!token) return false;
        const result = cache.get(`blacklist:${token}`);
        return result === true;
    }
};

module.exports = TokenBlacklist;
