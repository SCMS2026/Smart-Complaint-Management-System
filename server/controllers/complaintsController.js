const fs = require("fs");
const path = require("path");
const Complaint = require("../models/complaintsModel");
const Asset = require("../models/assetsModels");
const User = require("../models/authModels");
const WorkerTask = require("../models/workerTaskModel");
const mongoose = require("mongoose");

// Keyword mapping for NLP-like fallback classification
const keywordMap = {
  "water": "Water Supply",
  "pani": "Water Supply",
  "leak": "Water Supply",
  "road": "Roads & Traffic",
  "rasta": "Roads & Traffic",
  "pothole": "Roads & Traffic",
  "kachro": "Sanitation",
  "garbage": "Sanitation",
  "gutter": "Sanitation",
  "gatar": "Sanitation",
  "light": "Electricity",
  "street light": "Electricity",
  "vijli": "Electricity"
};
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
    console.log("req file:", req.file);
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
      const asset = await Asset.findById(assetId).select('department_id issue');
      if (asset) {
        if (asset.department_id) {
          department_id = asset.department_id;
        } else if (asset.issue) {
          const Department = mongoose.model("Department");
          let dept = await Department.findOne({ name: { $regex: new RegExp(`^${asset.issue}$`, "i") } });
          if (!dept) {
            try {
              dept = await Department.create({ name: asset.issue });
            } catch (createError) {
              if (createError.code === 11000) {
                dept = await Department.findOne({ name: { $regex: new RegExp(`^${asset.issue}$`, "i") } });
              } else {
                throw createError;
              }
            }
          }
          if (dept) {
            department_id = dept._id;
            await Asset.findByIdAndUpdate(assetId, { department_id: dept._id });
          }
        }
      }
    }

    // 2. From Category (PRIORITY 2)
    if (!department_id && category) {
      const categoryName = category.trim();
      const asset = await Asset.findOne({
        category: { $regex: new RegExp(`^${categoryName}$`, "i") },
      }).select('department_id issue');

      if (asset) {
        if (asset.department_id) {
          department_id = asset.department_id;
        } else if (asset.issue) {
          const Department = mongoose.model("Department");
          let dept = await Department.findOne({ name: { $regex: new RegExp(`^${asset.issue}$`, "i") } });
          if (!dept) {
            try {
              dept = await Department.create({ name: asset.issue });
            } catch (createError) {
              if (createError.code === 11000) {
                dept = await Department.findOne({ name: { $regex: new RegExp(`^${asset.issue}$`, "i") } });
              } else {
                throw createError;
              }
            }
          }
          if (dept) {
            department_id = dept._id;
            await Asset.updateOne({ _id: asset._id }, { department_id: dept._id });
          }
        }
      }
    }

    const normalizedIssue = issue.toLowerCase().trim();

    for (const [keyword, cat] of Object.entries(keywordMap)) {
      if (normalizedIssue.includes(keyword)) {
        const asset = await Asset.findOne({
          category: { $regex: new RegExp(`^${cat}$`, "i") },
        }).select('department_id issue');

        if (asset) {
          if (asset.department_id) {
            department_id = asset.department_id;
            break;
          } else if (asset.issue) {
            const Department = mongoose.model("Department");
            let dept = await Department.findOne({ name: { $regex: new RegExp(`^${asset.issue}$`, "i") } });
            if (!dept) {
              try {
                dept = await Department.create({ name: asset.issue });
              } catch (createError) {
                if (createError.code === 11000) {
                  dept = await Department.findOne({ name: { $regex: new RegExp(`^${asset.issue}$`, "i") } });
                } else {
                  throw createError;
                }
              }
            }
            if (dept) {
              department_id = dept._id;
              await Asset.updateOne({ _id: asset._id }, { department_id: dept._id });
              break;
            }
          }
        }
      }
    }
    // }

    // 4. FALLBACK - Direct department lookup from category
    if (!department_id && category) {
      const Department = mongoose.model("Department");
      const dept = await Department.findOne({ name: { $regex: new RegExp(`^${category}$`, "i") } });
      if (dept) {
        department_id = dept._id;
      }
    }

    // 5. FALLBACK - Direct department lookup from issue
    if (!department_id && issue) {
      const Department = mongoose.model("Department");
      const dept = await Department.findOne({ name: { $regex: new RegExp(`^${issue}$`, "i") } });
      if (dept) {
        department_id = dept._id;
      }
    }

    // 6. FINAL FALLBACK - No department found
    if (!department_id) {
      return res.status(400).json({
        message: "Unable to determine department. Please select a valid asset with department.",
      });
    }

    let imageBase64 = null;

    if (req.file) {
      const filePath = path.join(__dirname, "..", req.file.path);

      const fileBuffer = fs.readFileSync(filePath);
      const base64 = fileBuffer.toString("base64");

      const mimeType = req.file.mimetype;

      imageBase64 = `data:${mimeType};base64,${base64}`;
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
      image: imageBase64 || null,
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
      // Fetch department from database and filter
      const user = await User.findById(req.user.id).select('department');
      if (user?.department) {
        // Convert to ObjectId for proper comparison
        const deptObjId = new mongoose.Types.ObjectId(user.department);
        filter.department_id = deptObjId;
      }
    } else if (req.user.role === "worker") {
      // Workers see only assigned complaints
      const workerUser = await User.findById(req.user.id).select('department');
      const workerDeptId = workerUser?.department || req.user.department;
      filter.$or = [
        { department_id: workerDeptId },
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
        { $match: { ...matchFilter, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
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

// User Approve/Reject
const userApproveComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { action, rejectionReason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only complaint owner can approve/reject' });
    }

    if (!['user_approval_pending', 'completed'].includes(complaint.status)) {
      return res.status(400).json({
        message: `Complaint not ready for approval. Current status: ${complaint.status}`
      });
    }

    if (action === 'approve') {
      complaint.status = 'approved_by_user';
      complaint.updatedAt = new Date();
      await complaint.save();

      const populatedComplaint = await Complaint.findById(complaintId)
        .populate("userId", "name")
        .populate("assetId", "name");

      return res.status(200).json({
        message: 'Work approved successfully. Thank you!',
        complaint: populatedComplaint
      });
    } else {
      complaint.status = 'rejected_by_user';
      complaint.rejectionReason = rejectionReason || 'Work not satisfactory';
      complaint.updatedAt = new Date();
      await complaint.save();

      const updatedComplaint = await Complaint.findByIdAndUpdate(
        complaintId,
        {
          status: 'assigned',
          updatedAt: new Date()
        },
        { new: true }
      )
        .populate("userId", "name")
        .populate("assetId", "name")
        .populate("department_id", "name")
        .populate("assignedTo", "name");

      return res.status(200).json({
        message: 'Work rejected. Complaint sent back to department for reassignment.',
        complaint: updatedComplaint
      });
    }
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