const mongoose = require("mongoose")

const assetSchema = new mongoose.Schema(
  {
    assetCode: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['street_light', 'bench', 'park', 'road', 'drain', 'water_line', 'sewer_line', 'public_building', 'playground', 'garden', 'signboard', 'other'],
      default: 'other'
    },
    category: {
      type: [String],
      default: []
    },
    issue: {
      type: String,
      default: null
    },
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null
    },
    department: {
      type: String
    },
    location: {
      address: String,
      area: String,
      city: String
    },
    description: String,
    installationDate: Date,
    lastMaintenanceDate: Date,
    nextMaintenanceDate: Date,
    image: String,
    notes: String,
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
)

assetSchema.index({ department_id: 1 });
assetSchema.index({ type: 1 });
assetSchema.index({ status: 1 });

module.exports = mongoose.model("Asset", assetSchema)