const mongoose = require('mongoose');
const Department = require('../models/departmentModel');

// Create Department
const createDepartment = async (req, res) => {
    try {
        const { name, description } = req.body;
        const admin_id = req.user?.id;

        if (!name) {
            return res.status(400).json({ message: 'Department name is required' });
        }

        const department = new Department({
            name,
            description,
            admin: admin_id
        });

        await department.save();

        res.status(201).json({
            message: 'Department created successfully',
            department
        });
    } catch (error) {
        console.error('Create department error:', error);
        res.status(500).json({ message: 'Error creating department', error: error.message });
    }
};

// Get All Departments
const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find()
            .populate('admin', 'name email');

        res.status(200).json({ departments });
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({ message: 'Error fetching departments', error: error.message });
    }
};

// Get Department by ID
const getDepartmentById = async (req, res) => {
    try {
        const { departmentId } = req.params;

        const department = await Department.findById(departmentId)
            .populate('admin', 'name email');

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        res.status(200).json({ department });
    } catch (error) {
        console.error('Get department error:', error);
        res.status(500).json({ message: 'Error fetching department', error: error.message });
    }
};

// Update Department
const updateDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const { name, description } = req.body;

        const department = await Department.findByIdAndUpdate(
            departmentId,
            { name, description, updatedAt: new Date() },
            { new: true }
        ).populate('admin', 'name email');

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        res.status(200).json({
            message: 'Department updated successfully',
            department
        });
    } catch (error) {
        console.error('Update department error:', error);
        res.status(500).json({ message: 'Error updating department', error: error.message });
    }
};

// Delete Department
const deleteDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;

        const department = await Department.findByIdAndDelete(departmentId);

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        res.status(200).json({ message: 'Department deleted successfully' });
    } catch (error) {
        console.error('Delete department error:', error);
        res.status(500).json({ message: 'Error deleting department', error: error.message });
    }
};

// Get Department Dashboard Stats
const getDepartmentDashboard = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const user = req.user;

        // Check permissions
        if (user.role === 'department_admin' && user.department && user.department.toString() !== departmentId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const department = await Department.findById(departmentId).populate('admin', 'name email');
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Get department statistics
        const Complaint = require('../models/complaintsModel');
        const WorkerTask = require('../models/workerTaskModel');
        const Asset = require('../models/assetsModels');
        const User = require('../models/authModels');

        const totalComplaints = await Complaint.countDocuments({ department_id: departmentId });
        const pendingComplaints = await Complaint.countDocuments({
            department_id: departmentId,
            status: { $in: ['pending', 'verified', 'assigned', 'in_progress'] }
        });
        const completedComplaints = await Complaint.countDocuments({
            department_id: departmentId,
            status: 'completed'
        });

        const totalWorkers = await User.countDocuments({
            department: departmentId,
            role: 'worker',
            status: 'active'
        });

        const totalAssets = await Asset.countDocuments({ department_id: departmentId });

        const activeTasks = await WorkerTask.countDocuments({
            'complaint_id.department_id': departmentId,
            status: { $nin: ['completed', 'cancelled'] }
        });

        // Recent complaints
        const recentComplaints = await Complaint.find({ department_id: departmentId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'name')
            .select('issue status createdAt');

        // Department performance
        const avgResolutionTime = await Complaint.aggregate([
            { $match: { department_id: mongoose.Types.ObjectId(departmentId), status: 'completed' } },
            {
                $lookup: {
                    from: 'workertasks',
                    localField: '_id',
                    foreignField: 'complaint_id',
                    as: 'tasks'
                }
            },
            {
                $project: {
                    resolutionTime: {
                        $divide: [
                            { $subtract: ['$updatedAt', '$createdAt'] },
                            1000 * 60 * 60 // Convert to hours
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    avgTime: { $avg: '$resolutionTime' }
                }
            }
        ]);

        const performance = {
            avgResolutionTime: avgResolutionTime.length > 0 ? Math.round(avgResolutionTime[0].avgTime * 10) / 10 : 0,
            satisfactionRate: 85, // Placeholder - would need user feedback system
            lastUpdated: new Date()
        };

        res.status(200).json({
            department,
            stats: {
                totalComplaints,
                pendingComplaints,
                completedComplaints,
                totalWorkers,
                totalAssets,
                activeTasks
            },
            recentComplaints,
            performance
        });
    } catch (error) {
        console.error('Get department dashboard error:', error);
        res.status(500).json({ message: 'Error fetching department dashboard', error: error.message });
    }
};

module.exports = {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
    getDepartmentDashboard
};
