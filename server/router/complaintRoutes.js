const router = require('express').Router();
const complaintsController = require('../controllers/complaintsController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  };
};

const createComplaintValidation = [
  body('issue').trim().notEmpty().withMessage('Issue is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('District').trim().notEmpty().withMessage('District is required'),
  body('Taluka').trim().notEmpty().withMessage('Taluka is required'),
  body('village').trim().notEmpty().withMessage('Village is required'),
  body('pincode').trim().matches(/^\d{6}$/).withMessage('Valid 6-digit pincode is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
];

// ✅ CREATE COMPLAINT (with image upload)
router.post(
  '/',
  authMiddleware,
  upload.single("image"), // 👈 multer add
  createComplaintValidation,
  validate(createComplaintValidation),
  complaintsController.createComplaint
);

// GET
router.get('/', authMiddleware, complaintsController.getComplaints);

// ANALYTICS
router.get(
  '/analytics',
  authMiddleware,
  allowRoles('admin','super_admin','analyzer','department_admin'),
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

// BULK DELETE — must be BEFORE /:complaintId to avoid being caught as a param
router.delete(
  '/bulk',
  authMiddleware,
  allowRoles('admin'),
  complaintsController.bulkDeleteComplaints
);

// DELETE
router.delete(
  '/:complaintId',
  authMiddleware,
  allowRoles('admin'),
  complaintsController.deleteComplaint
);

// PUBLIC TRACKING — no auth needed, only status + timeline (no sensitive data)
router.get('/track/:complaintId', complaintsController.trackComplaint);

// PUBLIC SEARCH — search by name / issue / location (no auth)
router.get('/search/public', complaintsController.searchComplaints);

module.exports = router;