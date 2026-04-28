const Permission = require('../models/permissionsModels');
const Asset = require('../models/assetsModels');

// Create a new permission request (Contractors only)
const createPermission = async (req, res) => {
  try {
    const { assetId, workType, reason, proposedStartDate, proposedEndDate, priority, estimatedCost, attachments } = req.body;
    const requestBy = req.user?.id;
    
    if (!requestBy) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    
    if (!assetId || !workType || !reason || !proposedStartDate || !proposedEndDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: assetId, workType, reason, proposedStartDate, proposedEndDate' 
      });
    }

    // Verify asset exists
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    // Verify user is a contractor
    if (req.user?.role !== 'contractor' && req.user?.role !== 'worker') {
      return res.status(403).json({ success: false, message: 'Only contractors can create permission requests' });
    }

    // Build permission object with location snapshot
    const newPerm = new Permission({
      requestBy,
      assetId,
      department_id: asset.department_id,
      workType,
      reason,
      location: {
        address: asset.location?.address,
        area: asset.location?.area,
        city: asset.location?.city
      },
      proposedStartDate,
      proposedEndDate,
      priority: priority || 'medium',
      estimatedCost,
      attachments: attachments || []
    });

    await newPerm.save();
    
    // Populate for response
    const populated = await newPerm
      .populate('requestBy', 'name email')
      .populate('assetId', 'name assetCode type')
      .populate('department_id', 'name');

    res.status(201).json({ 
      success: true, 
      message: 'Permission request created successfully', 
      permission: populated 
    });
  } catch (error) {
    console.error('Error creating permission request:', error);
    res.status(500).json({ success: false, message: 'Error creating permission request', error: error.message });
  }
};

// Get permission requests (filtered by role)
const getPermissions = async (req, res) => {
  try {
    const filter = {};

    // Department-wise filtering for department admins
    if (req.user && req.user.role === 'department_admin' && req.user.department) {
      filter.department_id = req.user.department;
    }

    const perms = await Permission.find(filter)
      .populate('requestBy', 'name email role')
      .populate('assetId', 'name assetCode type location')
      .populate('department_id', 'name')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      permissions: perms 
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ success: false, message: 'Error fetching permissions', error: error.message });
  }
};

// Get my permission requests (Contractor only)
const getMyPermissions = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const perms = await Permission.find({ requestBy: userId })
      .populate('assetId', 'name assetCode type location image')
      .populate('department_id', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      permissions: perms 
    });
  } catch (error) {
    console.error('Error fetching my permissions:', error);
    res.status(500).json({ success: false, message: 'Error fetching permissions', error: error.message });
  }
};

// Get single permission by ID (Contractor can only view their own)
const getPermissionById = async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id)
      .populate('requestBy', 'name email')
      .populate('assetId', 'name assetCode type location')
      .populate('department_id', 'name')
      .populate('reviewedBy', 'name');

    if (!permission) {
      return res.status(404).json({ success: false, message: 'Permission request not found' });
    }

    // Contractors can only view their own permissions
    if (req.user?.role === 'contractor' || req.user?.role === 'worker') {
      if (permission.requestBy._id.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    res.status(200).json({ success: true, permission });
  } catch (error) {
    console.error('Error fetching permission:', error);
    res.status(500).json({ success: false, message: 'Error fetching permission', error: error.message });
  }
};

// Approve or Reject a permission request (Admin/Super Admin only)
const updatePermissionStatus = async (req, res) => {
  try {
    const { permissionId } = req.params;
    const { status, reviewComments } = req.body; // 'approved', 'rejected', or 'cancelled'

    if (!['approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'approved', 'rejected', or 'cancelled'" });
    }

    const updateData = {
      status,
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      reviewComments
    };

    // If rejecting, set completion date
    if (status === 'rejected' || status === 'cancelled') {
      updateData.completionDate = new Date();
    }

    const perm = await Permission.findByIdAndUpdate(
      permissionId,
      updateData,
      { new: true }
    )
      .populate('requestBy', 'name role')
      .populate('assetId', 'name assetCode')
      .populate('department_id', 'name')
      .populate('reviewedBy', 'name');

    if (!perm) {
      return res.status(404).json({ success: false, message: 'Permission request not found' });
    }

    res.status(200).json({
      success: true,
      message: `Permission ${status} successfully`,
      permission: perm
    });
  } catch (error) {
    console.error('Error updating permission status:', error);
    res.status(500).json({ success: false, message: 'Error updating permission', error: error.message });
  }
};

// Mark permission as completed (when work is done)
const completePermission = async (req, res) => {
  try {
    const { permissionId } = req.params;
    const { completionNotes } = req.body;

    const perm = await Permission.findByIdAndUpdate(
      permissionId,
      { 
        status: 'completed',
        completionDate: new Date(),
        completionNotes
      },
      { new: true }
    )
      .populate('requestBy', 'name')
      .populate('assetId', 'name assetCode');

    if (!perm) {
      return res.status(404).json({ success: false, message: 'Permission request not found' });
    }

    // Verify this permission belongs to the requesting contractor or they're admin
    if (req.user?.role === 'contractor' && perm.requestBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Permission marked as completed',
      permission: perm 
    });
  } catch (error) {
    console.error('Error completing permission:', error);
    res.status(500).json({ success: false, message: 'Error completing permission', error: error.message });
  }
};

module.exports = {
  createPermission,
  getPermissions,
  getMyPermissions,
  getPermissionById,
  updatePermissionStatus,
  completePermission
};