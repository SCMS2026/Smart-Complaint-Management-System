const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
  issue: {
    type: String,
    required: true
  },

  category: {
    type: String,
    required: true
  },

  department_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },

}, { timestamps: true });
const Asset = mongoose.model("Asset", assetSchema);

module.exports = Asset;