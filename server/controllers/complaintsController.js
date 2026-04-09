const Complaint = require("../models/complaintsModel");
const Asset = require("../models/assetsModels");
const User = require("../models/authModels");
const WorkerTask = require("../models/workerTaskModel");

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
    
    // 1. Try to get department from selected asset
    if (assetId) {
      const asset = await Asset.findById(assetId);
      if (asset) {
        department_id = asset.department_id;
      }
    }

    // 2. If no asset selected, try category-based routing
    if (!department_id && category) {
      // First try to find any asset with this category and use its department
      const assetByCategory = await Asset.findOne({ category: category });
      if (assetByCategory && assetByCategory.department_id) {
        department_id = assetByCategory.department_id;
      }
    }

    // 3. If still no department, try hardcoded mappings
    if (!department_id && issue) {
      const issueToCategory = {
        "Street Light": "Electricity",
        "Power": "Electricity",
        "Water": "Water",
        "Road": "Road",
        "Garbage": "Sanitation",
      };
      
      // Try to find matching issue and get its department
      for (const [key, categoryName] of Object.entries(issueToCategory)) {
        if (issue.toLowerCase().includes(key.toLowerCase())) {
          const assetByMatched = await Asset.findOne({ category: categoryName });
          if (assetByMatched && assetByMatched.department_id) {
            department_id = assetByMatched.department_id;
            break;
          }
        }
      }
    }

    console.log("Complaint department assignment:", { assetId, category, issue, department_id });

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
      // For department_admin, fetch current department from DB (not from stale JWT token)
      if (req.user.role === "department_admin") {
        const user = await User.findById(req.user.id);
        console.log("Department Admin fetched:", { userId: req.user.id, department: user?.department });
        if (user && user.department) {
          // Show both assigned to this department AND unassigned complaints
          filter.$or = [
            { department_id: user.department },
            { department_id: null }
          ];
        } else {
          // If no department assigned to admin, show all unassigned complaints
          console.log("Department admin has no department assigned");
          filter.department_id = null;
        }
      } else if (req.user.department) {
        filter.department_id = req.user.department;
      }
    }

    console.log("Complaint filter:", JSON.stringify(filter), "User role:", req.user?.role);
    const complaints = await Complaint.find(filter)
      .populate("userId", "name")
      .populate("assetId", "name")
      .populate("department_id", "name");

    console.log("Found complaints:", complaints.length);
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