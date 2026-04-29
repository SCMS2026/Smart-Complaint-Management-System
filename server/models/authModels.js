const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  role: {
    type: String,
    enum: ["super_admin", "admin", "department_admin", "worker", "user", "analyzer"],
    default: "user"
  },

  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    default: null
  },

  phone: String,

  profileImage: {
    type: String,
    default: null
  },

  googleId: String,

  googleProfile: {
    provider: String,
    id: String,
    displayName: String,
    photo: String
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },

  // Refresh token (store hashed version for security)
  refreshToken: {
    type: String,
  },
  refreshTokenExpiry: {
    type: Date
  }

}, { timestamps: true });

// Additional indexes (email unique already indexed, role/department/status for queries)
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ status: 1 });

module.exports = mongoose.model("User", userSchema);