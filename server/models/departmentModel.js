
const mongoose = require("mongoose");
const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,

  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  // Department statistics (auto-updated)
  stats: {
    totalComplaints: { type: Number, default: 0 },
    pendingComplaints: { type: Number, default: 0 },
    completedComplaints: { type: Number, default: 0 },
    totalWorkers: { type: Number, default: 0 },
    totalAssets: { type: Number, default: 0 },
    activeTasks: { type: Number, default: 0 }
  },

  // Department settings
  settings: {
    autoAssignWorkers: { type: Boolean, default: true },
    notificationEnabled: { type: Boolean, default: true },
    priorityThreshold: { type: Number, default: 5 } // High priority if > 5 pending complaints
  },

  // Performance metrics
  performance: {
    avgResolutionTime: { type: Number, default: 0 }, // in hours
    satisfactionRate: { type: Number, default: 0 }, // percentage
    lastUpdated: { type: Date, default: Date.now }
  }

}, { timestamps: true });

// Index for performance
departmentSchema.index({ name: 1 });
departmentSchema.index({ admin: 1 });

module.exports = mongoose.model("Department", departmentSchema);