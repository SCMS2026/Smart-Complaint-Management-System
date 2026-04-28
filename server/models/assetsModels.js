const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
  // Unique identifier for the public property (e.g., STL-001, BEN-042)
  assetCode: {
    type: String,
    unique: true,
    trim: true
  },

  // Property name/description
  name: {
    type: String,
    required: true,
    trim: true
  },

  // Type of public property
  type: {
    type: String,
    enum: [
      'street_light',
      'bench',
      'park',
      'road',
      'drain',
      'water_line',
      'sewer_line',
      'public_building',
      'playground',
      'garden',
      'signboard',
      'other'
    ],
    required: true
  },

  // Category for additional grouping (can be multiple)
  category: {
    type: [String],
    default: []
  },

  // Department responsible for this asset
  department_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },

  // Location details
  location: {
    address: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String },
    taluka: { type: String },
    village: { type: String },
    pincode: { type: String },
    landmark: { type: String },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },

  // Asset description
  description: {
    type: String
  },

  // Installation details
  installationDate: {
    type: Date
  },

  // Last maintenance date
  lastMaintenanceDate: {
    type: Date
  },

  // Next scheduled maintenance
  nextMaintenanceDate: {
    type: Date
  },

  // Current status
  status: {
    type: String,
    enum: ['active', 'inactive', 'under_maintenance', 'damaged', 'retired'],
    default: 'active'
  },

  // Image of the asset
  image: {
    type: String
  },

  // Additional notes
  notes: {
    type: String
  }

}, { timestamps: true });

// Indexes for better query performance
assetSchema.index({ assetCode: 1 });
assetSchema.index({ type: 1 });
assetSchema.index({ 'location.city': 1 });
assetSchema.index({ 'location.area': 1 });
assetSchema.index({ department_id: 1 });
assetSchema.index({ status: 1 });

module.exports = mongoose.model("Asset", assetSchema);

module.exports = mongoose.model("Asset", assetSchema);