const mongoose = require("mongoose");

const department = new mongoose.Schema({
  name: String,
  description: String,

  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

const Department = mongoose.model("Department", department);

module.exports = Department;