const router = require('express').Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// GET /notifications - list notifications with pagination
router.get('/', notificationController.getNotifications);

// GET /notifications/unread - get unread count only
router.get('/unread', notificationController.getUnreadNotifications);

// PATCH /notifications/:id/mark-read - mark single as read
router.patch('/:notificationId/mark-read', notificationController.markAsRead);

// POST /notifications/mark-all-read - mark all as read
router.post('/mark-all-read', notificationController.markAllAsRead);

// DELETE /notifications/:id - delete single notification
router.delete('/:notificationId', notificationController.deleteNotification);

// DELETE /notifications/clear-all - clear all notifications
router.delete('/clear-all', notificationController.clearAllNotifications);

module.exports = router;
