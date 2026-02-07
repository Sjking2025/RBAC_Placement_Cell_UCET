const prisma = require('../config/database');
const logger = require('../utils/logger');

/**
 * @desc    Get user notifications
 * @route   GET /api/v1/notifications
 * @access  Private
 */
exports.getNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { limit = 20, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get notifications for user
        const notifications = await prisma.notification.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            take: parseInt(limit),
            skip
        });

        // Get unread count
        const unreadCount = await prisma.notification.count({
            where: {
                user_id: userId,
                read: false
            }
        });

        res.status(200).json({
            success: true,
            data: notifications,
            unreadCount
        });
    } catch (error) {
        // If notifications table doesn't exist, return empty
        if (error.code === 'P2021' || error.message.includes('does not exist')) {
            return res.status(200).json({
                success: true,
                data: [],
                unreadCount: 0
            });
        }
        logger.error('Failed to get notifications:', error);
        next(error);
    }
};

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/v1/notifications/:id/read
 * @access  Private
 */
exports.markAsRead = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const notificationId = parseInt(req.params.id);

        const notification = await prisma.notification.update({
            where: {
                id: notificationId,
                user_id: userId
            },
            data: { read: true }
        });

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
        next(error);
    }
};

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/v1/notifications/read-all
 * @access  Private
 */
exports.markAllAsRead = async (req, res, next) => {
    try {
        const userId = req.user.id;

        await prisma.notification.updateMany({
            where: {
                user_id: userId,
                read: false
            },
            data: { read: true }
        });

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        // If table doesn't exist, just return success
        if (error.code === 'P2021' || error.message.includes('does not exist')) {
            return res.status(200).json({
                success: true,
                message: 'All notifications marked as read'
            });
        }
        next(error);
    }
};

/**
 * @desc    Delete notification
 * @route   DELETE /api/v1/notifications/:id
 * @access  Private
 */
exports.deleteNotification = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const notificationId = parseInt(req.params.id);

        await prisma.notification.delete({
            where: {
                id: notificationId,
                user_id: userId
            }
        });

        res.status(200).json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
        next(error);
    }
};
