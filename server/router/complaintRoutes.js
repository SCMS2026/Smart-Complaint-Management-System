const router = require('express').Router();
const complaintsController = require('../controllers/complaintsController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

// All users may create a complaint
router.post('/', authMiddleware, complaintsController.createComplaint);

// Get complaints (admins see all, users see their own maybe later)
router.get('/', authMiddleware, complaintsController.getComplaints);

// Update status (only admin/analyst/contractor)
router.patch('/:complaintId/status', authMiddleware, allowRoles('admin','analyzer','contractor'), complaintsController.updateComplaintStatus);

// Delete complaint (admin only)
router.delete('/:complaintId', authMiddleware, allowRoles('admin'), complaintsController.deleteComplaint);

module.exports = router;
