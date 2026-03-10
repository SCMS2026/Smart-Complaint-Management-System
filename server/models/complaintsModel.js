const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: false },
    issue: { type: String, required: true }, 
    category: { type: String, required: true },
    address: { type: String, required: true },            
    city: { type: String, required: true },
    District: { type: String, required: true },
    Taluka: { type: String, required: true },
    village: { type: String, required: true },
    pincode: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['pending', 'in_progress', 'resolved', 'waiting_user'], default: 'pending' },
    image: { type: String, default: null },
    isFake: { type: Boolean, default: false },       
    comments: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            text: String,
            createdAt: { type: Date, default: Date.now }
        }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;