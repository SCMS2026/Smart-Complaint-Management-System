const mongoose = require('mongoose');
require('dotenv').config();

// Validate MongoDB URI configuration
const DB_URL = process.env.MONGO_URI;
const connectDB = async () => {
    try {
        await mongoose.connect(DB_URL);
        console.log('✅ Connected to the database successfully');
    } catch (error) {
        console.error('❌ Error connecting to the database:', error.message);
        process.exit(1);
    }
}

module.exports = connectDB;