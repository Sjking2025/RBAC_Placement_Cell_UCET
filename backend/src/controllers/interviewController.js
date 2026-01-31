const prisma = require('../config/database');
const { getPagination, formatPaginationResponse } = require('../utils/helpers');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');

/**
 * @desc    Get interviews
 * @route   GET /api/v1/interviews
 * @access  Private
 */
exports.getInterviews = async (req, res, next) => {
    try {
        const { status, date, applicationId } = req.query;
        const { page, limit, skip } = getPagination(req.query.page, req.query.limit);

        const where = {};

        // Role-based filtering
        if (req.user.role === 'student') {
            where.application = {
                student: { user_id: req.user.id }
            };
        } else if (req.user.role !== 'admin') {
            where.application = {
                student: { department_id: req.user.user_profile?.department_id }
            };
        }

        // Additional filters
        if (status) where.status = status;
        if (date) where.scheduled_date = new Date(date);
        if (applicationId) where.application_id = parseInt(applicationId);

        const [interviews, total] = await Promise.all([
            prisma.interview.findMany({
                where,
                include: {
                    application: {
                        include: {
                            job: { include: { company: true } },
                            student: {
                                include: {
                                    user: { select: { email: true, user_profile: true } }
                                }
                            }
                        }
                    },
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
                orderBy: { scheduled_date: 'asc' }
            }),
            prisma.interview.count({ where })
        ]);

        res.status(200).json({
            success: true,
            data: interviews,
            pagination: formatPaginationResponse(total, page, limit)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single interview
 * @route   GET /api/v1/interviews/:id
 * @access  Private
 */
exports.getInterview = async (req, res, next) => {
    try {
        const interviewId = parseInt(req.params.id);

        const interview = await prisma.interview.findUnique({
            where: { id: interviewId },
            include: {
                application: {
                    include: {
                        job: { include: { company: true } },
                        student: {
                            include: {
                                user: { select: { email: true, user_profile: true } },
                                skills: true
                            }
                        }
                    }
                },
                creator: {
                    select: {
                        id: true,
                        email: true,
                        user_profile: { select: { first_name: true, last_name: true } }
                    }
                }
            }
        });

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: 'Interview not found'
            });
        }

        res.status(200).json({
            success: true,
            data: interview
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Schedule interview
 * @route   POST /api/v1/interviews
 * @access  Private (Admin, Officer, Coordinator)
 */
exports.scheduleInterview = async (req, res, next) => {
    try {
        const {
            applicationId,
            interviewType,
            interviewMode,
            scheduledDate,
            scheduledTime,
            durationMinutes,
            location,
            meetingLink,
            interviewerNames,
            notes
        } = req.body;

        // Check if application exists
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                student: {
                    include: { user: { select: { email: true, user_profile: true } } }
                },
                job: { include: { company: true } }
            }
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        const interview = await prisma.interview.create({
            data: {
                application_id: applicationId,
                interview_type: interviewType,
                interview_mode: interviewMode,
                scheduled_date: new Date(scheduledDate),
                scheduled_time: new Date(`1970-01-01T${scheduledTime}`),
                duration_minutes: durationMinutes || 60,
                location,
                meeting_link: meetingLink,
                interviewer_names: interviewerNames,
                notes,
                status: 'scheduled',
                created_by: req.user.id
            },
            include: {
                application: {
                    include: {
                        job: { include: { company: true } },
                        student: { include: { user: { select: { email: true, user_profile: true } } } }
                    }
                }
            }
        });

        // Update application status
        await prisma.application.update({
            where: { id: applicationId },
            data: { status: 'interview_scheduled' }
        });

        // Send notification
        const studentEmail = application.student.user.email;
        const studentName = application.student.user.user_profile?.first_name || 'Student';

        try {
            await emailService.sendInterviewNotificationEmail(studentEmail, studentName, {
                date: scheduledDate,
                time: scheduledTime,
                type: interviewType,
                mode: interviewMode,
                location,
                meetingLink
            });
        } catch (emailError) {
            console.error('Failed to send interview notification email:', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Interview scheduled successfully',
            data: interview
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update interview
 * @route   PUT /api/v1/interviews/:id
 * @access  Private (Admin, Officer, Coordinator)
 */
exports.updateInterview = async (req, res, next) => {
    try {
        const interviewId = parseInt(req.params.id);

        const updateData = {};
        const allowedFields = [
            'scheduled_date', 'scheduled_time', 'duration_minutes',
            'location', 'meeting_link', 'interviewer_names', 'notes',
            'feedback', 'result'
        ];

        const fieldMap = {
            scheduledDate: 'scheduled_date',
            scheduledTime: 'scheduled_time',
            durationMinutes: 'duration_minutes',
            meetingLink: 'meeting_link',
            interviewerNames: 'interviewer_names'
        };

        Object.keys(req.body).forEach(key => {
            const dbField = fieldMap[key] || key;
            if (allowedFields.includes(dbField)) {
                if (dbField === 'scheduled_date') {
                    updateData[dbField] = new Date(req.body[key]);
                } else if (dbField === 'scheduled_time') {
                    updateData[dbField] = new Date(`1970-01-01T${req.body[key]}`);
                } else {
                    updateData[dbField] = req.body[key];
                }
            }
        });

        // If date/time changed, mark as rescheduled
        if (updateData.scheduled_date || updateData.scheduled_time) {
            updateData.status = 'rescheduled';
        }

        const interview = await prisma.interview.update({
            where: { id: interviewId },
            data: updateData,
            include: {
                application: {
                    include: {
                        job: { include: { company: true } },
                        student: { include: { user: { select: { email: true, user_profile: true } } } }
                    }
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Interview updated successfully',
            data: interview
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update interview status/result
 * @route   PATCH /api/v1/interviews/:id/status
 * @access  Private (Admin, Officer, Coordinator)
 */
exports.updateInterviewStatus = async (req, res, next) => {
    try {
        const interviewId = parseInt(req.params.id);
        const { status, feedback, result } = req.body;

        const updateData = { status };
        if (feedback) updateData.feedback = feedback;
        if (result) updateData.result = result;

        const interview = await prisma.interview.update({
            where: { id: interviewId },
            data: updateData,
            include: {
                application: true
            }
        });

        // Update application status based on result
        if (result === 'passed' || result === 'selected') {
            await prisma.application.update({
                where: { id: interview.application_id },
                data: { status: 'selected' }
            });
        } else if (result === 'failed' || result === 'rejected') {
            await prisma.application.update({
                where: { id: interview.application_id },
                data: { status: 'rejected' }
            });
        }

        res.status(200).json({
            success: true,
            message: `Interview status updated to ${status}`,
            data: interview
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete interview
 * @route   DELETE /api/v1/interviews/:id
 * @access  Private (Admin, Officer)
 */
exports.deleteInterview = async (req, res, next) => {
    try {
        const interviewId = parseInt(req.params.id);

        await prisma.interview.delete({
            where: { id: interviewId }
        });

        res.status(200).json({
            success: true,
            message: 'Interview deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = exports;
