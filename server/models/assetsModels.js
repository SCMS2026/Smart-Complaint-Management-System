const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
});

const Asset = mongoose.model('Asset', assetSchema);
module.exports = Asset;