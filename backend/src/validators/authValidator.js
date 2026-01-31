const Joi = require('joi');

/**
 * Auth validation schemas
 */

// Register schema
exports.registerSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),

    password: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            'any.required': 'Password is required'
        }),

    role: Joi.string()
        .valid('admin', 'dept_officer', 'coordinator', 'student')
        .required()
        .messages({
            'any.only': 'Role must be one of: admin, dept_officer, coordinator, student',
            'any.required': 'Role is required'
        }),

    firstName: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'First name must be at least 2 characters',
            'string.max': 'First name cannot exceed 100 characters',
            'any.required': 'First name is required'
        }),

    lastName: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'Last name must be at least 2 characters',
            'string.max': 'Last name cannot exceed 100 characters',
            'any.required': 'Last name is required'
        }),

    departmentId: Joi.number()
        .integer()
        .positive()
        .optional(),

    // Student-specific fields
    rollNumber: Joi.when('role', {
        is: 'student',
        then: Joi.string().required().messages({
            'any.required': 'Roll number is required for students'
        }),
        otherwise: Joi.optional()
    }),

    degree: Joi.when('role', {
        is: 'student',
        then: Joi.string()
            .valid('BTech', 'MTech', 'MBA', 'MCA', 'BSc', 'MSc', 'BBA', 'BCA')
            .required()
            .messages({
                'any.required': 'Degree is required for students'
            }),
        otherwise: Joi.optional()
    }),

    batchYear: Joi.when('role', {
        is: 'student',
        then: Joi.number()
            .integer()
            .min(2000)
            .max(2100)
            .required()
            .messages({
                'any.required': 'Batch year is required for students'
            }),
        otherwise: Joi.optional()
    }),

    currentSemester: Joi.number()
        .integer()
        .min(1)
        .max(10)
        .optional()
});

// Login schema
exports.loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),

    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        })
});

// Forgot password schema
exports.forgotPasswordSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        })
});

// Reset password schema
exports.resetPasswordSchema = Joi.object({
    password: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            'any.required': 'Password is required'
        }),

    confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'Passwords do not match',
            'any.required': 'Confirm password is required'
        })
});

// Update password schema
exports.updatePasswordSchema = Joi.object({
    currentPassword: Joi.string()
        .required()
        .messages({
            'any.required': 'Current password is required'
        }),

    newPassword: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            'any.required': 'New password is required'
        })
});
