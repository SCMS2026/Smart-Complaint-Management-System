const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const connectDB = require('./config/DB');
const passport = require('passport');
const cors = require('cors');
require('./config/passport');
const app = express();
const googleAuth = require('./auth');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const authrouter = require('./router/authRoutes');

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'SCMS_SESSION_SECRET',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes (must be before catch-all route)
app.use('/auth', authrouter);
app.use('/api/auth', googleAuth);

const PORT = process.env.PORT || 8070;
app.listen(PORT, ()=> {
    console.log(`Server is up and running on port ${PORT}`);
    connectDB()
})