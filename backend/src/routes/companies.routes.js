const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { uploadLogo } = require('../middleware/upload');
const { companySchema, companyContactSchema, updateStatusSchema } = require('../validators/companyValidator');

// All routes require authentication
router.use(protect);

// Get all companies (Admin, Officer, Coordinator only - NOT students)
router.get('/', authorize('admin', 'dept_officer', 'coordinator'), companyController.getCompanies);

// Get single company (Admin, Officer, Coordinator only - NOT students)
router.get('/:id', authorize('admin', 'dept_officer', 'coordinator'), companyController.getCompany);

// Create company (Admin, Officer, Coordinator)
router.post('/',
    authorize('admin', 'dept_officer', 'coordinator'),
    validate(companySchema),
    companyController.createCompany
);

// Update company
router.put('/:id',
    authorize('admin', 'dept_officer', 'coordinator'),
    validate(companySchema),
    companyController.updateCompany
);

// Delete company (Admin only)
router.delete('/:id', authorize('admin'), companyController.deleteCompany);

// Update company status (Admin, Officer)
router.patch('/:id/status',
    authorize('admin', 'dept_officer'),
    validate(updateStatusSchema),
    companyController.updateCompanyStatus
);

// Company contacts
router.post('/:id/contacts',
    authorize('admin', 'dept_officer', 'coordinator'),
    validate(companyContactSchema),
    companyController.addContact
);
router.delete('/:id/contacts/:contactId',
    authorize('admin', 'dept_officer', 'coordinator'),
    companyController.deleteContact
);

// Logo upload
router.post('/:id/logo',
    authorize('admin', 'dept_officer', 'coordinator'),
    uploadLogo,
    async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            const prisma = require('../config/database');
            const companyId = parseInt(req.params.id);

            const logoUrl = `/uploads/logos/${req.file.filename}`;

            await prisma.company.update({
                where: { id: companyId },
                data: { logo_url: logoUrl }
            });

            res.status(200).json({
                success: true,
                message: 'Logo uploaded successfully',
                data: { logoUrl }
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
