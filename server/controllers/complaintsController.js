const Complaint = require("../models/complaintsModel");

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

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

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

    const complaint = new Complaint({
      userId,
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
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("2",complaint)
    await complaint.createdAt();

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
    }

    const complaints = await Complaint.find(filter)
      .populate("userId", "name")
      .populate("assetId", "name");

    res.status(200).json({ complaints });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching complaints",
    });
  }
};

// Update Status
const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      {
        status,
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
  updateComplaintStatus,
  deleteComplaint,
  getComplaintById,
  addComment,
  markAsFake,
};