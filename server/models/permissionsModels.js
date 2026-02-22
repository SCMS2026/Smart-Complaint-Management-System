const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    requestBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
})