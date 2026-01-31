const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Department routes (accessible by all authenticated users)
router.get('/departments', userController.getDepartments);
router.post('/departments', authorize('admin'), userController.createDepartment);

// User management routes (Admin and Dept Officers)
router.get('/', authorize('admin', 'dept_officer'), userController.getUsers);
router.get('/:id', authorize('admin', 'dept_officer'), userController.getUser);
router.put('/:id', authorize('admin', 'dept_officer'), userController.updateUser);
router.delete('/:id', authorize('admin'), userController.deleteUser);

module.exports = router;
