const router = require('express').Router();
const workerTaskController = require('../controllers/workerTaskController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

// ✅ Specific routes પહેલા રાખો
router.get('/', authMiddleware, workerTaskController.getWorkerTasks);

router.get('/complaint/:complaintId', authMiddleware, workerTaskController.getWorkerTasksByComplaint);

router.post('/', authMiddleware, allowRoles('admin', 'contractor', 'department_admin', 'super_admin'), workerTaskController.createWorkerTask);

// ✅ auto-assign, /:taskId પહેલા હોવો જોઈએ
router.post('/auto-assign', authMiddleware, allowRoles('admin', 'department_admin', 'super_admin'), workerTaskController.autoAssignWorkerToComplaint);

// ✅ Dynamic :id routes છેલ્લે
router.get('/:taskId', authMiddleware, workerTaskController.getWorkerTaskById);

router.patch('/:taskId', authMiddleware, allowRoles('admin', 'contractor', 'worker', 'department_admin', 'super_admin'), workerTaskController.updateWorkerTaskStatus);

router.delete('/:taskId', authMiddleware, allowRoles('admin'), workerTaskController.deleteWorkerTask);

module.exports = router;