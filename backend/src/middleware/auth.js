const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

/**
 * Verify JWT token and attach user to request
 */
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from database
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                include: {
                    user_profile: true,
                    student_profile: true
                }
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (user.status !== 'active') {
                return res.status(401).json({
                    success: false,
                    message: 'Account is inactive or suspended'
                });
            }

            // Attach user to request
            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Authorize based on roles
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

/**
 * Check department access
 */
exports.checkDepartmentAccess = async (req, res, next) => {
    try {
        const { departmentId } = req.params;
        const user = req.user;

        // Admin has access to all departments
        if (user.role === 'admin') {
            return next();
        }

        // Check if user belongs to the department
        if (user.user_profile && user.user_profile.department_id !== parseInt(departmentId)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this department'
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};
