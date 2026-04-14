const router = require('express').Router();
const complaintsController = require('../controllers/complaintsController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// ✅ CREATE COMPLAINT (with image upload)
router.post(
  '/',
  authMiddleware,
  upload.single("image"), // 👈 multer add
  complaintsController.createComplaint
);

// GET
router.get('/', authMiddleware, complaintsController.getComplaints);

// ANALYTICS
router.get(
  '/analytics',
  authMiddleware,
  allowRoles('admin','super_admin','analyzer'),
  complaintsController.getComplaintAnalytics
);

// GET BY ID
router.get('/:complaintId', authMiddleware, complaintsController.getComplaintById);

// ADD COMMENT
router.post('/:complaintId/comments', authMiddleware, complaintsController.addComment);

// MARK FAKE
router.patch(
  '/:complaintId/fake',
  authMiddleware,
  allowRoles('admin'),
  complaintsController.markAsFake
);

// UPDATE STATUS
router.patch(
  '/:complaintId/status',
  authMiddleware,
  allowRoles('admin','department_admin','analyzer','contractor','user'),
  complaintsController.updateComplaintStatus
);

// USER APPROVAL
router.patch(
  '/:complaintId/user-approval',
  authMiddleware,
  allowRoles('user'),
  complaintsController.userApproveComplaint
);

// DELETE
router.delete(
  '/:complaintId',
  authMiddleware,
  allowRoles('admin'),
  complaintsController.deleteComplaint
);

module.exports = router;