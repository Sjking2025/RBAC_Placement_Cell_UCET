const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { protect, authorize } = require('../middleware/auth');

// All export routes require admin or officer role
router.use(protect);
router.use(authorize('admin', 'dept_officer'));

/**
 * @route   GET /api/v1/export/students
 * @desc    Export students data as CSV
 * @query   departmentId, batchYear, placementStatus
 */
router.get('/students', exportController.exportStudents);

/**
 * @route   GET /api/v1/export/placements
 * @desc    Export placements data as CSV
 * @query   academicYear, departmentId
 */
router.get('/placements', exportController.exportPlacements);

/**
 * @route   GET /api/v1/export/companies
 * @desc    Export companies data as CSV
 */
router.get('/companies', exportController.exportCompanies);

/**
 * @route   GET /api/v1/export/analytics
 * @desc    Export analytics summary as CSV
 */
router.get('/analytics', exportController.exportAnalytics);

module.exports = router;
