const prisma = require('../config/database');
const { getPagination, formatPaginationResponse } = require('../utils/helpers');
const notificationService = require('../services/notificationService');

/**
 * @desc    Get applications
 * @route   GET /api/v1/applications
 * @access  Private
 */
exports.getApplications = async (req, res, next) => {
    try {
        const { status, jobId, studentId } = req.query;
        const { page, limit, skip } = getPagination(req.query.page, req.query.limit);

        const where = {};

        // Role-based filtering
        if (req.user.role === 'student') {
            where.student_id = req.user.student_profile?.id;
        } else if (req.user.role !== 'admin') {
            // Dept officers/coordinators see their department's students
            where.student = {
                department_id: req.user.user_profile?.department_id
            };
        }

        // Additional filters
        if (status) where.status = status;
        if (jobId) where.job_id = parseInt(jobId);
        if (studentId && req.user.role !== 'student') where.student_id = parseInt(studentId);

        const [applications, total] = await Promise.all([
            prisma.application.findMany({
                where,
                include: {
                    job: {
                        include: {
                            company: { select: { id: true, name: true, logo_url: true } }
                        }
                    },
                    student: {
                        include: {
                            user: { select: { email: true, user_profile: true } },
                            department: true
                        }
                    },
                    interviews: {
                        orderBy: { scheduled_date: 'desc' }
                    }
                },
                skip,
                take: limit,
                orderBy: { applied_at: 'desc' }
            }),
            prisma.application.count({ where })
        ]);

        res.status(200).json({
            success: true,
            data: applications,
            pagination: formatPaginationResponse(total, page, limit)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single application
 * @route   GET /api/v1/applications/:id
 * @access  Private
 */
exports.getApplication = async (req, res, next) => {
    try {
        const applicationId = parseInt(req.params.id);

        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                job: {
                    include: {
                        company: true
                    }
                },
                student: {
                    include: {
                        user: { select: { email: true, user_profile: true } },
                        department: true,
                        skills: true,
                        projects: true,
                        certifications: true,
                        internships: true
                    }
                },
                interviews: {
                    orderBy: { scheduled_date: 'desc' }
                },
                reviewer: {
                    select: {
                        id: true,
                        email: true,
                        user_profile: { select: { first_name: true, last_name: true } }
                    }
                }
            }
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check authorization
        if (req.user.role === 'student' && application.student.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this application'
            });
        }

        // Department isolation for officers
        if (req.user.role === 'dept_officer' && application.student.department_id !== req.user.user_profile?.department_id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this application'
            });
        }

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update application status
 * @route   PATCH /api/v1/applications/:id/status
 * @access  Private (Admin, Officer, Coordinator)
 */
exports.updateApplicationStatus = async (req, res, next) => {
    try {
        const applicationId = parseInt(req.params.id);
        const { status, notes } = req.body;

        // Fetch application for authorization check
        const existingApp = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { student: { select: { department_id: true } } }
        });

        if (!existingApp) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Department isolation for officers
        if (req.user.role === 'dept_officer' && existingApp.student.department_id !== req.user.user_profile?.department_id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this application'
            });
        }

        const updateData = {
            status,
            reviewed_at: new Date(),
            reviewed_by: req.user.id
        };

        if (notes) updateData.notes = notes;

        const application = await prisma.application.update({
            where: { id: applicationId },
            data: updateData,
            include: {
                job: { include: { company: true } },
                student: {
                    include: {
                        user: { select: { email: true, user_profile: true } }
                    }
                }
            }
        });

        // Send notification to student
        notificationService.notifyApplicationUpdate(application, status).catch(err =>
            console.error(`Failed to notify student ${application.student.id}:`, err)
        );

        res.status(200).json({
            success: true,
            message: `Application status updated to ${status}`,
            data: application
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Withdraw application
 * @route   POST /api/v1/applications/:id/withdraw
 * @access  Private (Student - own only)
 */
exports.withdrawApplication = async (req, res, next) => {
    try {
        const applicationId = parseInt(req.params.id);

        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { student: true }
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check authorization
        if (application.student.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to withdraw this application'
            });
        }

        // Can only withdraw if not already processed
        if (['selected', 'offer_accepted', 'rejected'].includes(application.status)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot withdraw application at this stage'
            });
        }

        const updatedApplication = await prisma.application.update({
            where: { id: applicationId },
            data: { status: 'withdrawn' }
        });

        res.status(200).json({
            success: true,
            message: 'Application withdrawn successfully',
            data: updatedApplication
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Bulk update application status
 * @route   POST /api/v1/applications/bulk-status
 * @access  Private (Admin, Officer)
 */
exports.bulkUpdateStatus = async (req, res, next) => {
    try {
        const { applicationIds, status, notes } = req.body;

        // Build where clause with department isolation for officers
        const where = { id: { in: applicationIds } };
        if (req.user.role === 'dept_officer' && req.user.user_profile?.department_id) {
            where.student = {
                department_id: req.user.user_profile.department_id
            };
        }

        const result = await prisma.application.updateMany({
            where,
            data: {
                status,
                notes,
                reviewed_at: new Date(),
                reviewed_by: req.user.id
            }
        });

        // Fetch affected applications to send notifications
        const affectedApplications = await prisma.application.findMany({
            where,
            include: {
                student: { include: { user: true } },
                job: { include: { company: true } }
            }
        });

        // Send notifications in background
        Promise.all(affectedApplications.map(app =>
            notificationService.notifyApplicationUpdate(app, status)
                .catch(err => console.error(`Failed to notify student ${app.student.id}:`, err))
        ));

        res.status(200).json({
            success: true,
            message: `${result.count} applications updated to ${status}`,
            data: { count: result.count }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = exports;
