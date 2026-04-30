const mongoose = require("mongoose")

const assetSchema = new mongoose.Schema(
  {
    assetCode: {
      type: String,
      required: true,
      unique: true // ✅ keep this
    },
    name: {
      type: String,
      required: true
    },
    department: {
      type: String
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Asset", assetSchema)