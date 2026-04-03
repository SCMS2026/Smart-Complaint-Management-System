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

  status: {
    type: String,
    enum: ["pending", "verified", "assigned", "in_progress", "completed", "rejected", "user_approval_pending", "approved_by_user", "rejected_by_user"],
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);