const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get all interviews
router.get('/', interviewController.getInterviews);

// Get single interview
router.get('/:id', interviewController.getInterview);

// Schedule interview (Admin, Officer, Coordinator)
router.post('/',
    authorize('admin', 'dept_officer', 'coordinator'),
    interviewController.scheduleInterview
);

// Update interview (Admin, Officer, Coordinator)
router.put('/:id',
    authorize('admin', 'dept_officer', 'coordinator'),
    interviewController.updateInterview
);

// Update interview status/result (Admin, Officer, Coordinator)
router.patch('/:id/status',
    authorize('admin', 'dept_officer', 'coordinator'),
    interviewController.updateInterviewStatus
);

// Delete interview (Admin, Officer)
router.delete('/:id',
    authorize('admin', 'dept_officer'),
    interviewController.deleteInterview
);

module.exports = router;
