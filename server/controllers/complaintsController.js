const Complaint = require("../models/complaintsModel");
const Asset = require("../models/assetsModels");

// Create Complaint
const createComplaint = async (req, res) => {
  try {
    const {
      assetId,
      category,
      issue,
      location,
      city,
      District,
      Taluka,
      village,
      pincode,
      description,
      image,
    } = req.body;
    console.log("1", req.body)
    const userId = req.user?.id;

     

    // Required field validation
    if (
      !issue ||
      !description ||
      !location ||
      !city ||
      !District ||
      !Taluka ||
      !village ||
      !pincode
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    // Fake complaint prevention: check duplicate unresolved complaints from same user and location
    const duplicate = await Complaint.findOne({
      userId,
      issue: issue.trim(),
      location: location.trim(),
      city: city.trim(),
      status: { $nin: ["completed", "rejected", "approved_by_user", "rejected_by_user"] }
    });

    if (duplicate) {
      return res.status(409).json({
        message: "Duplicate complaint detected. Please avoid creating duplicate complaints."
      });
    }

    let department_id = null;
    if (assetId) {
      const asset = await Asset.findById(assetId);
      if (asset) {
        department_id = asset.department_id;
      }
    }

    if (!department_id && category) {
      // Simple auto department routing by category
      const categoryToDepartment = {
        "Street Light": "Electricity",
        "Electricity": "Electricity",
        "Water Leakage": "Water",
        "Water": "Water",
        "Road Damage": "Road",
        "Road": "Road",
        "Garbage": "Sanitation",
      };
      const mappedName = categoryToDepartment[category] || category;
      const lookupDep = await Asset.findOne({ category: mappedName });
      if (lookupDep) {
        department_id = lookupDep.department_id || department_id;
      }
    }

    const complaint = new Complaint({
      userId,
      department_id,
      assetId: assetId || null,
      category,
      issue,
      location,
      city,
      District,
      Taluka,
      village,
      pincode,
      description,
      image: image || null,
      status: 'pending'
    });
    console.log("2",complaint)
    await complaint.save();

    res.status(201).json({
      message: "Complaint created successfully",
      complaint,
    });
  } catch (error) {
    console.error("Create complaint error:", error);
    res.status(500).json({
      message: "Server error while creating complaint",
    });
  }
};

// Get Complaints
const getComplaints = async (req, res) => {
  try {
    const filter = {};

    if (req.user && req.user.role === "user") {
      filter.userId = req.user.id;
    } else if (req.user && (req.user.role === "admin" || req.user.role === "department_admin")) {
      if (req.user.department) {
        filter.department_id = req.user.department;
      }
    }

    const complaints = await Complaint.find(filter)
      .populate("userId", "name")
      .populate("assetId", "name")
      .populate("department_id", "name");

    res.status(200).json({ complaints });
  } catch (error) {
    console.error("Get complaints error:", error);
    res.status(500).json({
      message: "Error fetching complaints",
    });
  }
};

const getComplaintAnalytics = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();

    const statusBreakdown = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const categoryBreakdown = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const locationBreakdown = await Complaint.aggregate([
      { $group: { _id: { city: "$city", District: "$District" }, count: { $sum: 1 } } }
    ]);

    const dailyTrend = await Complaint.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      totalComplaints,
      statusBreakdown,
      categoryBreakdown,
      locationBreakdown,
      dailyTrend
    });
  } catch (error) {
    console.error("Get complaint analytics error:", error);
    res.status(500).json({ message: "Error fetching complaint analytics", error: error.message });
  }
};

// Update Status
const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status } = req.body;

    let targetStatus = status;
    if (status === 'completed') {
      targetStatus = 'user_approval_pending';
    }

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      {
        status: targetStatus,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      message: "Status updated successfully",
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating complaint status",
    });
  }
};

const userApproveComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action for user approval' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can approve/reject only your own resolved complaints' });
    }

    if (['completed', 'approved_by_user', 'rejected_by_user'].includes(complaint.status) === false) {
      return res.status(400).json({ message: 'Complaint not ready for user approval' });
    }

    const newStatus = action === 'approve' ? 'approved_by_user' : 'rejected_by_user';
    complaint.status = newStatus;
    complaint.updatedAt = new Date();
    await complaint.save();

    res.status(200).json({ message: 'User approval saved', complaint });
  } catch (error) {
    console.error('User approval error:', error);
    res.status(500).json({ message: 'Error processing user approval', error: error.message });
  }
};

// Delete Complaint
const deleteComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findByIdAndDelete(complaintId);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting complaint",
    });
  }
};

// Get Complaint by ID
const getComplaintById = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findById(complaintId)
      .populate("userId", "name email")
      .populate("assetId", "name category");

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.status(200).json({ complaint });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching complaint",
    });
  }
};

// Add Comment
const addComment = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { text } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    if (!text) {
      return res.status(400).json({
        message: "Comment text required",
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      {
        $push: {
          comments: {
            userId,
            text,
            createdAt: new Date(),
          },
        },
        updatedAt: new Date(),
      },
      { new: true }
    )
      .populate("userId", "name")
      .populate("comments.userId", "name");

    res.status(200).json({
      message: "Comment added",
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding comment",
    });
  }
};

// Mark Fake
const markAsFake = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      {
        isFake: true,
        status: "rejected",
        updatedAt: new Date(),
      },
      { new: true }
    ).populate("userId", "name");

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      message: "Complaint marked as fake",
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error marking complaint as fake",
    });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintAnalytics,
  updateComplaintStatus,
  userApproveComplaint,
  deleteComplaint,
  getComplaintById,
  addComment,
  markAsFake,
};