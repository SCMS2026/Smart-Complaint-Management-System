const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  role: {
    type: String,
    enum: ["super_admin", "department_admin", "worker", "user", "analyzer"],
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
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);