const Complaint = require("../models/complaintsModel");
const Asset = require("../models/assetsModels");
const User = require("../models/authModels");
const WorkerTask = require("../models/workerTaskModel");
const mongoose = require("mongoose");
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

    const userId = req.user?.id;

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

    // 🚫 Duplicate check
    const duplicate = await Complaint.findOne({
      userId,
      issue: issue.trim(),
      location: location.trim(),
      city: city.trim(),
      status: { $nin: ["completed", "rejected", "approved_by_user", "rejected_by_user"] }
    });

    if (duplicate) {
      return res.status(409).json({
        message: "Duplicate complaint detected."
      });
    }

    let department_id = null;

    // ✅ 1. From Asset
    if (assetId) {
      const asset = await Asset.findById(assetId);
      if (asset && asset.department_id) {
        department_id = asset.department_id;
      }
    }

    // ✅ 2. From Category
    if (!department_id && category) {
      const assetByCategory = await Asset.findOne({
        category: { $regex: new RegExp(`^${category}$`, "i") } // case-insensitive
      });

      if (assetByCategory && assetByCategory.department_id) {
        department_id = assetByCategory.department_id;
      }
    }

    // ✅ 3. Smart Issue Matching
    if (!department_id && issue) {
      const issueToCategory = {
        "streetlight": "Electricity",
        "power": "Electricity",
        "water": "Water",
        "road": "Road",
        "garbage": "Sanitation",
      };

      const normalizedIssue = issue.toLowerCase().replace(/\s/g, "");

      for (const [key, categoryName] of Object.entries(issueToCategory)) {
        if (normalizedIssue.includes(key)) {
          const assetByMatched = await Asset.findOne({
            category: { $regex: new RegExp(`^${categoryName}$`, "i") }
          });

          if (assetByMatched && assetByMatched.department_id) {
            department_id = assetByMatched.department_id;
            break;
          }
        }
      }
    }

    // ❌ FINAL SAFETY CHECK
    if (!department_id) {
      return res.status(400).json({
        message: "Department not assigned. Please select correct category or asset."
      });
    }

    console.log("FINAL department_id:", department_id);

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
      status: "pending"
    });

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

const getComplaints = async (req, res) => {
  try {
    const filter = {};

    if (req.user && req.user.role === "user") {
      filter.userId = req.user.id;
    } 
    else if (req.user && (req.user.role === "admin" || req.user.role === "department_admin")) {

      if (req.user.role === "department_admin") {
        const user = await User.findById(req.user.id);

        console.log("Department Admin:", user?.department);

        if (user && user.department) {
          // ✅ FIX: Ensure ObjectId match
          filter.department_id = new mongoose.Types.ObjectId(user.department);
        } else {
          filter.department_id = new mongoose.Types.ObjectId(); // no result
        }
      } 
      else if (req.user.department) {
        filter.department_id = new mongoose.Types.ObjectId(req.user.department);
      }
    }

    console.log("FILTER:", filter);

    const complaints = await Complaint.find(filter)
      .populate("userId", "name")
      .populate("assetId", "name")
      .populate("department_id", "name");

    console.log("Found:", complaints.length);

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
    const user = req.user;
    let filter = {};

    // Department-wise analytics for department_admin
    if (user.role === 'department_admin' && user.department) {
      filter.department_id = user.department;
    }

    const totalComplaints = await Complaint.countDocuments(filter);

    const statusBreakdown = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const categoryBreakdown = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const locationBreakdown = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: { city: "$city", District: "$District" }, count: { $sum: 1 } } }
    ]);

    const dailyTrend = await Complaint.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Department-wise breakdown (for super_admin and admin)
    let departmentBreakdown = [];
    if (user.role === 'super_admin' || user.role === 'admin') {
      departmentBreakdown = await Complaint.aggregate([
        {
          $lookup: {
            from: 'departments',
            localField: 'department_id',
            foreignField: '_id',
            as: 'department'
          }
        },
        {
          $unwind: {
            path: '$department',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: {
              departmentId: '$department_id',
              departmentName: { $ifNull: ['$department.name', 'Unassigned'] }
            },
            count: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $in: ['$status', ['assigned', 'in_progress']] }, 1, 0] } }
          }
        },
        {
          $project: {
            departmentName: '$_id.departmentName',
            total: '$count',
            pending: '$pending',
            completed: '$completed',
            inProgress: '$inProgress'
          }
        },
        { $sort: { total: -1 } }
      ]);
    }

    res.status(200).json({
      totalComplaints,
      statusBreakdown,
      categoryBreakdown,
      locationBreakdown,
      dailyTrend,
      departmentBreakdown
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

    // Auto-assign worker when complaint is verified
    if (targetStatus === 'verified') {
      try {
        const workers = await User.find({ role: 'worker', status: 'active' });
        
        if (workers.length > 0) {
          // Get count of assigned/started tasks for each worker
          const tasks = await WorkerTask.aggregate([
            { $match: { status: { $in: ['assigned', 'started'] } } },
            { $group: { _id: '$worker_id', count: { $sum: 1 } } }
          ]);

          const countMap = tasks.reduce((map, item) => {
            map[item._id.toString()] = item.count;
            return map;
          }, {});

          // Find worker with minimum load
          let selectedWorker = workers[0];
          let minLoad = countMap[selectedWorker._id.toString()] || 0;

          for (const worker of workers) {
            const load = countMap[worker._id.toString()] || 0;
            if (load < minLoad) {
              minLoad = load;
              selectedWorker = worker;
            }
          }

          // Create worker task (auto-assign)
          const workerTask = new WorkerTask({
            complaint_id: complaint._id,
            worker_id: selectedWorker._id,
            status: 'assigned'
          });

          await workerTask.save();
          console.log(`Complaint ${complaint._id} auto-assigned to worker ${selectedWorker._id}`);
        }
      } catch (autoAssignError) {
        console.error('Auto-assign error:', autoAssignError);
        // Don't fail the complaint update if auto-assign fails
      }
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

    if (!['user_approval_pending', 'completed'].includes(complaint.status)) {
      return res.status(400).json({ message: `Complaint not ready for user approval. Current status: ${complaint.status}` });
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