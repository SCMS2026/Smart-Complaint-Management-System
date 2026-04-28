const WorkerTask = require('../models/workerTaskModel');
const User = require('../models/authModels');
const Complaint = require('../models/complaintsModel');

// Create Worker Task (manual assign by admin/department_admin)
const createWorkerTask = async (req, res) => {
    try {
        const { complaint_id, worker_id, status, before_photo, after_photo } = req.body;

        if (!complaint_id || !worker_id) {
            return res.status(400).json({ message: 'Complaint ID and Worker ID are required' });
        }

        const workerTask = new WorkerTask({
            complaint_id,
            worker_id,
            status: status || 'assigned',
            before_photo,
            after_photo
        });

        await workerTask.save();

        // Update complaint status to 'assigned'
        await Complaint.findByIdAndUpdate(complaint_id, { status: 'assigned' });

        res.status(201).json({
            message: 'Worker task created successfully',
            workerTask
        });
    } catch (error) {
        console.error('Create worker task error:', error);
        res.status(500).json({ message: 'Error creating worker task', error: error.message });
    }
};

// FIX 3: Auto Assign Worker - Least Busy (minLoad = Infinity fix applied)
const autoAssignWorkerToComplaint = async (req, res) => {
    try {
        const { complaint_id } = req.body;

        if (!complaint_id) {
            return res.status(400).json({ message: 'Complaint ID is required for auto assignment' });
        }

        const workers = await User.find({ role: 'worker', status: 'active' });
        if (!workers.length) {
            return res.status(404).json({ message: 'No active workers found' });
        }

        const tasks = await WorkerTask.aggregate([
            { $match: { status: { $in: ['assigned', 'started'] } } },
            { $group: { _id: '$worker_id', count: { $sum: 1 } } }
        ]);

        const countMap = tasks.reduce((map, item) => {
            map[item._id.toString()] = item.count;
            return map;
        }, {});

        // FIXED: Infinity use karyo so every worker properly compared
        let selectedWorker = null;
        let minLoad = Infinity;

        for (const worker of workers) {
            const load = countMap[worker._id.toString()] || 0;
            if (load < minLoad) {
                minLoad = load;
                selectedWorker = worker;
            }
        }

        if (!selectedWorker) {
            return res.status(404).json({ message: 'Could not select a worker' });
        }

        const workerTask = new WorkerTask({
            complaint_id,
            worker_id: selectedWorker._id,
            status: 'assigned'
        });

        await workerTask.save();

        // Update complaint status to 'assigned'
        await Complaint.findByIdAndUpdate(complaint_id, { status: 'assigned' });

        res.status(201).json({
            message: 'Complaint auto-assigned to least busy worker',
            workerTask,
            assignedWorker: {
                _id: selectedWorker._id,
                name: selectedWorker.name,
                email: selectedWorker.email,
                currentLoad: minLoad
            }
        });
    } catch (error) {
        console.error('Auto-assign worker error:', error);
        res.status(500).json({ message: 'Error auto-assigning worker', error: error.message });
    }
};

// Get All Worker Tasks
const getWorkerTasks = async (req, res) => {
    try {
        const filter = {};

        if (req.user && (req.user.role === 'worker' || req.user.role === 'contractor')) {
            filter.worker_id = req.user.id;
        } else if (req.user && req.user.role === 'department_admin') {
            // Department admins see tasks for complaints in their department
            const complaintsInDept = await Complaint.find({ department_id: req.user.department }).select('_id');
            const complaintIds = complaintsInDept.map(c => c._id);
            filter.complaint_id = { $in: complaintIds };
        }

        const workerTasks = await WorkerTask.find(filter)
            .populate('complaint_id', 'issue description status location city department_id')
            .populate('worker_id', 'name email department');

        res.status(200).json({ workerTasks });
    } catch (error) {
        console.error('Get worker tasks error:', error);
        res.status(500).json({ message: 'Error fetching worker tasks', error: error.message });
    }
};

// Get Worker Task by ID
const getWorkerTaskById = async (req, res) => {
    try {
        const { taskId } = req.params;

        const workerTask = await WorkerTask.findById(taskId)
            .populate('complaint_id', 'issue description status location')
            .populate('worker_id', 'name email');

        if (!workerTask) {
            return res.status(404).json({ message: 'Worker task not found' });
        }

        res.status(200).json({ workerTask });
    } catch (error) {
        console.error('Get worker task error:', error);
        res.status(500).json({ message: 'Error fetching worker task', error: error.message });
    }
};

// Update Worker Task Status
const updateWorkerTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status, before_photo, after_photo } = req.body;

        const updateData = { updatedAt: new Date() };
        if (status) updateData.status = status;
        if (before_photo) updateData.before_photo = before_photo;
        if (after_photo) updateData.after_photo = after_photo;

        const workerTask = await WorkerTask.findByIdAndUpdate(
            taskId,
            updateData,
            { new: true }
        )
            .populate('complaint_id', 'issue description status')
            .populate('worker_id', 'name email');

        if (!workerTask) {
            return res.status(404).json({ message: 'Worker task not found' });
        }

        // Worker completes task -> complaint goes to user_approval_pending
        if (status === 'completed' && workerTask.complaint_id) {
            await Complaint.findByIdAndUpdate(
                workerTask.complaint_id._id,
                { status: 'user_approval_pending' }
            );
        }

        // Worker starts task -> complaint goes to in_progress
        if (status === 'started' && workerTask.complaint_id) {
            await Complaint.findByIdAndUpdate(
                workerTask.complaint_id._id,
                { status: 'in_progress' }
            );
        }

        res.status(200).json({
            message: 'Worker task updated successfully',
            workerTask
        });
    } catch (error) {
        console.error('Update worker task error:', error);
        res.status(500).json({ message: 'Error updating worker task', error: error.message });
    }
};

// Delete Worker Task
const deleteWorkerTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const workerTask = await WorkerTask.findByIdAndDelete(taskId);

        if (!workerTask) {
            return res.status(404).json({ message: 'Worker task not found' });
        }

        res.status(200).json({ message: 'Worker task deleted successfully' });
    } catch (error) {
        console.error('Delete worker task error:', error);
        res.status(500).json({ message: 'Error deleting worker task', error: error.message });
    }
};

// Get Worker Tasks by Complaint ID
const getWorkerTasksByComplaint = async (req, res) => {
    try {
        const { complaintId } = req.params;

        const workerTasks = await WorkerTask.find({ complaint_id: complaintId })
            .populate('worker_id', 'name email');

        res.status(200).json({ workerTasks });
    } catch (error) {
        console.error('Get worker tasks by complaint error:', error);
        res.status(500).json({ message: 'Error fetching worker tasks', error: error.message });
    }
};

module.exports = {
    createWorkerTask,
    autoAssignWorkerToComplaint,
    getWorkerTasks,
    getWorkerTaskById,
    updateWorkerTaskStatus,
    deleteWorkerTask,
    getWorkerTasksByComplaint
};