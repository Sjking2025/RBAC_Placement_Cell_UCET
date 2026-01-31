require('dotenv').config();
const app = require('./app');
const prisma = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// Connect to database and start server
const startServer = async () => {
    try {
        // Test database connection
        await prisma.$connect();
        logger.info('Database connected successfully');

        // Start server
        const server = app.listen(PORT, () => {
            logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
            logger.info(`API available at http://localhost:${PORT}/api/${process.env.API_VERSION || 'v1'}`);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            logger.error('Unhandled Rejection:', err);
            server.close(() => {
                prisma.$disconnect();
                process.exit(1);
            });
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
            logger.error('Uncaught Exception:', err);
            prisma.$disconnect();
            process.exit(1);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger.info('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                prisma.$disconnect();
                logger.info('Server closed');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            logger.info('SIGINT received. Shutting down gracefully...');
            server.close(() => {
                prisma.$disconnect();
                logger.info('Server closed');
                process.exit(0);
            });
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
};

startServer();
