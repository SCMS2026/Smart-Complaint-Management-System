const router = require('express').Router();
const permissionController = require('../controllers/permissionsController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

// contractor can create a permission request
router.post('/', authMiddleware, allowRoles('contractor'), permissionController.createPermission);

// admin and department_admin can view permission requests
router.get('/', authMiddleware, allowRoles('admin','department_admin'), permissionController.getPermissions);

module.exports = router;