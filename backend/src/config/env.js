require('dotenv').config();

/**
 * Environment configuration validation
 */
const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET'
];

// Validate required environment variables
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
}

module.exports = {
    // Server
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 5000,
    apiVersion: process.env.API_VERSION || 'v1',

    // Database
    databaseUrl: process.env.DATABASE_URL,

    // JWT
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    jwtCookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE) || 7,

    // Email
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD
    },
    fromEmail: process.env.FROM_EMAIL || 'noreply@placementcell.com',
    fromName: process.env.FROM_NAME || 'Placement Cell',

    // File Upload
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880,
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,jpg,jpeg,png').split(','),

    // AWS S3
    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        bucketName: process.env.AWS_BUCKET_NAME,
        region: process.env.AWS_REGION
    },

    // Frontend
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

    // Rate Limiting
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
};
