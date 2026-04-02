
const mongoose = require("mongoose");
const departmentSchema = new mongoose.Schema({
  name: String,
  description: String,

  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("Department", departmentSchema);