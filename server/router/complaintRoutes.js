const router = require('express').Router();
const complaintsController = require('../controllers/complaintsController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

router.post('/', authMiddleware, complaintsController.createComplaint);
router.get('/', authMiddleware, complaintsController.getComplaints);
router.get('/analytics', authMiddleware, allowRoles('admin','super_admin','analyzer'), complaintsController.getComplaintAnalytics);
router.get('/:complaintId', authMiddleware, complaintsController.getComplaintById);
router.post('/:complaintId/comments', authMiddleware, complaintsController.addComment);
router.patch('/:complaintId/fake', authMiddleware, allowRoles('admin'), complaintsController.markAsFake);
router.patch('/:complaintId/status', authMiddleware, allowRoles('admin','department_admin','analyzer','contractor','user'), complaintsController.updateComplaintStatus);
router.patch('/:complaintId/user-approval', authMiddleware, allowRoles('user'), complaintsController.userApproveComplaint);
router.delete('/:complaintId', authMiddleware, allowRoles('admin'), complaintsController.deleteComplaint);

module.exports = router;
