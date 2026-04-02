const mongoose = require("mongoose");
const assignmentSchema = new mongoose.Schema({
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Complaint"
  },

  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  status: {
    type: String,
    enum: ["assigned", "in_progress", "completed"],
    default: "assigned"
  },

  assignedAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

module.exports = mongoose.model("Assignment", assignmentSchema);