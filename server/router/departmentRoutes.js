const router = require('express').Router();
const departmentController = require('../controllers/departmentController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

// Get all departments - authenticated users can view
router.get('/', authMiddleware, departmentController.getDepartments);

// Get department by ID - authenticated users can view
router.get('/:departmentId', authMiddleware, departmentController.getDepartmentById);

// Create department - admin only
router.post('/', authMiddleware, allowRoles('admin'), departmentController.createDepartment);

// Update department - admin only
router.put('/:departmentId', authMiddleware, allowRoles('admin'), departmentController.updateDepartment);

// Delete department - admin only
router.delete('/:departmentId', authMiddleware, allowRoles('admin'), departmentController.deleteDepartment);

module.exports = router;
