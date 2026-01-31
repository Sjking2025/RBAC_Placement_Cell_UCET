const prisma = require('../config/database');
const { getPagination, formatPaginationResponse } = require('../utils/helpers');

/**
 * @desc    Get all jobs (with filters)
 * @route   GET /api/v1/jobs
 * @access  Private
 */
exports.getJobs = async (req, res, next) => {
    try {
        const { status, type, departmentId, companyId, search } = req.query;
        const { page, limit, skip } = getPagination(req.query.page, req.query.limit);

        const where = {};

        // Apply filters based on role
        if (req.user.role === 'student') {
            // Students see only active jobs they're eligible for
            where.status = 'active';
            const student = req.user.student_profile;

            if (student) {
                where.AND = [
                    { OR: [{ required_cgpa: { lte: student.cgpa } }, { required_cgpa: null }] },
                    { OR: [{ allowed_backlogs: { gte: student.active_backlogs } }, { allowed_backlogs: null }] },
                    { OR: [{ eligible_departments: { has: student.department_id } }, { eligible_departments: { isEmpty: true } }] },
                    { OR: [{ eligible_batches: { has: student.batch_year } }, { eligible_batches: { isEmpty: true } }] }
                ];
            }
        } else if (req.user.role === 'dept_officer' || req.user.role === 'coordinator') {
            // Officers and coordinators see jobs for their department
            if (req.user.user_profile?.department_id) {
                where.eligible_departments = { has: req.user.user_profile.department_id };
            }
        }

        // Additional filters
        if (status && req.user.role === 'admin') where.status = status;
        if (type) where.job_type = type;
        if (companyId) where.company_id = parseInt(companyId);
        if (departmentId) where.eligible_departments = { has: parseInt(departmentId) };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [jobs, total] = await Promise.all([
            prisma.jobPosting.findMany({
                where,
                include: {
                    company: {
                        select: { id: true, name: true, logo_url: true, industry: true }
                    },
                    creator: {
                        select: {
                            id: true,
                            email: true,
                            user_profile: { select: { first_name: true, last_name: true } }
                        }
                    },
                    _count: {
                        select: { applications: true }
                    }
                },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' }
            }),
            prisma.jobPosting.count({ where })
        ]);

        res.status(200).json({
            success: true,
            data: jobs,
            pagination: formatPaginationResponse(total, page, limit)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single job
 * @route   GET /api/v1/jobs/:id
 * @access  Private
 */
exports.getJob = async (req, res, next) => {
    try {
        const jobId = parseInt(req.params.id);

        const job = await prisma.jobPosting.findUnique({
            where: { id: jobId },
            include: {
                company: true,
                creator: {
                    select: {
                        id: true,
                        email: true,
                        user_profile: { select: { first_name: true, last_name: true } }
                    }
                },
                applications: req.user.role !== 'student' ? {
                    include: {
                        student: {
                            include: {
                                user: { select: { email: true } }
                            }
                        }
                    }
                } : false
            }
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check if student has already applied
        let hasApplied = false;
        if (req.user.role === 'student' && req.user.student_profile) {
            const application = await prisma.application.findFirst({
                where: {
                    job_id: jobId,
                    student_id: req.user.student_profile.id
                }
            });
            hasApplied = !!application;
        }

        res.status(200).json({
            success: true,
            data: {
                ...job,
                hasApplied
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create job posting
 * @route   POST /api/v1/jobs
 * @access  Private (Admin, Officer, Coordinator)
 */
exports.createJob = async (req, res, next) => {
    try {
        const {
            companyId,
            title,
            description,
            jobType,
            location,
            workMode,
            salaryMin,
            salaryMax,
            currency,
            positionsAvailable,
            requiredCgpa,
            allowedBacklogs,
            eligibleDepartments,
            eligibleDegrees,
            eligibleBatches,
            skillsRequired,
            responsibilities,
            requirements,
            perks,
            applicationDeadline
        } = req.body;

        const jobData = {
            company_id: companyId,
            title,
            description,
            job_type: jobType,
            location,
            work_mode: workMode,
            salary_min: salaryMin,
            salary_max: salaryMax,
            currency: currency || 'INR',
            positions_available: positionsAvailable || 1,
            required_cgpa: requiredCgpa,
            allowed_backlogs: allowedBacklogs || 0,
            eligible_departments: eligibleDepartments || [],
            eligible_degrees: eligibleDegrees || [],
            eligible_batches: eligibleBatches || [],
            skills_required: skillsRequired || [],
            responsibilities,
            requirements,
            perks,
            application_deadline: applicationDeadline ? new Date(applicationDeadline) : null,
            created_by: req.user.id,
            status: req.user.role === 'admin' ? 'active' : 'pending'
        };

        const job = await prisma.jobPosting.create({
            data: jobData,
            include: { company: true }
        });

        res.status(201).json({
            success: true,
            message: 'Job posting created successfully',
            data: job
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update job posting
 * @route   PUT /api/v1/jobs/:id
 * @access  Private (Admin, Officer, Coordinator - own only)
 */
exports.updateJob = async (req, res, next) => {
    try {
        const jobId = parseInt(req.params.id);

        // Check job exists
        const existingJob = await prisma.jobPosting.findUnique({
            where: { id: jobId }
        });

        if (!existingJob) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check permissions
        if (req.user.role !== 'admin' && existingJob.created_by !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this job'
            });
        }

        const updateData = {};
        const allowedFields = [
            'title', 'description', 'location', 'work_mode',
            'salary_min', 'salary_max', 'positions_available',
            'required_cgpa', 'allowed_backlogs', 'eligible_departments',
            'eligible_degrees', 'eligible_batches', 'skills_required',
            'responsibilities', 'requirements', 'perks', 'application_deadline'
        ];

        // Map camelCase to snake_case
        const fieldMap = {
            workMode: 'work_mode',
            salaryMin: 'salary_min',
            salaryMax: 'salary_max',
            positionsAvailable: 'positions_available',
            requiredCgpa: 'required_cgpa',
            allowedBacklogs: 'allowed_backlogs',
            eligibleDepartments: 'eligible_departments',
            eligibleDegrees: 'eligible_degrees',
            eligibleBatches: 'eligible_batches',
            skillsRequired: 'skills_required',
            applicationDeadline: 'application_deadline'
        };

        Object.keys(req.body).forEach(key => {
            const dbField = fieldMap[key] || key;
            if (allowedFields.includes(dbField)) {
                updateData[dbField] = req.body[key];
            }
        });

        const job = await prisma.jobPosting.update({
            where: { id: jobId },
            data: updateData,
            include: { company: true }
        });

        res.status(200).json({
            success: true,
            message: 'Job updated successfully',
            data: job
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete job posting
 * @route   DELETE /api/v1/jobs/:id
 * @access  Private (Admin, Officer)
 */
exports.deleteJob = async (req, res, next) => {
    try {
        const jobId = parseInt(req.params.id);

        const job = await prisma.jobPosting.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        await prisma.jobPosting.delete({
            where: { id: jobId }
        });

        res.status(200).json({
            success: true,
            message: 'Job deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Approve/Update job status
 * @route   PATCH /api/v1/jobs/:id/status
 * @access  Private (Admin, Officer)
 */
exports.updateJobStatus = async (req, res, next) => {
    try {
        const jobId = parseInt(req.params.id);
        const { status } = req.body;

        const job = await prisma.jobPosting.update({
            where: { id: jobId },
            data: {
                status,
                approved_by: status === 'approved' || status === 'active' ? req.user.id : undefined,
                approved_at: status === 'approved' || status === 'active' ? new Date() : undefined
            },
            include: { company: true }
        });

        res.status(200).json({
            success: true,
            message: `Job status updated to ${status}`,
            data: job
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Apply to a job
 * @route   POST /api/v1/jobs/:id/apply
 * @access  Private (Student)
 */
exports.applyToJob = async (req, res, next) => {
    try {
        const jobId = parseInt(req.params.id);
        const studentId = req.user.student_profile?.id;
        const { coverLetter, resumeUrl } = req.body;

        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        // Check if already applied
        const existingApplication = await prisma.application.findFirst({
            where: { job_id: jobId, student_id: studentId }
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied to this job'
            });
        }

        // Check eligibility
        const job = await prisma.jobPosting.findUnique({
            where: { id: jobId }
        });

        if (!job || job.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Job is not available for applications'
            });
        }

        const student = req.user.student_profile;

        if (job.required_cgpa && parseFloat(student.cgpa) < parseFloat(job.required_cgpa)) {
            return res.status(400).json({
                success: false,
                message: 'You do not meet the CGPA requirement'
            });
        }

        if (job.allowed_backlogs !== null && student.active_backlogs > job.allowed_backlogs) {
            return res.status(400).json({
                success: false,
                message: 'You have more backlogs than allowed'
            });
        }

        // Create application
        const application = await prisma.application.create({
            data: {
                job_id: jobId,
                student_id: studentId,
                cover_letter: coverLetter,
                resume_url: resumeUrl || student.resume_url,
                status: 'submitted'
            }
        });

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: application
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get job applications
 * @route   GET /api/v1/jobs/:id/applications
 * @access  Private (Admin, Officer, Coordinator)
 */
exports.getJobApplications = async (req, res, next) => {
    try {
        const jobId = parseInt(req.params.id);
        const { status } = req.query;
        const { page, limit, skip } = getPagination(req.query.page, req.query.limit);

        const where = { job_id: jobId };
        if (status) where.status = status;

        const [applications, total] = await Promise.all([
            prisma.application.findMany({
                where,
                include: {
                    student: {
                        include: {
                            user: { select: { email: true } },
                            department: true,
                            skills: true
                        }
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

module.exports = exports;
