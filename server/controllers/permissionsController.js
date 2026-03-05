const Permission = require('../models/permissionsModels');

const createPermission = async (req, res) => {
    try {
        const { assetId, reason } = req.body;
        // requestBy should come from authenticated user
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
        // admin can see all
        const perms = await Permission.find()
            .populate('requestBy', 'name role')
            .populate('assetId', 'name');
        res.status(200).json({ permissions: perms });
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ message: 'Error fetching permissions', error: error.message });
    }
};

module.exports = {
    createPermission,
    getPermissions
};