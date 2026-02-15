const mongoose = require('mongoose');
require('dotenv').config();
const DB_URL = process.env.DB_URL;

const connectDB = async () => {
    try {
        await mongoose.connect(DB_URL)
        console.log('Connected to the database successfully')
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
}

module.exports = connectDB;