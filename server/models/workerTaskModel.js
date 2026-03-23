const mongoose = require('mongoose');
const workerTaskSchema = new mongoose.Schema({
  complaint_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Complaint"
  },

  worker_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  status: {
    type: String,
    enum: ["assigned", "started", "completed"],
    default: "assigned"
  },

  before_photo: String,
  after_photo: String

}, { timestamps: true });

const WorkerTask = mongoose.model("WorkerTask", workerTaskSchema);
module.exports = WorkerTask;