const router = require('express').Router();
const permissionController = require('../controllers/permissionsController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

// Contractor can create a permission request
router.post('/', authMiddleware, allowRoles('contractor'), permissionController.createPermission);

// Contractor can view their own permission requests
router.get('/my-requests', authMiddleware, allowRoles('contractor'), permissionController.getMyPermissions);

// Get single permission by ID
router.get('/:id', authMiddleware, permissionController.getPermissionById);

// Admin, department_admin, super_admin can view all permission requests
router.get('/', authMiddleware, allowRoles('admin', 'department_admin', 'super_admin'), permissionController.getPermissions);

// Admin/Super Admin can approve or reject permission requests
router.patch('/:permissionId/status',
  authMiddleware,
  allowRoles('admin', 'super_admin', 'department_admin'),
  permissionController.updatePermissionStatus
);

// Complete permission (contractor or admin)
router.post('/:permissionId/complete',
  authMiddleware,
  permissionController.completePermission
);

module.exports = router;