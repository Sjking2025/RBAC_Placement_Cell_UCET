const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * File Service - Handle file uploads and storage
 */

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Create upload directories
const uploadDirs = [
    'uploads',
    'uploads/resumes',
    'uploads/profiles',
    'uploads/logos',
    'uploads/attachments'
];

uploadDirs.forEach(dir => {
    ensureDirectoryExists(path.join(__dirname, '../../', dir));
});

/**
 * Get file URL
 */
exports.getFileUrl = (filename, type = 'default') => {
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const paths = {
        resume: 'uploads/resumes',
        profile: 'uploads/profiles',
        logo: 'uploads/logos',
        attachment: 'uploads/attachments',
        default: 'uploads'
    };

    return `${baseUrl}/${paths[type] || paths.default}/${filename}`;
};

/**
 * Delete file
 */
exports.deleteFile = async (filePath) => {
    try {
        const fullPath = path.join(__dirname, '../../', filePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            logger.info(`File deleted: ${filePath}`);
            return true;
        }
        return false;
    } catch (error) {
        logger.error('Failed to delete file:', error);
        throw error;
    }
};

/**
 * Get file info
 */
exports.getFileInfo = (filePath) => {
    try {
        const fullPath = path.join(__dirname, '../../', filePath);
        if (fs.existsSync(fullPath)) {
            const stats = fs.statSync(fullPath);
            return {
                exists: true,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime
            };
        }
        return { exists: false };
    } catch (error) {
        logger.error('Failed to get file info:', error);
        return { exists: false };
    }
};

/**
 * Validate file type
 */
exports.validateFileType = (filename, allowedTypes) => {
    const ext = path.extname(filename).toLowerCase().slice(1);
    return allowedTypes.includes(ext);
};

/**
 * Get file extension
 */
exports.getFileExtension = (filename) => {
    return path.extname(filename).toLowerCase().slice(1);
};

/**
 * Generate unique filename
 */
exports.generateUniqueFilename = (originalFilename) => {
    const ext = path.extname(originalFilename);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${timestamp}-${random}${ext}`;
};

module.exports = exports;
