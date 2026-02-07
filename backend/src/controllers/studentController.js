const prisma = require('../config/database');
const { getPagination, formatPaginationResponse } = require('../utils/helpers');

/**
 * @desc    Get all students
 * @route   GET /api/v1/students
 * @access  Private (Admin, Officer, Coordinator)
 */
exports.getStudents = async (req, res, next) => {
    try {
        const { departmentId, batchYear, degree, placementStatus, search } = req.query;
        const { page, limit, skip } = getPagination(req.query.page, req.query.limit);

        const where = {};

        // Department-based filtering for non-admins
        if (req.user.role !== 'admin' && req.user.user_profile?.department_id) {
            where.department_id = req.user.user_profile.department_id;
        }

        // Additional filters
        if (departmentId) where.department_id = parseInt(departmentId);
        if (batchYear) where.batch_year = parseInt(batchYear);
        if (degree) where.degree = degree;
        if (placementStatus) where.placement_status = placementStatus;
        if (search) {
            where.OR = [
                { roll_number: { contains: search, mode: 'insensitive' } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { user: { user_profile: { first_name: { contains: search, mode: 'insensitive' } } } }
            ];
        }

        const [students, total] = await Promise.all([
            prisma.studentProfile.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            status: true,
                            user_profile: true
                        }
                    },
                    department: true,
                    skills: true,
                    _count: {
                        select: { applications: true }
                    }
                },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' }
            }),
            prisma.studentProfile.count({ where })
        ]);

        res.status(200).json({
            success: true,
            data: students,
            pagination: formatPaginationResponse(total, page, limit)
        });
    } catch (error) {
        next(error);
    }
};

// Helper to get student ID from request
const getStudentId = (req) => {
    if (req.params.id) return parseInt(req.params.id);
    if (req.user.student_profile?.id) return req.user.student_profile.id;
    return null;
};

/**
 * @desc    Get single student
 * @route   GET /api/v1/students/:id
 * @access  Private
 */
exports.getStudent = async (req, res, next) => {
    try {
        const studentId = parseInt(req.params.id);

        const student = await prisma.studentProfile.findUnique({
            where: { id: studentId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        status: true,
                        created_at: true,
                        user_profile: true
                    }
                },
                department: true,
                skills: true,
                projects: true,
                certifications: true,
                internships: true,
                applications: {
                    include: {
                        job: {
                            include: { company: true }
                        }
                    },
                    orderBy: { applied_at: 'desc' }
                }
            }
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            data: student
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update student profile
 * @route   PUT /api/v1/students/:id
 * @access  Private (Student - own, Admin, Officer)
 */
exports.updateStudent = async (req, res, next) => {
    try {
        const studentId = parseInt(req.params.id);

        // Check authorization
        if (req.user.role === 'student') {
            if (req.user.student_profile?.id !== studentId) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to update this profile'
                });
            }
        }

        const updateData = {};
        const allowedFields = [
            'cgpa', 'tenth_percentage', 'twelfth_percentage', 'active_backlogs',
            'date_of_birth', 'gender', 'address', 'city', 'state', 'pincode',
            'resume_url', 'current_semester', 'placement_status'
        ];

        const fieldMap = {
            tenthPercentage: 'tenth_percentage',
            twelfthPercentage: 'twelfth_percentage',
            activeBacklogs: 'active_backlogs',
            dateOfBirth: 'date_of_birth',
            resumeUrl: 'resume_url',
            currentSemester: 'current_semester',
            placementStatus: 'placement_status'
        };

        Object.keys(req.body).forEach(key => {
            const dbField = fieldMap[key] || key;
            if (allowedFields.includes(dbField)) {
                updateData[dbField] = req.body[key];
            }
        });

        // Check if profile is complete
        const currentProfile = await prisma.studentProfile.findUnique({
            where: { id: studentId }
        });

        const requiredFields = ['cgpa', 'tenth_percentage', 'twelfth_percentage', 'date_of_birth'];
        const merged = { ...currentProfile, ...updateData };
        const isComplete = requiredFields.every(field => merged[field] !== null);
        updateData.profile_completed = isComplete;

        const student = await prisma.studentProfile.update({
            where: { id: studentId },
            data: updateData,
            include: {
                user: {
                    select: { email: true, user_profile: true }
                },
                department: true,
                skills: true
            }
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: student
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add skill
 * @route   POST /api/v1/students/:id/skills
 * @access  Private (Student - own)
 */
exports.addSkill = async (req, res, next) => {
    try {
        const studentId = getStudentId(req);
        if (!studentId) {
            return res.status(400).json({ success: false, message: 'Student ID not found' });
        }

        const { skillName, proficiencyLevel } = req.body;

        // Check authorization
        if (req.user.role === 'student' && req.user.student_profile?.id !== studentId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const skill = await prisma.studentSkill.create({
            data: {
                student_id: studentId,
                skill_name: skillName,
                proficiency_level: proficiencyLevel
            }
        });

        res.status(201).json({
            success: true,
            message: 'Skill added successfully',
            data: skill
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete skill
 * @route   DELETE /api/v1/students/:id/skills/:skillId
 * @access  Private (Student - own)
 */
exports.deleteSkill = async (req, res, next) => {
    try {
        const studentId = getStudentId(req);
        if (!studentId) {
            return res.status(400).json({ success: false, message: 'Student ID not found' });
        }
        const skillId = parseInt(req.params.skillId); // Wait, if called as /skills/:skillId, skillId is params.id? No.

        // Check authorization
        if (req.user.role === 'student' && req.user.student_profile?.id !== studentId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        await prisma.studentSkill.delete({
            where: { id: skillId }
        });

        res.status(200).json({
            success: true,
            message: 'Skill deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// PROJECTS
// ==========================================

/**
 * @desc    Add project
 * @route   POST /api/v1/students/:id/projects
 * @access  Private (Student - own)
 */
exports.addProject = async (req, res, next) => {
    try {
        const studentId = getStudentId(req);
        if (!studentId) return res.status(400).json({ success: false, message: 'Student ID not found' });

        // Check authorization
        if (req.user.role === 'student' && req.user.student_profile?.id !== studentId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const { technologies } = req.body;
        const techString = Array.isArray(technologies) ? technologies.join(', ') : technologies;

        const project = await prisma.studentProject.create({
            data: {
                student_id: studentId,
                title: req.body.title,
                description: req.body.description,
                technologies: techString,
                start_date: req.body.startDate ? new Date(req.body.startDate) : null,
                end_date: req.body.endDate ? new Date(req.body.endDate) : null,
                project_url: req.body.projectUrl,
                github_url: req.body.githubUrl
            }
        });

        res.status(201).json({
            success: true,
            message: 'Project added successfully',
            data: project
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update project
 * @route   PUT /api/v1/students/projects/:projectId
 * @access  Private (Student - own)
 */
exports.updateProject = async (req, res, next) => {
    try {
        const studentId = getStudentId(req);
        if (!studentId) return res.status(400).json({ success: false, message: 'Student ID not found' });

        const projectId = parseInt(req.params.projectId);

        const project = await prisma.studentProject.findUnique({ where: { id: projectId } });
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        if (project.student_id !== studentId) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this project' });
        }

        const { technologies } = req.body;
        const techString = Array.isArray(technologies) ? technologies.join(', ') : technologies;

        const updatedProject = await prisma.studentProject.update({
            where: { id: projectId },
            data: {
                title: req.body.title,
                description: req.body.description,
                technologies: techString,
                start_date: req.body.startDate ? new Date(req.body.startDate) : null,
                end_date: req.body.endDate ? new Date(req.body.endDate) : null,
                project_url: req.body.projectUrl,
                github_url: req.body.githubUrl
            }
        });

        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            data: updatedProject
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/v1/students/projects/:projectId
 * @access  Private (Student - own)
 */
exports.deleteProject = async (req, res, next) => {
    try {
        const studentId = getStudentId(req);
        if (!studentId) return res.status(400).json({ success: false, message: 'Student ID not found' });

        const projectId = parseInt(req.params.projectId);

        const project = await prisma.studentProject.findUnique({ where: { id: projectId } });
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        if (project.student_id !== studentId) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this project' });
        }

        await prisma.studentProject.delete({ where: { id: projectId } });

        res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// CERTIFICATIONS
// ==========================================

/**
 * @desc    Add certification
 * @route   POST /api/v1/students/:id/certifications
 * @access  Private (Student - own)
 */
exports.addCertification = async (req, res, next) => {
    try {
        const studentId = getStudentId(req);
        if (!studentId) return res.status(400).json({ success: false, message: 'Student ID not found' });

        if (req.user.role === 'student' && req.user.student_profile?.id !== studentId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const certification = await prisma.studentCertification.create({
            data: {
                student_id: studentId,
                name: req.body.name,
                issuing_organization: req.body.issuingOrganization,
                issue_date: req.body.issueDate ? new Date(req.body.issueDate) : null,
                expiry_date: req.body.expiryDate ? new Date(req.body.expiryDate) : null,
                credential_id: req.body.credentialId,
                credential_url: req.body.credentialUrl
            }
        });

        res.status(201).json({
            success: true,
            message: 'Certification added successfully',
            data: certification
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update certification
 * @route   PUT /api/v1/students/certifications/:certId
 * @access  Private (Student - own)
 */
exports.updateCertification = async (req, res, next) => {
    try {
        const studentId = getStudentId(req);
        if (!studentId) return res.status(400).json({ success: false, message: 'Student ID not found' });

        const certId = parseInt(req.params.certId);

        const cert = await prisma.studentCertification.findUnique({ where: { id: certId } });
        if (!cert) return res.status(404).json({ success: false, message: 'Certification not found' });

        if (cert.student_id !== studentId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updatedCert = await prisma.studentCertification.update({
            where: { id: certId },
            data: {
                name: req.body.name,
                issuing_organization: req.body.issuingOrganization,
                issue_date: req.body.issueDate ? new Date(req.body.issueDate) : null,
                expiry_date: req.body.expiryDate ? new Date(req.body.expiryDate) : null,
                credential_id: req.body.credentialId,
                credential_url: req.body.credentialUrl
            }
        });

        res.status(200).json({
            success: true,
            message: 'Certification updated successfully',
            data: updatedCert
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete certification
 * @route   DELETE /api/v1/students/certifications/:certId
 * @access  Private (Student - own)
 */
exports.deleteCertification = async (req, res, next) => {
    try {
        const studentId = getStudentId(req);
        if (!studentId) return res.status(400).json({ success: false, message: 'Student ID not found' });

        const certId = parseInt(req.params.certId);

        const cert = await prisma.studentCertification.findUnique({ where: { id: certId } });
        if (!cert) return res.status(404).json({ success: false, message: 'Certification not found' });

        if (cert.student_id !== studentId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await prisma.studentCertification.delete({ where: { id: certId } });

        res.status(200).json({
            success: true,
            message: 'Certification deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// INTERNSHIPS
// ==========================================

/**
 * @desc    Add internship
 * @route   POST /api/v1/students/:id/internships
 * @access  Private (Student - own)
 */
exports.addInternship = async (req, res, next) => {
    try {
        const studentId = getStudentId(req);
        if (!studentId) return res.status(400).json({ success: false, message: 'Student ID not found' });

        if (req.user.role === 'student' && req.user.student_profile?.id !== studentId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const internship = await prisma.studentInternship.create({
            data: {
                student_id: studentId,
                company_name: req.body.companyName,
                role: req.body.role,
                description: req.body.description,
                start_date: req.body.startDate ? new Date(req.body.startDate) : null,
                end_date: req.body.endDate ? new Date(req.body.endDate) : null,
                location: req.body.location
            }
        });

        res.status(201).json({
            success: true,
            message: 'Internship added successfully',
            data: internship
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update internship
 * @route   PUT /api/v1/students/internships/:internshipId
 * @access  Private (Student - own)
 */
exports.updateInternship = async (req, res, next) => {
    try {
        const studentId = getStudentId(req);
        if (!studentId) return res.status(400).json({ success: false, message: 'Student ID not found' });

        const internshipId = parseInt(req.params.internshipId);

        const internship = await prisma.studentInternship.findUnique({ where: { id: internshipId } });
        if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });

        if (internship.student_id !== studentId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updatedInternship = await prisma.studentInternship.update({
            where: { id: internshipId },
            data: {
                company_name: req.body.companyName,
                role: req.body.role,
                description: req.body.description,
                start_date: req.body.startDate ? new Date(req.body.startDate) : null,
                end_date: req.body.endDate ? new Date(req.body.endDate) : null,
                location: req.body.location
            }
        });

        res.status(200).json({
            success: true,
            message: 'Internship updated successfully',
            data: updatedInternship
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete internship
 * @route   DELETE /api/v1/students/internships/:internshipId
 * @access  Private (Student - own)
 */
exports.deleteInternship = async (req, res, next) => {
    try {
        const studentId = getStudentId(req);
        if (!studentId) return res.status(400).json({ success: false, message: 'Student ID not found' });

        const internshipId = parseInt(req.params.internshipId);

        const internship = await prisma.studentInternship.findUnique({ where: { id: internshipId } });
        if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });

        if (internship.student_id !== studentId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await prisma.studentInternship.delete({ where: { id: internshipId } });

        res.status(200).json({
            success: true,
            message: 'Internship deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = exports;
