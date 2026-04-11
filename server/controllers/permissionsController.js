const Permission = require('../models/permissionsModels');

const createPermission = async (req, res) => {
    try {
        const { assetId, reason } = req.body;
        const requestBy = req.user?.id;
        if (!requestBy) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        if (!assetId || !reason) {
            return res.status(400).json({ message: 'Missing required fields: assetId, reason' });
        }
        const newPerm = new Permission({ requestBy, assetId, reason });
        await newPerm.save();
        res.status(201).json({ message: 'Permission request created', permission: newPerm });
    } catch (error) {
        console.error('Error creating permission request:', error);
        res.status(500).json({ message: 'Error creating permission request', error: error.message });
    }
};

const getPermissions = async (req, res) => {
    try {
        const perms = await Permission.find()
            .populate('requestBy', 'name role')
            .populate('assetId', 'name');
        res.status(200).json({ permissions: perms });
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ message: 'Error fetching permissions', error: error.message });
    }
};

// FIX 6: Approve or Reject a permission request
const updatePermissionStatus = async (req, res) => {
    try {
        const { permissionId } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
        }

        const perm = await Permission.findByIdAndUpdate(
            permissionId,
            { status, reviewedBy: req.user.id, updatedAt: new Date() },
            { new: true }
        )
            .populate('requestBy', 'name role')
            .populate('assetId', 'name');

        if (!perm) {
            return res.status(404).json({ message: 'Permission request not found' });
        }

        res.status(200).json({
            message: `Permission ${status} successfully`,
            permission: perm
        });
    } catch (error) {
        console.error('Error updating permission status:', error);
        res.status(500).json({ message: 'Error updating permission', error: error.message });
    }
};

module.exports = {
    createPermission,
    getPermissions,
    updatePermissionStatus
};