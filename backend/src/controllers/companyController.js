const prisma = require('../config/database');
const { getPagination, formatPaginationResponse } = require('../utils/helpers');

/**
 * @desc    Get all companies
 * @route   GET /api/v1/companies
 * @access  Private
 */
exports.getCompanies = async (req, res, next) => {
    try {
        const { status, industry, search } = req.query;
        const { page, limit, skip } = getPagination(req.query.page, req.query.limit);

        const where = {};

        // Students only see approved/active companies
        if (req.user.role === 'student') {
            where.status = { in: ['approved', 'active'] };
        } else if (status) {
            where.status = status;
        }

        if (industry) where.industry = { contains: industry, mode: 'insensitive' };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { industry: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [companies, total] = await Promise.all([
            prisma.company.findMany({
                where,
                include: {
                    contacts: true,
                    _count: {
                        select: { job_postings: true, placement_records: true }
                    }
                },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' }
            }),
            prisma.company.count({ where })
        ]);

        res.status(200).json({
            success: true,
            data: companies,
            pagination: formatPaginationResponse(total, page, limit)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single company
 * @route   GET /api/v1/companies/:id
 * @access  Private
 */
exports.getCompany = async (req, res, next) => {
    try {
        const companyId = parseInt(req.params.id);

        const company = await prisma.company.findUnique({
            where: { id: companyId },
            include: {
                contacts: true,
                job_postings: {
                    where: req.user.role === 'student' ? { status: 'active' } : {},
                    orderBy: { created_at: 'desc' }
                },
                placement_records: req.user.role !== 'student' ? {
                    include: {
                        student: {
                            include: { user: { select: { email: true } } }
                        }
                    }
                } : false,
                creator: {
                    select: {
                        id: true,
                        email: true,
                        user_profile: { select: { first_name: true, last_name: true } }
                    }
                }
            }
        });

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        res.status(200).json({
            success: true,
            data: company
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create company
 * @route   POST /api/v1/companies
 * @access  Private (Admin, Officer, Coordinator)
 */
exports.createCompany = async (req, res, next) => {
    try {
        const { name, website, industry, description, address, city, state, country, contacts } = req.body;

        const company = await prisma.company.create({
            data: {
                name,
                website,
                industry,
                description,
                address,
                city,
                state,
                country: country || 'India',
                status: req.user.role === 'admin' ? 'approved' : 'pending',
                created_by: req.user.id,
                contacts: contacts ? {
                    create: contacts.map(c => ({
                        name: c.name,
                        designation: c.designation,
                        email: c.email,
                        phone: c.phone,
                        is_primary: c.isPrimary || false
                    }))
                } : undefined
            },
            include: { contacts: true }
        });

        res.status(201).json({
            success: true,
            message: 'Company created successfully',
            data: company
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update company
 * @route   PUT /api/v1/companies/:id
 * @access  Private (Admin, Officer, Creator)
 */
exports.updateCompany = async (req, res, next) => {
    try {
        const companyId = parseInt(req.params.id);

        const existingCompany = await prisma.company.findUnique({
            where: { id: companyId }
        });

        if (!existingCompany) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Check permission
        if (req.user.role !== 'admin' && existingCompany.created_by !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this company'
            });
        }

        const updateData = {};
        const allowedFields = ['name', 'website', 'industry', 'description', 'address', 'city', 'state', 'country', 'logo_url'];

        Object.keys(req.body).forEach(key => {
            const dbField = key === 'logoUrl' ? 'logo_url' : key;
            if (allowedFields.includes(dbField)) {
                updateData[dbField] = req.body[key];
            }
        });

        const company = await prisma.company.update({
            where: { id: companyId },
            data: updateData,
            include: { contacts: true }
        });

        res.status(200).json({
            success: true,
            message: 'Company updated successfully',
            data: company
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete company
 * @route   DELETE /api/v1/companies/:id
 * @access  Private (Admin)
 */
exports.deleteCompany = async (req, res, next) => {
    try {
        const companyId = parseInt(req.params.id);

        const company = await prisma.company.findUnique({
            where: { id: companyId }
        });

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        await prisma.company.delete({
            where: { id: companyId }
        });

        res.status(200).json({
            success: true,
            message: 'Company deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update company status
 * @route   PATCH /api/v1/companies/:id/status
 * @access  Private (Admin, Officer)
 */
exports.updateCompanyStatus = async (req, res, next) => {
    try {
        const companyId = parseInt(req.params.id);
        const { status } = req.body;

        const company = await prisma.company.update({
            where: { id: companyId },
            data: {
                status,
                approved_by: status === 'approved' ? req.user.id : undefined,
                approved_at: status === 'approved' ? new Date() : undefined
            },
            include: { contacts: true }
        });

        res.status(200).json({
            success: true,
            message: `Company status updated to ${status}`,
            data: company
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add company contact
 * @route   POST /api/v1/companies/:id/contacts
 * @access  Private (Admin, Officer, Creator)
 */
exports.addContact = async (req, res, next) => {
    try {
        const companyId = parseInt(req.params.id);
        const { name, designation, email, phone, isPrimary } = req.body;

        // If this is primary, unset other primaries
        if (isPrimary) {
            await prisma.companyContact.updateMany({
                where: { company_id: companyId },
                data: { is_primary: false }
            });
        }

        const contact = await prisma.companyContact.create({
            data: {
                company_id: companyId,
                name,
                designation,
                email,
                phone,
                is_primary: isPrimary || false
            }
        });

        res.status(201).json({
            success: true,
            message: 'Contact added successfully',
            data: contact
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete company contact
 * @route   DELETE /api/v1/companies/:id/contacts/:contactId
 * @access  Private (Admin, Officer, Creator)
 */
exports.deleteContact = async (req, res, next) => {
    try {
        const contactId = parseInt(req.params.contactId);

        await prisma.companyContact.delete({
            where: { id: contactId }
        });

        res.status(200).json({
            success: true,
            message: 'Contact deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = exports;
