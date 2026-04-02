const router = require('express').Router();
const departmentController = require('../controllers/departmentController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

// Get all departments - authenticated users can view
router.get('/', authMiddleware, departmentController.getDepartments);

// Get department by ID - authenticated users can view
router.get('/:departmentId', authMiddleware, departmentController.getDepartmentById);

// Create department - admin or super_admin
router.post('/', authMiddleware, allowRoles('admin','super_admin'), departmentController.createDepartment);

// Update department - admin or super_admin
router.put('/:departmentId', authMiddleware, allowRoles('admin','super_admin'), departmentController.updateDepartment);

// Delete department - admin or super_admin
router.delete('/:departmentId', authMiddleware, allowRoles('admin','super_admin'), departmentController.deleteDepartment);

module.exports = router;
