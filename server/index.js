const express = require('express');
const session = require('express-session');
const path = require('path');
// require('dotenv').config({ path: path.join(__dirname, '.env') });
const connectDB = require('./config/DB');
const passport = require('passport');
const cors = require('cors');
const morgan = require('morgan');
require('./config/passport');
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

dotenv.config();
const app = express();

// Debug: print env presence
console.log('Server starting with GOOGLE_CLIENT_ID present:', !!process.env.GOOGLE_CLIENT_ID);
console.log('Server starting with GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL);
const googleAuth = require('./auth'); // Will keep the file but remove its usage for now

// CORS configuration for credentials
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev')); // "dev" mode outputs colored and well-formatted API requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const authrouter = require('./router/authRoutes');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Session Configuration
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true
  })
);

app.post("/auth/google", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    console.log("payload", payload);

    const user = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };

    // Create JWT for your app
    const appToken = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ user, token: appToken });
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
});


app.use(passport.initialize());
app.use(passport.session());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes (must be before catch-all route)
app.use('/auth', authrouter);
// app.use('/api/auth', googleAuth); // REMOVED redundant route

// Debug route
const debugRouter = require('./routes/debug');
app.use('/debug', debugRouter);

const PORT = process.env.PORT || 8070;
app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
  connectDB()
})