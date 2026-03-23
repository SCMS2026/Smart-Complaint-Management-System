const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department"
    },
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset"
    },

    category: {
      type: String,
      required: true
    },

    issue: {
      type: String,
      required: true
    },

    location: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    District: {
      type: String,
      required: true
    },
    Taluka: {
      type: String,
      required: true
    },
    village: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    image: {
      type: String,
      default: null
    },


    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    },

    status: {
      type: String,
      enum: [
        "submitted",
        "under_review",
        "worker_assigned",
        "in_progress",
        "completed",
        "user_approval",
        "closed",
        "rejected"
      ],
      default: "submitted"
    },
  },
  {
    timestamps: true
  }
);
const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;