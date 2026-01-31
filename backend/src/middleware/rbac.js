const prisma = require('../config/database');

/**
 * Role-Based Access Control Middleware
 */

const permissions = {
    admin: {
        users: ['create', 'read', 'update', 'delete'],
        companies: ['create', 'read', 'update', 'delete', 'approve'],
        jobs: ['create', 'read', 'update', 'delete', 'approve'],
        applications: ['read', 'update', 'shortlist'],
        interviews: ['create', 'read', 'update', 'delete'],
        announcements: ['create', 'read', 'update', 'delete'],
        analytics: ['read_all'],
        students: ['read', 'update', 'approve']
    },
    dept_officer: {
        users: ['create_dept', 'read_dept', 'update_dept'],
        companies: ['create', 'read', 'update', 'approve_dept'],
        jobs: ['create', 'read', 'update_dept', 'approve_dept'],
        applications: ['read_dept', 'update_dept', 'shortlist_dept'],
        interviews: ['create_dept', 'read_dept', 'update_dept', 'delete_dept'],
        announcements: ['create_dept', 'read', 'update_own', 'delete_own'],
        analytics: ['read_dept'],
        students: ['read_dept', 'approve_dept']
    },
    coordinator: {
        companies: ['create', 'read', 'update'],
        jobs: ['create', 'read', 'update_own'],
        applications: ['read_dept', 'shortlist_dept'],
        interviews: ['create_dept', 'read_dept', 'update_dept'],
        announcements: ['create_dept', 'read', 'update_own', 'delete_own'],
        analytics: ['read_dept'],
        students: ['read_dept']
    },
    student: {
        jobs: ['read_eligible'],
        applications: ['create', 'read_own', 'withdraw_own'],
        interviews: ['read_own'],
        announcements: ['read'],
        profile: ['read_own', 'update_own'],
        analytics: ['read_own']
    }
};

/**
 * Check if user has permission for an action
 */
exports.hasPermission = (resource, action) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        const userPermissions = permissions[userRole];

        if (!userPermissions || !userPermissions[resource]) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (!userPermissions[resource].includes(action)) {
            return res.status(403).json({
                success: false,
                message: `You don't have permission to ${action} ${resource}`
            });
        }

        next();
    };
};

/**
 * Check ownership of resource
 */
exports.checkOwnership = (model, idField = 'id') => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params[idField];
            const userId = req.user.id;
            const userRole = req.user.role;

            // Admins bypass ownership check
            if (userRole === 'admin') {
                return next();
            }

            // Implementation depends on the model
            const resource = await prisma[model].findUnique({
                where: { id: parseInt(resourceId) }
            });

            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            }

            // Check if user owns the resource
            if (resource.created_by !== userId && resource.user_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to access this resource'
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Get permissions for a role
 */
exports.getPermissions = (role) => {
    return permissions[role] || {};
};

module.exports = exports;
