const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { jobSchema, updateJobStatusSchema, applicationSchema } = require('../validators/jobValidator');

// All routes require authentication
router.use(protect);

// Get all jobs
router.get('/', jobController.getJobs);

// Get single job
router.get('/:id', jobController.getJob);

// Create job (Admin, Officer, Coordinator)
router.post('/',
    authorize('admin', 'dept_officer', 'coordinator'),
    validate(jobSchema),
    jobController.createJob
);

// Update job
router.put('/:id',
    authorize('admin', 'dept_officer', 'coordinator'),
    jobController.updateJob
);

// Delete job (Admin, Officer)
router.delete('/:id',
    authorize('admin', 'dept_officer'),
    jobController.deleteJob
);

// Update job status (Admin, Officer)
router.patch('/:id/status',
    authorize('admin', 'dept_officer'),
    validate(updateJobStatusSchema),
    jobController.updateJobStatus
);

// Apply to job (Students only)
router.post('/:id/apply',
    authorize('student'),
    validate(applicationSchema),
    jobController.applyToJob
);

// Get job applications (Admin, Officer, Coordinator)
router.get('/:id/applications',
    authorize('admin', 'dept_officer', 'coordinator'),
    jobController.getJobApplications
);

module.exports = router;
