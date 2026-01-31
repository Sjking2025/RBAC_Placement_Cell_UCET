const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { updateApplicationStatusSchema } = require('../validators/jobValidator');

// All routes require authentication
router.use(protect);

// Get all applications
router.get('/', applicationController.getApplications);

// Get single application
router.get('/:id', applicationController.getApplication);

// Update application status (Admin, Officer, Coordinator)
router.patch('/:id/status',
    authorize('admin', 'dept_officer', 'coordinator'),
    validate(updateApplicationStatusSchema),
    applicationController.updateApplicationStatus
);

// Withdraw application (Students only)
router.post('/:id/withdraw',
    authorize('student'),
    applicationController.withdrawApplication
);

// Bulk update status (Admin, Officer)
router.post('/bulk-status',
    authorize('admin', 'dept_officer'),
    applicationController.bulkUpdateStatus
);

module.exports = router;
