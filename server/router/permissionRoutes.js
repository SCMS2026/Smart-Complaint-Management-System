const router = require('express').Router();
const permissionController = require('../controllers/permissionsController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

// contractor can create a permission request
router.post('/', authMiddleware, allowRoles('contractor'), permissionController.createPermission);

// admin and department_admin can view permission requests
router.get('/', authMiddleware, allowRoles('admin','department_admin','super_admin'), permissionController.getPermissions);

// FIX 6: Super Admin / Admin can approve or reject permission requests
router.patch('/:permissionId/status',
  authMiddleware,
  allowRoles('admin', 'super_admin'),
  permissionController.updatePermissionStatus
);

module.exports = router;