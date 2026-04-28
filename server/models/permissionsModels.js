const mongoose = require("mongoose");

const permissionSchema =  mongoose.Schema({
  // Who requested this permission (contractor)
  requestBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Asset/property the permission is for
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },

  // Department that owns/approves this asset
  department_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true
  },

  // Work to be performed
  workType: {
    type: String,
    enum: ['repair', 'installation', 'maintenance', 'inspection', 'upgrade', 'other'],
    required: true
  },

  // Detailed reason for the permission request
  reason: {
    type: String,
    required: true
  },

  // Location details (redundant copy for historical reference)
  location: {
    address: String,
    area: String,
    city: String
  },

  // Dates
  proposedStartDate: {
    type: Date,
    required: true
  },

  proposedEndDate: {
    type: Date,
    required: true
  },

  // Approval details
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },

  // Who reviewed this request
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  reviewDate: {
    type: Date
  },

  reviewComments: {
    type: String
  },

  // Completion details
  completionNotes: {
    type: String
  },

  completionDate: {
    type: Date
  },

  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },

  // Estimated cost (if applicable)
  estimatedCost: {
    type: Number
  },

  // Attachments (proof, documents)
  attachments: [{
    url: String,
    filename: String,
    uploadedAt: Date
  }]

}, { timestamps: true });

// Indexes
permissionSchema.index({ requestBy: 1 });
permissionSchema.index({ assetId: 1 });
permissionSchema.index({ department_id: 1 });
permissionSchema.index({ status: 1 });
permissionSchema.index({ proposedStartDate: 1 });

const Permission = mongoose.model('Permission', permissionSchema);
module.exports = Permission;