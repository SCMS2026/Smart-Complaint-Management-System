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

module.exports = {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
};
