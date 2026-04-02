const mongoose = require("mongoose");
const complaintSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },

  category: String,
  description: String,

  status: {
    type: String,
    enum: ["pending", "approved", "assigned", "in_progress", "completed", "rejected"],
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);