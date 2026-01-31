const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Student's own analytics
router.get('/me', authorize('student'), analyticsController.getMyStats);

// Overall statistics (Admin, Officer)
router.get('/overview', authorize('admin', 'dept_officer'), analyticsController.getOverview);

// Department statistics
router.get('/department/:id', analyticsController.getDepartmentStats);

// Company statistics (Admin, Officer)
router.get('/companies', authorize('admin', 'dept_officer'), analyticsController.getCompanyStats);

// Placement trends (Admin, Officer)
router.get('/trends', authorize('admin', 'dept_officer'), analyticsController.getPlacementTrends);

// Refresh cache (Admin only)
router.post('/refresh', authorize('admin'), analyticsController.refreshCache);

module.exports = router;
