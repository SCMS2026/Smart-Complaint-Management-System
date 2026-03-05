const router = require('express').Router();
const assetsController = require('../controllers/assetsController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

// anyone authenticated can view list of assets
router.get('/', authMiddleware, assetsController.getAssets);

module.exports = router;