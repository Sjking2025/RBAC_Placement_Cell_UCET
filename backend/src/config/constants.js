/**
 * Application configuration constants
 */

module.exports = {
    // Pagination defaults
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,

    // File upload
    UPLOAD_PATH: 'uploads',
    RESUME_PATH: 'uploads/resumes',
    PROFILE_PICTURE_PATH: 'uploads/profiles',
    COMPANY_LOGO_PATH: 'uploads/logos',
    ATTACHMENT_PATH: 'uploads/attachments',

    // Token expiry
    PASSWORD_RESET_EXPIRE: 3600000, // 1 hour
    EMAIL_VERIFICATION_EXPIRE: 86400000, // 24 hours

    // Batch configuration
    CURRENT_ACADEMIC_YEAR: '2025-2026',

    // Default values
    DEFAULT_CURRENCY: 'INR',
    DEFAULT_INTERVIEW_DURATION: 60, // minutes

    // API Response messages
    MESSAGES: {
        SUCCESS: 'Operation successful',
        CREATED: 'Resource created successfully',
        UPDATED: 'Resource updated successfully',
        DELETED: 'Resource deleted successfully',
        NOT_FOUND: 'Resource not found',
        UNAUTHORIZED: 'Not authorized to access this resource',
        FORBIDDEN: 'Access forbidden',
        VALIDATION_ERROR: 'Validation error',
        SERVER_ERROR: 'Internal server error'
    }
};
