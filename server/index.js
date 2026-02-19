const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const connectDB = require('./config/DB');
const passport = require('passport');
const cors = require('cors');
require('./config/passport');
const app = express();

// Debug: print env presence
console.log('Server starting with GOOGLE_CLIENT_ID present:', !!process.env.GOOGLE_CLIENT_ID);
console.log('Server starting with GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL);
const googleAuth = require('./auth');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const authrouter = require('./router/authRoutes');

// Session Configuration
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true
  })
);


app.use(passport.initialize());
app.use(passport.session());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes (must be before catch-all route)
app.use('/auth', authrouter);
app.use('/api/auth', googleAuth);

// Debug route
const debugRouter = require('./routes/debug');
app.use('/debug', debugRouter);

const PORT = process.env.PORT || 8070;
app.listen(PORT, ()=> {
    console.log(`Server is up and running on port ${PORT}`);
    connectDB()
})