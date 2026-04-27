const Complaint = require("../models/complaintsModel");
const Asset = require("../models/assetsModels");
const User = require("../models/authModels");
const WorkerTask = require("../models/workerTaskModel");
const Department = require("../models/departmentModel");
const mongoose = require("mongoose");
const { notify, getUnreadCount } = require("../services/notificationService");
const path = require("path");
const fs = require("fs");

// Cloudinary setup (optional)
const cloudinary = require('cloudinary').v2;
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Upload image to Cloudinary
const uploadToCloudinary = async (filePath) => {
  if (!isCloudinaryConfigured) return null;

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        filePath,
        { folder: 'complaint_images' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
};

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
       priority // optional from frontend
     } = req.body;

     const userId = req.user?.id;
     console.log("req file:", req.file);
     console.log("Create complaint request by user:", userId, "with data:", req.body);

      // Priority: use provided priority or compute from keywords
      let priorityValue = priority || "medium";
      if (!priority) {
        const issueLower = (issue || '').toLowerCase();
        const highPriorityKeywords = ['urgent', 'emergency', 'accident', 'fire', 'flood', 'gas', 'leak', 'danger', 'safety', 'health', 'hospital', 'ambulance'];
        const lowPriorityKeywords = ['minor', 'small', 'cleanliness', 'cosmetic'];

        if (highPriorityKeywords.some(k => issueLower.includes(k))) {
          priorityValue = "high";
        } else if (lowPriorityKeywords.some(k => issueLower.includes(k))) {
          priorityValue = "low";
        }
      }
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

    let imageUrl = null;

    // Handle image upload
    if (req.file) {
      const filePath = path.join(__dirname, "..", req.file.path);

      if (isCloudinaryConfigured) {
        // Upload to Cloudinary
        imageUrl = await uploadToCloudinary(filePath);
        // Clean up local file after Cloudinary upload
        try { fs.unlinkSync(filePath); } catch (e) {}
      } else {
        // Fallback: Convert to base64 (existing method)
        const fileBuffer = fs.readFileSync(filePath);
        const base64 = fileBuffer.toString("base64");
        const mimeType = req.file.mimetype;
        imageUrl = `data:${mimeType};base64,${base64}`;
        // Don't delete local file in base64 mode; it's stored as needed
      }
    }

    // Create complaint
    // Calculate SLA deadline based on priority and department
    let slaDays = 3; // default
    if (department_id) {
      const dept = await Department.findById(department_id).select('settings');
      if (dept?.settings?.priorityThreshold !== undefined) {
        slaDays = dept.settings.priorityThreshold;
      }
    }

    const priorityMultiplier = {
      low: 1.5,
      medium: 1.0,
      high: 0.7,
      critical: 0.5
    };
    const finalSlaDays = Math.ceil(slaDays * (priorityMultiplier[priorityValue] || 1));
    const slaDeadline = new Date();
    slaDeadline.setDate(slaDeadline.getDate() + finalSlaDays);

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
      image: imageUrl || null,
      status: "pending",
      priority: priorityValue,
      slaDeadline,
      slaStatus: "on_track"
    });
    console.log("Creating complaint with data:", complaint);
    await complaint.save();

    // Populate response
    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate("userId", "name email")
      .populate("assetId", "name category")
      .populate("department_id", "name admin");

    // 🔔 NOTIFICATION: Notify department admin about new complaint
    if (populatedComplaint.department_id && populatedComplaint.department_id.admin) {
      await notify({
        recipientId: populatedComplaint.department_id.admin,
        senderId: userId,
        type: "complaint_created",
        title: "New Complaint Received",
        message: `A new complaint "${issue}" has been submitted from ${location}.`,
        data: {
          complaintId: complaint._id,
          issue,
          location,
          department: populatedComplaint.department_id.name,
          actionUrl: `/complaint/${complaint._id}`,
          priority: 'normal'
        }
      });
    }

    // Notify user of successful submission
    await notify({
      recipientId: userId,
      senderId: userId,
      type: "complaint_created",
      title: "Complaint Submitted Successfully",
      message: `Your complaint "${issue}" has been registered with ID #${complaint._id}`,
      data: {
        complaintId: complaint._id,
        actionUrl: `/complaint/${complaint._id}`
      }
    });

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

// Get Complaints - FIXED with search & filters
const getComplaints = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filters from query
    const {
      search,
      status,
      city,
      district,
      taluka,
      village,
      department,
      priority,
      fromDate,
      toDate,
      assignedTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

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
        filter.department_id = new mongoose.Types.ObjectId(user.department);
      }
    } else if (req.user.role === "worker") {
      const workerUser = await User.findById(req.user.id).select('department');
      const workerDeptId = workerUser?.department || req.user.department;
      filter.$or = [
        { department_id: workerDeptId },
        { assignedTo: req.user.id }
      ];
    }

     // Text search (issue, description, location)
    if (search) {
      const regex = new RegExp(search, 'i');
      
      // Build search conditions for complaint fields
      const complaintConditions = [
        { issue: regex },
        { description: regex },
        { location: regex },
        { city: regex }
      ];
      
      // Add user search conditions (search by user name or email)
      // We'll handle this by finding matching user IDs first, then combining conditions
      const userConditions = [];
      
      // Only add user search if we have a reasonable search term (at least 2 chars)
      // This prevents expensive user collection searches on very short terms
      if (search.trim().length >= 2) {
        userConditions.push(
          { 'userId.name': regex },
          { 'userId.email': regex }
        );
      }
      
      // Combine all conditions with $or
      filter.$or = [...complaintConditions, ...userConditions];
      
      // Remove $or if it's already there from role filter
      if (filter.$or && filter.department_id) {
        // Merge with existing department filter
        filter.$and = [{ ...filter }, { $or: filter.$or }];
        delete filter.department_id;
        delete filter.$or;
      }
    }

    // Status filter (supports array: ?status=pending&status=assigned)
    if (status) {
      const statuses = Array.isArray(status) ? status : [status];
      filter.status = { $in: statuses };
    }

    // Department filter
    if (department) {
      filter.department_id = new mongoose.Types.ObjectId(department);
    }

    // Location filters
    if (city) filter.city = new RegExp(city, 'i');
    if (district) filter.District = new RegExp(district, 'i');
    if (taluka) filter.Taluka = new RegExp(taluka, 'i');
    if (village) filter.village = new RegExp(village, 'i');

    // Assigned worker filter
    if (assignedTo) {
      filter.assignedTo = new mongoose.Types.ObjectId(assignedTo);
    }

    // Date range
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) {
        const endOfDay = new Date(toDate);
        endOfDay.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endOfDay;
      }
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const complaints = await Complaint.find(filter)
      .populate(populateFields)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await Complaint.countDocuments(filter);

    res.status(200).json({
      complaints,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get complaints error:", error);
    res.status(500).json({ message: "Error fetching complaints", error: error.message });
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

    const previousStatus = complaint.status;

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
      .populate("userId", "name email")
      .populate("assetId", "name")
      .populate("department_id", "name admin")
      .populate("assignedTo", "name email");

    // ── NOTIFICATION TRIGGERS ──
    const senderId = req.user.id;
    const senderName = req.user.name || req.user.email;
    const complaintRef = `${complaint.issue} (#${complaint._id.toString().slice(-6)})`;

    // 1. Notify complaint owner about status change
    if (req.user.id !== complaint.userId._id && previousStatus !== newStatus) {
      await notify({
        recipientId: complaint.userId._id,
        senderId,
        type: "status_updated",
        title: "Complaint Status Updated",
        message: `Your complaint "${complaint.issue}" status changed from "${previousStatus}" to "${newStatus}".`,
        data: {
          complaintId: complaintId,
          oldStatus: previousStatus,
          newStatus,
          updatedBy: senderName,
          actionUrl: `/complaint/${complaintId}`,
          comment: req.body.comment || null
        },
        sendEmail: true
      });
    }

    // 2. If assigned to worker, notify worker
    if (updatedComplaint.assignedTo && updatedComplaint.assignedTo._id.toString() !== req.user.id) {
      await notify({
        recipientId: updatedComplaint.assignedTo._id,
        senderId,
        type: "complaint_assigned",
        title: "New Complaint Assignment",
        message: `You have been assigned to complaint: "${complaint.issue}"`,
        data: {
          complaintId: complaintId,
          department: updatedComplaint.department_id?.name,
          priority: updatedComplaint.priority || 'normal',
          actionUrl: `/complaint/${complaintId}`
        }
      });
    }

    // 3. If status is user_approval_pending, notify user
    if (newStatus === "user_approval_pending") {
      const baseUrl = process.env.CLIENT_URL || 'http://localhost:5174';
      await notify({
        recipientId: complaint.userId._id,
        senderId: updatedComplaint.assignedTo?._id || req.user.id,
        type: "user_approval_required",
        title: "Please Confirm Resolution",
        message: `Your complaint "${complaint.issue}" has been marked as complete. Please review and approve.`,
        data: {
          complaintId: complaintId,
          issue: complaint.issue,
          resolvedBy: updatedComplaint.assignedTo?.name || 'Admin',
          actionUrl: `${baseUrl}/complaint/${complaintId}`,
          approveUrl: `${baseUrl}/complaint/${complaintId}/approve`,
          rejectUrl: `${baseUrl}/complaint/${complaintId}/reject`
        }
      });
    }

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

      // 🔔 Notify worker/admin that work was approved
      await notify({
        recipientId: complaint.assignedTo || complaint.department_id.admin,
        senderId: req.user.id,
        type: "complaint_approved",
        title: "Work Approved by User",
        message: `Your work on complaint "${complaint.issue}" has been approved by the user.`,
        data: {
          complaintId: complaintId,
          issue: complaint.issue,
          actionUrl: `/complaint/${complaintId}`
        }
      });

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

      // 🔔 Notify worker/admin that work was rejected
      await notify({
        recipientId: complaint.assignedTo || complaint.department_id.admin,
        senderId: req.user.id,
        type: "complaint_rejected",
        title: "Work Rejected by User",
        message: `Your work on complaint "${complaint.issue}" was rejected. Reason: ${rejectionReason || 'Not satisfactory'}`,
        data: {
          complaintId: complaintId,
          issue: complaint.issue,
          rejectionReason: rejectionReason,
          actionUrl: `/complaint/${complaintId}`
        }
      });

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

    // 🔔 Notify complaint owner about new comment (unless they commented)
    if (complaint.userId._id.toString() !== userId) {
      await notify({
        recipientId: complaint.userId._id,
        senderId: userId,
        type: "new_comment",
        title: "New Comment on Your Complaint",
        message: `${req.user.name || 'Someone'} commented: "${text.trim().substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
        data: {
          complaintId: complaintId,
          comment: text.trim(),
          actionUrl: `/complaint/${complaintId}`
        },
        sendEmail: false
      });
    }

    // Also notify assigned worker if not the commenter
    if (complaint.assignedTo && complaint.assignedTo._id.toString() !== userId && complaint.assignedTo._id.toString() !== complaint.userId._id.toString()) {
      await notify({
        recipientId: complaint.assignedTo._id,
        senderId: userId,
        type: "new_comment",
        title: "New Comment on Assigned Complaint",
        message: `New comment on "${complaint.issue}": "${text.trim().substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
        data: {
          complaintId: complaintId,
          actionUrl: `/complaint/${complaintId}`
        },
        sendEmail: false
      });
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

// Bulk Delete Complaints — Admin only
const bulkDeleteComplaints = async (req, res) => {
  try {
    const { complaintIds } = req.body;

    if (!Array.isArray(complaintIds) || complaintIds.length === 0) {
      return res.status(400).json({ message: "No complaint IDs provided" });
    }

    const result = await Complaint.deleteMany({
      _id: { $in: complaintIds }
    });

    res.json({
      message: `${result.deletedCount} complaint(s) deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Bulk delete complaints error:', error);
    res.status(500).json({ message: 'Error deleting complaints', error: error.message });
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
  bulkDeleteComplaints
};