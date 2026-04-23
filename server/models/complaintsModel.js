const mongoose = require("mongoose");
require("./authModels");
require("./departmentModel");
require("./assetsModels");
const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  department_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    default: null
  },

  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Asset",
    default: null
  },

  category: { type: String, default: "general" },
  issue: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  city: { type: String, required: true },
  District: { type: String, required: true },
  Taluka: { type: String, required: true },
  village: { type: String, required: true },
  pincode: { type: String, required: true },
  image: { type: String, default: null },

  comments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],

   isFake: { type: Boolean, default: false },

   assignedTo: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "User",
     default: null
   },

    status: {
      type: String,
      enum: ["pending", "verified", "assigned", "in_progress", "completed", "rejected", "user_approval_pending", "approved_by_user", "rejected_by_user"],
      default: "pending"
    },

    // Priority system
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    },

    // SLA tracking
    slaDeadline: {
      type: Date
    },
    slaStatus: {
      type: String,
      enum: ["on_track", "at_risk", "breached"],
      default: "on_track"
    },

    // Auto-escalation
    escalated: {
      type: Boolean,
      default: false
    },
    escalatedAt: {
      type: Date
    },
    escalationCount: {
      type: Number,
      default: 0
    }

  }, { timestamps: true });

// Indexes for performance
complaintSchema.index({ userId: 1 });
complaintSchema.index({ department_id: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ assignedTo: 1 });
complaintSchema.index({ "userId": 1, "status": 1 });
complaintSchema.index({ "department_id": 1, "status": 1 });
complaintSchema.index({ "slaDeadline": 1 });
complaintSchema.index({ "createdAt": 1, "status": 1 });

module.exports = mongoose.model("Complaint", complaintSchema);

module.exports = mongoose.model("Complaint", complaintSchema);