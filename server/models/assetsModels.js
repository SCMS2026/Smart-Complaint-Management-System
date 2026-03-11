const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    issue: {
      type: String,
      required: true,
      trim: true
    },

    category: [
      {
        type: String,
        required: true,
        trim: true
      }
    ]
  },
  {
    timestamps: true
  }
);

const Asset = mongoose.model("Asset", assetSchema);

module.exports = Asset;