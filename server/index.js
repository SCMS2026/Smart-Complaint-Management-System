const express = require('express');
const connectDB = require('./config/DB');
require('dotenv').config();
const app = express();


const PORT = process.env.PORT || 8070;
app.listen(PORT, ()=> {
    console.log(`Server is up and running on port ${PORT}`);
    connectDB()
})