const Joi = require('joi');

/**
 * Job validation schemas
 */

// Create/Update job schema
exports.jobSchema = Joi.object({
    companyId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'Company ID is required'
        }),

    title: Joi.string()
        .max(255)
        .required()
        .messages({
            'any.required': 'Job title is required'
        }),

    description: Joi.string()
        .min(50)
        .max(10000)
        .required()
        .messages({
            'string.min': 'Description must be at least 50 characters',
            'any.required': 'Job description is required'
        }),

    jobType: Joi.string()
        .valid('full_time', 'internship', 'part_time', 'contract')
        .required()
        .messages({
            'any.only': 'Job type must be one of: full_time, internship, part_time, contract',
            'any.required': 'Job type is required'
        }),

    location: Joi.string()
        .max(255)
        .optional(),

    workMode: Joi.string()
        .valid('remote', 'onsite', 'hybrid')
        .optional(),

    salaryMin: Joi.number()
        .positive()
        .optional(),

    salaryMax: Joi.number()
        .positive()
        .min(Joi.ref('salaryMin'))
        .optional()
        .messages({
            'number.min': 'Maximum salary must be greater than minimum salary'
        }),

    currency: Joi.string()
        .max(10)
        .optional()
        .default('INR'),

    positionsAvailable: Joi.number()
        .integer()
        .positive()
        .optional()
        .default(1),

    requiredCgpa: Joi.number()
        .min(0)
        .max(10)
        .precision(2)
        .optional(),

    allowedBacklogs: Joi.number()
        .integer()
        .min(0)
        .optional()
        .default(0),

    eligibleDepartments: Joi.array()
        .items(Joi.number().integer().positive())
        .optional(),

    eligibleDegrees: Joi.array()
        .items(Joi.string().valid('BTech', 'MTech', 'MBA', 'MCA', 'BSc', 'MSc', 'BBA', 'BCA'))
        .optional(),

    eligibleBatches: Joi.array()
        .items(Joi.number().integer().min(2000).max(2100))
        .optional(),

    skillsRequired: Joi.array()
        .items(Joi.string().max(100))
        .optional(),

    responsibilities: Joi.string()
        .max(5000)
        .optional(),

    requirements: Joi.string()
        .max(5000)
        .optional(),

    perks: Joi.string()
        .max(2000)
        .optional(),

    applicationDeadline: Joi.date()
        .min('now')
        .optional()
        .messages({
            'date.min': 'Application deadline must be in the future'
        })
});

// Job status update schema
exports.updateJobStatusSchema = Joi.object({
    status: Joi.string()
        .valid('draft', 'pending', 'approved', 'active', 'closed', 'cancelled')
        .required()
        .messages({
            'any.only': 'Status must be one of: draft, pending, approved, active, closed, cancelled',
            'any.required': 'Status is required'
        })
});

// Application schema
exports.applicationSchema = Joi.object({
    coverLetter: Joi.string()
        .max(5000)
        .optional(),

    resumeUrl: Joi.string()
        .uri()
        .max(500)
        .optional()
});

// Application status update schema
exports.updateApplicationStatusSchema = Joi.object({
    status: Joi.string()
        .valid('submitted', 'under_review', 'shortlisted', 'rejected', 'interview_scheduled', 'selected', 'offer_accepted', 'offer_rejected', 'withdrawn')
        .required()
        .messages({
            'any.required': 'Status is required'
        }),

    notes: Joi.string()
        .max(2000)
        .optional()
});
