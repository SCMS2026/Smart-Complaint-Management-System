const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset"
    },

    category: {
      type: String,
      required: true
    },

    issue: {
      type: String,
      required: true
    },

    location: {
        type: String,
        required: true
    },
    city:  {
        type: String,
        required: true
    },
    District:  {
        type: String,
        required: true
    },
    Taluka:  {
        type: String,
        required: true
    },
    village:  {
        type: String,
        required: true
    },
    pincode:  {
        type: String,
        required: true
    },

    description: {
      type: String,
      required: true
    },

    image: {
      type: String,
      default: null
    },

    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);
const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;