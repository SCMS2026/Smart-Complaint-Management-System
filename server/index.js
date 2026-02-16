const express = require('express');
const session = require('express-session');
const connectDB = require('./config/DB');
const passport = require('passport');
const cors = require('cors');
require('dotenv').config();
require('./config/passport');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require('path');
const authrouter = require('./router/auth.R');

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'SCMS_SESSION_SECRET',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authrouter);

const PORT = process.env.PORT || 8070;
app.listen(PORT, ()=> {
    console.log(`Server is up and running on port ${PORT}`);
    connectDB()
})