const router = require('express').Router();
const assetsController = require('../controllers/assetsController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const multer = require('multer');

// we'll store uploaded file in memory so we can parse directly
const upload = multer({ storage: multer.memoryStorage() });

// anyone authenticated can view list of assets
router.get('/',  assetsController.getAssets);

// allow admin to add individual asset via JSON
router.post('/', authMiddleware, allowRoles('admin'), assetsController.createAsset);

// admin can import assets via Excel file
router.post(
  '/import',
  authMiddleware,
  allowRoles('admin'),
  upload.single('file'),
  assetsController.importAssets
);

module.exports = router;