const router = require('express').Router();
const workerTaskController = require('../controllers/workerTaskController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

// Get all worker tasks - admin and analyzer can view all, workers can view their own
router.get('/', authMiddleware, workerTaskController.getWorkerTasks);

// Get worker task by ID - authenticated users can view
router.get('/:taskId', authMiddleware, workerTaskController.getWorkerTaskById);

// Get worker tasks by complaint ID - authenticated users can view
router.get('/complaint/:complaintId', authMiddleware, workerTaskController.getWorkerTasksByComplaint);

// Create worker task - admin and contractor can create
router.post('/', authMiddleware, allowRoles('admin', 'contractor'), workerTaskController.createWorkerTask);

// Auto assign complaint to least busy worker
router.post('/auto-assign', authMiddleware, allowRoles('admin','department_admin','super_admin'), workerTaskController.autoAssignWorkerToComplaint);

// Update worker task status - admin, contractor, and worker can update
router.patch('/:taskId', authMiddleware, allowRoles('admin', 'contractor', 'worker'), workerTaskController.updateWorkerTaskStatus);

// Delete worker task - admin only
router.delete('/:taskId', authMiddleware, allowRoles('admin'), workerTaskController.deleteWorkerTask);

module.exports = router;
