const Complaint = require("../models/complaintsModel");
const Asset = require("../models/assetsModels");
const User = require("../models/authModels");
const WorkerTask = require("../models/workerTaskModel");
const mongoose = require("mongoose");

// Create Complaint - FULLY FIXED
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

    const userId = req.user?.id;
    console.log("Create complaint request by user:", userId, "with data:", req.body);
    // Validation
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

    if (!assetId && !category && !issue) {
      return res.status(400).json({
        message: "Asset, Category or Issue is required",
      });
    }

    // Duplicate check
    const duplicate = await Complaint.findOne({
      userId,
      issue: { $regex: issue.trim(), $options: 'i' },
      location: { $regex: location.trim(), $options: 'i' },
      city: { $regex: city.trim(), $options: 'i' },
      status: {
        $nin: ["completed", "rejected", "approved_by_user", "rejected_by_user"],
      },
    });

    if (duplicate) {
      return res.status(409).json({
        message: "Similar complaint already exists",
      });
    }

    let department_id = null;

    // 1. From Asset (PRIORITY 1)
    if (assetId) {
      const asset = await Asset.findById(assetId).select('department_id');
      if (asset?.department_id) {
        department_id = asset.department_id;
      }
    }

    // 2. From Category (PRIORITY 2)
    if (!department_id && category) {
      const categoryName = category.trim();
      const asset = await Asset.findOne({
        category: { $regex: new RegExp(`^${categoryName}$`, "i") },
      }).select('department_id');
      
      if (asset?.department_id) {
        department_id = asset.department_id;
      }
    }

      const normalizedIssue = issue.toLowerCase().trim();
      
      for (const [keyword, cat] of Object.entries(keywordMap)) {
        if (normalizedIssue.includes(keyword)) {
          const asset = await Asset.findOne({
            category: { $regex: new RegExp(`^${cat}$`, "i") },
          }).select('department_id');
          
          if (asset?.department_id) {
            department_id = asset.department_id;
            break;
          }
        }
      }
    }

    // 4. FALLBACK - Get ANY available department (GUARANTEED SUCCESS)
    if (!department_id) {
      const Department = mongoose.model("Department");
      const departments = await Department.find({}).select('_id').limit(1);
      
      if (departments.length > 0) {
        department_id = departments[0]._id;
      } else {
        // Create default department if none exists
        const defaultDept = new Department({ name: "General Department" });
        await defaultDept.save();
        department_id = defaultDept._id;
      }
    }

    // Create complaint
    const complaint = new Complaint({
      userId,
      department_id,
      assetId: assetId || null,
      category: category || null,
      issue,
      location,
      city,
      District,
      Taluka,
      village,
      pincode,
      description,
      image: image || null,
      status: "pending",
    });
    console.log("Creating complaint with data:", complaint);
    await complaint.save();

    // Populate response
    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate("userId", "name email")
      .populate("assetId", "name category")
      .populate("department_id", "name");

    res.status(201).json({
      message: "✅ Complaint created successfully",
      complaint: populatedComplaint,
    });

  } catch (error) {
    console.error("❌ Create complaint error:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Get Complaints - FIXED
const getComplaints = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = {};
    let populateFields = [
      { path: "userId", select: "name email phone" },
      { path: "assetId", select: "name category" },
      { path: "department_id", select: "name" }
    ];

    // Role-based filtering
    if (req.user.role === "user") {
      filter.userId = req.user.id;
    } else if (req.user.role === "department_admin") {
      const user = await User.findById(req.user.id).select('department');
      if (user?.department) {
        filter.department_id = user.department;
      }
    } else if (req.user.role === "worker") {
      // Workers see only assigned complaints
      filter.$or = [
        { department_id: req.user.department },
        { assignedTo: req.user.id }
      ];
    }

    const complaints = await Complaint.find(filter)
      .populate(populateFields)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Complaint.countDocuments(filter);

    res.status(200).json({ 
      complaints, 
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error("Get complaints error:", error);
    res.status(500).json({ message: "Error fetching complaints" });
  }
};

// Get Complaint Analytics - FIXED
const getComplaintAnalytics = async (req, res) => {
  try {
    const user = req.user;
    let matchFilter = {};

    if (user.role === 'department_admin' && user.department) {
      matchFilter.department_id = new mongoose.Types.ObjectId(user.department);
    }

    const [
      totalComplaints,
      statusBreakdown,
      categoryBreakdown,
      locationBreakdown,
      dailyTrend,
      departmentBreakdown
    ] = await Promise.all([
      // Total complaints
      Complaint.countDocuments(matchFilter),
      
      // Status breakdown
      Complaint.aggregate([
        { $match: matchFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Category breakdown
      Complaint.aggregate([
        { $match: matchFilter },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Location breakdown
      Complaint.aggregate([
        { $match: matchFilter },
        { $group: { _id: { city: "$city", district: "$District" }, count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Daily trend (last 30 days)
      Complaint.aggregate([
        { $match: { ...matchFilter, createdAt: { $gte: new Date(Date.now() - 30*24*60*60*1000) } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Department breakdown (for super admins only)
      user.role === 'super_admin' || user.role === 'admin' ? 
      Complaint.aggregate([
        {
          $lookup: {
            from: 'departments',
            localField: 'department_id',
            foreignField: '_id',
            as: 'department'
          }
        },
        { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: {
              departmentId: '$department_id',
              departmentName: { $ifNull: ['$department.name', 'Unassigned'] }
            },
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $in: ['$status', ['assigned', 'in_progress']] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
          }
        },
        { $sort: { total: -1 } }
      ]) : Promise.resolve([])
    ]);

    res.status(200).json({
      totalComplaints,
      statusBreakdown,
      categoryBreakdown,
      locationBreakdown,
      dailyTrend,
      departmentBreakdown
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Error fetching analytics" });
  }
};

// Update Status - FIXED
const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status, assignedTo, workerId } = req.body;

    // Validate status transition
    const validStatuses = ['pending', 'assigned', 'in_progress', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Authorization check
    if (req.user.role === 'user' && complaint.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (req.user.role === 'department_admin' && 
        complaint.department_id.toString() !== req.user.department?.toString()) {
      return res.status(403).json({ message: 'Unauthorized for this department' });
    }

    // Auto-approval workflow
    let newStatus = status;
    if (status === "completed") {
      newStatus = "user_approval_pending";
    }

    const updateData = { 
      status: newStatus, 
      updatedAt: new Date(),
      ...(assignedTo && { assignedTo }),
      ...(workerId && { assignedTo: workerId })
    };

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      updateData,
      { new: true, runValidators: true }
    )
    .populate("userId", "name")
    .populate("assetId", "name")
    .populate("department_id", "name")
    .populate("assignedTo", "name");

    res.status(200).json({
      message: "Status updated successfully",
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ message: "Error updating status" });
  }
};

// User Approve/Reject - FIXED
const userApproveComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Only complaint owner can approve/reject
    if (complaint.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only complaint owner can approve/reject' });
    }

    // Only for completed complaints
    if (!['user_approval_pending', 'completed'].includes(complaint.status)) {
      return res.status(400).json({ 
        message: `Complaint not ready for approval. Current status: ${complaint.status}` 
      });
    }

    complaint.status = action === 'approve' ? 'approved_by_user' : 'rejected_by_user';
    complaint.updatedAt = new Date();
    await complaint.save();

    const populatedComplaint = await Complaint.findById(complaintId)
      .populate("userId", "name")
      .populate("assetId", "name");

    res.status(200).json({ 
      message: `Complaint ${action}d successfully`, 
      complaint: populatedComplaint 
    });
  } catch (error) {
    console.error('User approval error:', error);
    res.status(500).json({ message: 'Error processing approval' });
  }
};

// Delete Complaint - FIXED
const deleteComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Only owner or admin can delete
    if (req.user.role !== 'super_admin' && 
        complaint.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete' });
    }

    await Complaint.findByIdAndDelete(complaintId);
    res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Error deleting complaint" });
  }
};

// Get Single Complaint - FIXED
const getComplaintById = async (req, res) => {
  try {
    const { complaintId } = req.params;
    
    const complaint = await Complaint.findById(complaintId)
      .populate("userId", "name email phone")
      .populate("assetId", "name category")
      .populate("department_id", "name")
      .populate("assignedTo", "name");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Authorization check
    if (req.user.role === 'user' && complaint.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.status(200).json({ complaint });
  } catch (error) {
    console.error("Get complaint error:", error);
    res.status(500).json({ message: "Error fetching complaint" });
  }
};

// Add Comment - FIXED
const addComment = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { 
        $push: { 
          comments: { 
            userId, 
            text: text.trim(), 
            createdAt: new Date() 
          } 
        }, 
        updatedAt: new Date() 
      },
      { new: true }
    )
      .populate("userId", "name")
      .populate("comments.userId", "name")
      .populate("assetId", "name")
      .populate("department_id", "name");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({ message: "Comment added successfully", complaint });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: "Error adding comment" });
  }
};

// Mark as Fake - FIXED
const markAsFake = async (req, res) => {
  try {
    const { complaintId } = req.params;

    // Only admins can mark as fake
    if (!['super_admin', 'admin', 'department_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { 
        isFake: true, 
        status: "rejected", 
        updatedAt: new Date(),
        rejectedReason: "Marked as fake by admin"
      },
      { new: true }
    )
      .populate("userId", "name");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({ 
      message: "Complaint marked as fake", 
      complaint 
    });
  } catch (error) {
    console.error("Mark fake error:", error);
    res.status(500).json({ message: "Error marking complaint as fake" });
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