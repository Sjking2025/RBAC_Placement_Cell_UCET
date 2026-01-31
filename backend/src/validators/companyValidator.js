const Joi = require('joi');

/**
 * Company validation schemas
 */

// Create/Update company schema
exports.companySchema = Joi.object({
    name: Joi.string()
        .max(255)
        .required()
        .messages({
            'any.required': 'Company name is required'
        }),

    website: Joi.string()
        .uri()
        .max(500)
        .optional()
        .allow(''),

    industry: Joi.string()
        .max(100)
        .optional(),

    description: Joi.string()
        .max(5000)
        .optional(),

    address: Joi.string()
        .max(500)
        .optional(),

    city: Joi.string()
        .max(100)
        .optional(),

    state: Joi.string()
        .max(100)
        .optional(),

    country: Joi.string()
        .max(100)
        .optional()
        .default('India')
});

// Add company contact schema
exports.companyContactSchema = Joi.object({
    name: Joi.string()
        .max(255)
        .required()
        .messages({
            'any.required': 'Contact name is required'
        }),

    designation: Joi.string()
        .max(255)
        .optional(),

    email: Joi.string()
        .email()
        .max(255)
        .optional()
        .messages({
            'string.email': 'Please provide a valid email address'
        }),

    phone: Joi.string()
        .pattern(/^[+]?[\d\s-]{10,15}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Please provide a valid phone number'
        }),

    isPrimary: Joi.boolean()
        .optional()
        .default(false)
});

// Company status update schema
exports.updateStatusSchema = Joi.object({
    status: Joi.string()
        .valid('pending', 'approved', 'rejected', 'active', 'inactive')
        .required()
        .messages({
            'any.only': 'Status must be one of: pending, approved, rejected, active, inactive',
            'any.required': 'Status is required'
        })
});
