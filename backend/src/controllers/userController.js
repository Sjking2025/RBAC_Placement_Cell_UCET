const prisma = require('../config/database');
const { getPagination, formatPaginationResponse, sanitizeUser } = require('../utils/helpers');

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Private (Admin, Dept Officer)
 */
exports.getUsers = async (req, res, next) => {
    try {
        const { role, status, departmentId, search } = req.query;
        const { page, limit, skip } = getPagination(req.query.page, req.query.limit);

        const where = {};

        // Department-based filtering for non-admins
        if (req.user.role !== 'admin' && req.user.user_profile?.department_id) {
            where.user_profile = {
                department_id: req.user.user_profile.department_id
            };
        }

        // Additional filters
        if (role) where.role = role;
        if (status) where.status = status;
        if (departmentId) {
            where.user_profile = {
                ...where.user_profile,
                department_id: parseInt(departmentId)
            };
        }
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { user_profile: { first_name: { contains: search, mode: 'insensitive' } } },
                { user_profile: { last_name: { contains: search, mode: 'insensitive' } } }
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                include: {
                    user_profile: {
                        include: { department: true }
                    }
                },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' }
            }),
            prisma.user.count({ where })
        ]);

        // Remove sensitive data
        const sanitizedUsers = users.map(sanitizeUser);

        res.status(200).json({
            success: true,
            data: sanitizedUsers,
            pagination: formatPaginationResponse(total, page, limit)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single user
 * @route   GET /api/v1/users/:id
 * @access  Private (Admin, Dept Officer)
 */
exports.getUser = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                user_profile: {
                    include: { department: true }
                },
                student_profile: {
                    include: {
                        department: true,
                        skills: true,
                        projects: true,
                        certifications: true,
                        internships: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: sanitizeUser(user)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user
 * @route   PUT /api/v1/users/:id
 * @access  Private (Admin, Dept Officer)
 */
exports.updateUser = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        const { status, role, firstName, lastName, phone, departmentId } = req.body;

        // Update user
        const updateData = {};
        if (status) updateData.status = status;
        if (role && req.user.role === 'admin') updateData.role = role;

        await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        // Update profile
        const profileData = {};
        if (firstName) profileData.first_name = firstName;
        if (lastName) profileData.last_name = lastName;
        if (phone) profileData.phone = phone;
        if (departmentId) profileData.department_id = departmentId;

        if (Object.keys(profileData).length > 0) {
            await prisma.userProfile.update({
                where: { user_id: userId },
                data: profileData
            });
        }

        const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                user_profile: {
                    include: { department: true }
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: sanitizeUser(updatedUser)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Private (Admin)
 */
exports.deleteUser = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);

        // Prevent self-deletion
        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await prisma.user.delete({
            where: { id: userId }
        });

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all departments
 * @route   GET /api/v1/users/departments
 * @access  Private
 */
exports.getDepartments = async (req, res, next) => {
    try {
        const departments = await prisma.department.findMany({
            orderBy: { name: 'asc' }
        });

        res.status(200).json({
            success: true,
            data: departments
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create department
 * @route   POST /api/v1/users/departments
 * @access  Private (Admin)
 */
exports.createDepartment = async (req, res, next) => {
    try {
        const { name, code, description } = req.body;

        const department = await prisma.department.create({
            data: { name, code, description }
        });

        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: department
        });
    } catch (error) {
        next(error);
    }
};

module.exports = exports;
