/**
 * Utility helper functions
 */

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @returns {string}
 */
exports.generateRandomString = (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Paginate results
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object}
 */
exports.getPagination = (page = 1, limit = 10) => {
    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (parsedPage - 1) * parsedLimit;

    return {
        page: parsedPage,
        limit: parsedLimit,
        skip
    };
};

/**
 * Format pagination response
 * @param {number} total - Total items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object}
 */
exports.formatPaginationResponse = (total, page, limit) => {
    return {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
    };
};

/**
 * Remove sensitive fields from user object
 * @param {object} user - User object
 * @returns {object}
 */
exports.sanitizeUser = (user) => {
    const { password_hash, reset_token, reset_token_expiry, verification_token, ...sanitized } = user;
    return sanitized;
};

/**
 * Check if value is empty
 * @param {any} value
 * @returns {boolean}
 */
exports.isEmpty = (value) => {
    return value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && Object.keys(value).length === 0);
};
