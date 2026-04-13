const express = require('express');
const session = require('express-session');
const path = require('path');
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
const isDev = process.env.NODE_ENV === 'development';
app.use(cors({
  origin: isDev ? ['http://localhost:3000', 'http://localhost:5174', 'http://localhost:5000'] : [process.env.CLIENT_URL || 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev')); // "dev" mode outputs colored and well-formatted API requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const authrouter = require('./router/authRoutes');
const complaintRouter = require('./router/complaintRoutes');
const permissionRouter = require('./router/permissionRoutes');
const departmentRouter = require('./router/departmentRoutes');
const workerTaskRouter = require('./router/workerTaskRoutes');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const assetsRouter = require('./router/assetsRoutes');

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
    console.log("Google ID token payload", payload);

    // find or create a user in our database
    const User = require("./models/authModels");
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name,
        email,
        googleId,
        profileImage: picture,
        isVerified: true,
      });
      await user.save();
      console.log("Created new user from google login", email);
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.profileImage = picture;
      await user.save();
      console.log("Associated googleId with existing user", email);
    }

    const appToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
      token: appToken,
    });
  } catch (error) {
    console.error("Google login error", error.message);
    res.status(400).json({ message: "Invalid token" });
  }
});


app.use(passport.initialize());
app.use(passport.session());

// mount API routers
app.use('/auth', authrouter);
app.use('/complaints', complaintRouter);
app.use('/permissions', permissionRouter); 
app.use('/assets', assetsRouter);
app.use('/departments', departmentRouter);
app.use('/worker-tasks', workerTaskRouter); 

if (!isDev) {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

const debugRouter = require('./router/debug');
app.use('/debug', debugRouter);


if (!isDev) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
  console.log(`Environment: ${isDev ? 'DEVELOPMENT' : 'PRODUCTION'}`);
  connectDB()
})