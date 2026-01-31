const analyticsService = require('../services/analyticsService');

/**
 * @desc    Get overall placement statistics
 * @route   GET /api/v1/analytics/overview
 * @access  Private (Admin, Officer)
 */
exports.getOverview = async (req, res, next) => {
    try {
        const { academicYear } = req.query;

        const stats = await analyticsService.getOverallStats(academicYear);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get department statistics
 * @route   GET /api/v1/analytics/department/:id
 * @access  Private
 */
exports.getDepartmentStats = async (req, res, next) => {
    try {
        const departmentId = parseInt(req.params.id);
        const { academicYear } = req.query;

        // Check authorization for non-admins
        if (req.user.role !== 'admin' && req.user.user_profile?.department_id !== departmentId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this department stats'
            });
        }

        const stats = await analyticsService.getDepartmentStats(departmentId, academicYear);

        if (!stats) {
            return res.status(404).json({
                success: false,
                message: 'No statistics found for this department'
            });
        }

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get company statistics
 * @route   GET /api/v1/analytics/companies
 * @access  Private (Admin, Officer)
 */
exports.getCompanyStats = async (req, res, next) => {
    try {
        const stats = await analyticsService.getCompanyStats();

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get placement trends
 * @route   GET /api/v1/analytics/trends
 * @access  Private (Admin, Officer)
 */
exports.getPlacementTrends = async (req, res, next) => {
    try {
        const { years } = req.query;

        const trends = await analyticsService.getPlacementTrend(parseInt(years) || 5);

        res.status(200).json({
            success: true,
            data: trends
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Refresh statistics cache
 * @route   POST /api/v1/analytics/refresh
 * @access  Private (Admin)
 */
exports.refreshCache = async (req, res, next) => {
    try {
        const { academicYear, departmentId } = req.body;

        await analyticsService.refreshStatsCache(
            academicYear || '2025-2026',
            departmentId ? parseInt(departmentId) : null
        );

        res.status(200).json({
            success: true,
            message: 'Statistics cache refreshed successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get student's own analytics
 * @route   GET /api/v1/analytics/me
 * @access  Private (Student)
 */
exports.getMyStats = async (req, res, next) => {
    try {
        const studentProfile = req.user.student_profile;

        if (!studentProfile) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        const prisma = require('../config/database');

        // Get application stats
        const applicationStats = await prisma.application.groupBy({
            by: ['status'],
            where: { student_id: studentProfile.id },
            _count: { id: true }
        });

        // Get interview stats
        const interviewStats = await prisma.interview.groupBy({
            by: ['status'],
            where: {
                application: { student_id: studentProfile.id }
            },
            _count: { id: true }
        });

        // Get recent applications
        const recentApplications = await prisma.application.findMany({
            where: { student_id: studentProfile.id },
            include: {
                job: {
                    include: { company: { select: { name: true, logo_url: true } } }
                }
            },
            orderBy: { applied_at: 'desc' },
            take: 5
        });

        // Get upcoming interviews
        const upcomingInterviews = await prisma.interview.findMany({
            where: {
                application: { student_id: studentProfile.id },
                scheduled_date: { gte: new Date() },
                status: { in: ['scheduled', 'rescheduled'] }
            },
            include: {
                application: {
                    include: {
                        job: { include: { company: true } }
                    }
                }
            },
            orderBy: { scheduled_date: 'asc' },
            take: 5
        });

        res.status(200).json({
            success: true,
            data: {
                applicationStats,
                interviewStats,
                recentApplications,
                upcomingInterviews,
                profileCompletion: studentProfile.profile_completed,
                placementStatus: studentProfile.placement_status
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = exports;
