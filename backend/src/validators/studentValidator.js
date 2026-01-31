const Joi = require('joi');

/**
 * Student validation schemas
 */

// Update student profile schema
exports.updateProfileSchema = Joi.object({
    rollNumber: Joi.string()
        .max(50)
        .optional(),

    degree: Joi.string()
        .valid('BTech', 'MTech', 'MBA', 'MCA', 'BSc', 'MSc', 'BBA', 'BCA')
        .optional(),

    departmentId: Joi.number()
        .integer()
        .positive()
        .optional(),

    batchYear: Joi.number()
        .integer()
        .min(2000)
        .max(2100)
        .optional(),

    currentSemester: Joi.number()
        .integer()
        .min(1)
        .max(10)
        .optional(),

    cgpa: Joi.number()
        .min(0)
        .max(10)
        .precision(2)
        .optional(),

    tenthPercentage: Joi.number()
        .min(0)
        .max(100)
        .precision(2)
        .optional(),

    twelfthPercentage: Joi.number()
        .min(0)
        .max(100)
        .precision(2)
        .optional(),

    activeBacklogs: Joi.number()
        .integer()
        .min(0)
        .optional(),

    dateOfBirth: Joi.date()
        .max('now')
        .optional(),

    gender: Joi.string()
        .valid('male', 'female', 'other')
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

    pincode: Joi.string()
        .pattern(/^\d{6}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Pincode must be a 6-digit number'
        }),

    phone: Joi.string()
        .pattern(/^[+]?[\d\s-]{10,15}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Please provide a valid phone number'
        })
});

// Add skill schema
exports.addSkillSchema = Joi.object({
    skillName: Joi.string()
        .max(100)
        .required()
        .messages({
            'any.required': 'Skill name is required'
        }),

    proficiencyLevel: Joi.string()
        .valid('beginner', 'intermediate', 'advanced', 'expert')
        .optional()
});

// Add project schema
exports.addProjectSchema = Joi.object({
    title: Joi.string()
        .max(255)
        .required()
        .messages({
            'any.required': 'Project title is required'
        }),

    description: Joi.string()
        .max(2000)
        .optional(),

    technologies: Joi.string()
        .max(500)
        .optional(),

    startDate: Joi.date()
        .optional(),

    endDate: Joi.date()
        .min(Joi.ref('startDate'))
        .optional()
        .messages({
            'date.min': 'End date must be after start date'
        }),

    projectUrl: Joi.string()
        .uri()
        .max(500)
        .optional()
});

// Add certification schema
exports.addCertificationSchema = Joi.object({
    name: Joi.string()
        .max(255)
        .required()
        .messages({
            'any.required': 'Certification name is required'
        }),

    issuingOrganization: Joi.string()
        .max(255)
        .optional(),

    issueDate: Joi.date()
        .optional(),

    expiryDate: Joi.date()
        .min(Joi.ref('issueDate'))
        .optional(),

    credentialId: Joi.string()
        .max(255)
        .optional(),

    credentialUrl: Joi.string()
        .uri()
        .max(500)
        .optional()
});

// Add internship schema
exports.addInternshipSchema = Joi.object({
    companyName: Joi.string()
        .max(255)
        .required()
        .messages({
            'any.required': 'Company name is required'
        }),

    role: Joi.string()
        .max(255)
        .optional(),

    description: Joi.string()
        .max(2000)
        .optional(),

    startDate: Joi.date()
        .optional(),

    endDate: Joi.date()
        .min(Joi.ref('startDate'))
        .optional(),

    location: Joi.string()
        .max(255)
        .optional()
});
