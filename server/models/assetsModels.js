const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
  issue: {
    type: String, // 👉 Department Name
    required: true,
  },

  category: {
    type: [String], // 👉 MUST ARRAY
    default: [],
  },

  department_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },

}, { timestamps: true });

module.exports = mongoose.model("Asset", assetSchema);