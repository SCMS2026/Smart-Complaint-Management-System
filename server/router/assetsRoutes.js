const router = require('express').Router();
const assetsController = require('../controllers/assetsController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const multer = require('multer');

// we'll store uploaded file in memory so we can parse directly
const upload = multer({ storage: multer.memoryStorage() });

// Anyone authenticated can view list of assets
router.get('/', assetsController.getAssets);

// Get filter options
router.get('/filters', assetsController.getAssetFilters);

// Get single asset by ID
router.get('/:id', assetsController.getAssetById);

// Admin can create individual asset via JSON
router.post('/', authMiddleware, allowRoles('admin'), assetsController.createAsset);

// Admin can update asset
router.put('/:id', authMiddleware, allowRoles('admin'), assetsController.updateAsset);

// Admin can delete asset
router.delete('/:id', authMiddleware, allowRoles('admin'), assetsController.deleteAsset);

// Admin can import assets via Excel file
router.post(
  '/import',
  authMiddleware,
  allowRoles('admin'),
  upload.single('file'),
  assetsController.importAssets
);

module.exports = router;