const prisma = require('../config/database');
const logger = require('../utils/logger');

/**
 * Notification Service - Create and manage user notifications
 */

/**
 * Create a notification
 */
exports.createNotification = async (userId, type, title, message, link = null) => {
    try {
        const notification = await prisma.notification.create({
            data: {
                user_id: userId,
                type,
                title,
                message,
                link
            }
        });
        return notification;
    } catch (error) {
        logger.error('Failed to create notification:', error);
        throw error;
    }
};

/**
 * Create notifications for multiple users
 */
exports.createBulkNotifications = async (userIds, type, title, message, link = null) => {
    try {
        const notifications = await prisma.notification.createMany({
            data: userIds.map(userId => ({
                user_id: userId,
                type,
                title,
                message,
                link
            }))
        });
        return notifications;
    } catch (error) {
        logger.error('Failed to create bulk notifications:', error);
        throw error;
    }
};

/**
 * Notify about new job posting
 */
exports.notifyNewJob = async (job, eligibleStudentIds) => {
    const title = 'New Job Opportunity';
    const message = `${job.companies.name} is hiring for ${job.title}. Check eligibility and apply now!`;
    const link = `/jobs/${job.id}`;

    return this.createBulkNotifications(
        eligibleStudentIds,
        'job_posted',
        title,
        message,
        link
    );
};

/**
 * Notify about application status update
 */
exports.notifyApplicationUpdate = async (application, status) => {
    const statusMessages = {
        under_review: 'Your application is being reviewed',
        shortlisted: 'Congratulations! You have been shortlisted',
        rejected: 'Your application was not selected',
        interview_scheduled: 'Your interview has been scheduled',
        selected: 'Congratulations! You have been selected',
        offer_accepted: 'Your offer acceptance has been confirmed',
        offer_rejected: 'Your offer rejection has been recorded'
    };

    const message = statusMessages[status] || `Application status updated to: ${status}`;

    return this.createNotification(
        application.student.user_id,
        'application_update',
        'Application Update',
        message,
        `/applications/${application.id}`
    );
};

/**
 * Notify about interview scheduled
 */
exports.notifyInterviewScheduled = async (interview, studentUserId) => {
    const title = 'Interview Scheduled';
    const message = `Your ${interview.interview_type} interview is scheduled for ${interview.scheduled_date}`;
    const link = `/interviews/${interview.id}`;

    return this.createNotification(
        studentUserId,
        'interview_scheduled',
        title,
        message,
        link
    );
};

/**
 * Notify about announcement
 */
exports.notifyAnnouncement = async (announcement, targetUserIds) => {
    return this.createBulkNotifications(
        targetUserIds,
        'announcement',
        announcement.title,
        announcement.content.substring(0, 200) + (announcement.content.length > 200 ? '...' : ''),
        `/announcements/${announcement.id}`
    );
};

/**
 * Get user notifications
 */
exports.getUserNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false }) => {
    const skip = (page - 1) * limit;
    const where = { user_id: userId };

    if (unreadOnly) {
        where.read = false;
    }

    const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
            where,
            orderBy: { created_at: 'desc' },
            skip,
            take: limit
        }),
        prisma.notification.count({ where })
    ]);

    return {
        notifications,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Mark notification as read
 */
exports.markAsRead = async (notificationId, userId) => {
    return prisma.notification.updateMany({
        where: {
            id: notificationId,
            user_id: userId
        },
        data: {
            read: true,
            read_at: new Date()
        }
    });
};

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = async (userId) => {
    return prisma.notification.updateMany({
        where: {
            user_id: userId,
            read: false
        },
        data: {
            read: true,
            read_at: new Date()
        }
    });
};

/**
 * Get unread notification count
 */
exports.getUnreadCount = async (userId) => {
    return prisma.notification.count({
        where: {
            user_id: userId,
            read: false
        }
    });
};

module.exports = exports;
