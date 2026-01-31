const prisma = require('../config/database');
const { getPagination, formatPaginationResponse } = require('../utils/helpers');
const notificationService = require('../services/notificationService');

/**
 * @desc    Get announcements
 * @route   GET /api/v1/announcements
 * @access  Private
 */
exports.getAnnouncements = async (req, res, next) => {
    try {
        const { type, priority, pinned } = req.query;
        const { page, limit, skip } = getPagination(req.query.page, req.query.limit);

        const where = {
            published: true,
            OR: [
                { expires_at: null },
                { expires_at: { gt: new Date() } }
            ]
        };

        // Filter by role
        if (req.user.role !== 'admin') {
            where.target_roles = { has: req.user.role };
        }

        // Additional filters
        if (type) where.type = type;
        if (priority) where.priority = priority;
        if (pinned === 'true') where.is_pinned = true;

        const [announcements, total] = await Promise.all([
            prisma.announcement.findMany({
                where,
                include: {
                    creator: {
                        select: {
                            id: true,
                            email: true,
                            user_profile: { select: { first_name: true, last_name: true } }
                        }
                    }
                },
                skip,
                take: limit,
                orderBy: [
                    { is_pinned: 'desc' },
                    { created_at: 'desc' }
                ]
            }),
            prisma.announcement.count({ where })
        ]);

        res.status(200).json({
            success: true,
            data: announcements,
            pagination: formatPaginationResponse(total, page, limit)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single announcement
 * @route   GET /api/v1/announcements/:id
 * @access  Private
 */
exports.getAnnouncement = async (req, res, next) => {
    try {
        const announcementId = parseInt(req.params.id);

        const announcement = await prisma.announcement.findUnique({
            where: { id: announcementId },
            include: {
                creator: {
                    select: {
                        id: true,
                        email: true,
                        user_profile: { select: { first_name: true, last_name: true } }
                    }
                }
            }
        });

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        res.status(200).json({
            success: true,
            data: announcement
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create announcement
 * @route   POST /api/v1/announcements
 * @access  Private (Admin, Officer, Coordinator)
 */
exports.createAnnouncement = async (req, res, next) => {
    try {
        const {
            title,
            content,
            type,
            priority,
            targetRoles,
            targetDepartments,
            targetBatches,
            attachmentUrl,
            isPinned,
            expiresAt
        } = req.body;

        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                type: type || 'general',
                priority: priority || 'medium',
                target_roles: targetRoles || ['student', 'coordinator', 'dept_officer', 'admin'],
                target_departments: targetDepartments || [],
                target_batches: targetBatches || [],
                attachment_url: attachmentUrl,
                is_pinned: isPinned || false,
                expires_at: expiresAt ? new Date(expiresAt) : null,
                published: true,
                published_at: new Date(),
                created_by: req.user.id
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        email: true,
                        user_profile: { select: { first_name: true, last_name: true } }
                    }
                }
            }
        });

        // Get target users and send notifications
        const targetUsersWhere = {};
        if (targetRoles && targetRoles.length > 0) {
            targetUsersWhere.role = { in: targetRoles };
        }
        if (targetDepartments && targetDepartments.length > 0) {
            targetUsersWhere.user_profile = {
                department_id: { in: targetDepartments }
            };
        }

        const targetUsers = await prisma.user.findMany({
            where: targetUsersWhere,
            select: { id: true }
        });

        if (targetUsers.length > 0) {
            await notificationService.notifyAnnouncement(
                announcement,
                targetUsers.map(u => u.id)
            );
        }

        res.status(201).json({
            success: true,
            message: 'Announcement created successfully',
            data: announcement
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update announcement
 * @route   PUT /api/v1/announcements/:id
 * @access  Private (Admin, Officer, Creator)
 */
exports.updateAnnouncement = async (req, res, next) => {
    try {
        const announcementId = parseInt(req.params.id);

        const existing = await prisma.announcement.findUnique({
            where: { id: announcementId }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        // Check permission
        if (req.user.role !== 'admin' && existing.created_by !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this announcement'
            });
        }

        const updateData = {};
        const allowedFields = [
            'title', 'content', 'type', 'priority',
            'target_roles', 'target_departments', 'target_batches',
            'attachment_url', 'is_pinned', 'published', 'expires_at'
        ];

        const fieldMap = {
            targetRoles: 'target_roles',
            targetDepartments: 'target_departments',
            targetBatches: 'target_batches',
            attachmentUrl: 'attachment_url',
            isPinned: 'is_pinned',
            expiresAt: 'expires_at'
        };

        Object.keys(req.body).forEach(key => {
            const dbField = fieldMap[key] || key;
            if (allowedFields.includes(dbField)) {
                updateData[dbField] = dbField === 'expires_at' ? new Date(req.body[key]) : req.body[key];
            }
        });

        const announcement = await prisma.announcement.update({
            where: { id: announcementId },
            data: updateData,
            include: {
                creator: {
                    select: {
                        id: true,
                        email: true,
                        user_profile: { select: { first_name: true, last_name: true } }
                    }
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Announcement updated successfully',
            data: announcement
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete announcement
 * @route   DELETE /api/v1/announcements/:id
 * @access  Private (Admin, Creator)
 */
exports.deleteAnnouncement = async (req, res, next) => {
    try {
        const announcementId = parseInt(req.params.id);

        const existing = await prisma.announcement.findUnique({
            where: { id: announcementId }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        // Check permission
        if (req.user.role !== 'admin' && existing.created_by !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this announcement'
            });
        }

        await prisma.announcement.delete({
            where: { id: announcementId }
        });

        res.status(200).json({
            success: true,
            message: 'Announcement deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = exports;
