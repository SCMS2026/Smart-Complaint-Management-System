const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  requestBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  department_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },

  reason: String,

  location: {
    address: String,
    area: String
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }

}, { timestamps: true });

const Permission = mongoose.model('Permission', permissionSchema);
module.exports = Permission;