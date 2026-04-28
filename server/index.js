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

// Security middlewares
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

dotenv.config();
const app = express();

// Security middleware (order matters)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Rate limiting - stricter on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
app.use('/auth/google', authLimiter);
app.use(generalLimiter);

// CORS configuration for credentials
const isDev = process.env.NODE_ENV === 'development';

// Build allowed origins list
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:3001',
];
if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);
    if (isDev || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
// Handle preflight for all routes
app.options('/{*path}', cors(corsOptions));

app.use(morgan('dev'));

// Body parsing with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const authrouter = require('./router/authRoutes');
const complaintRouter = require('./router/complaintRoutes');
const permissionRouter = require('./router/permissionRoutes');
const departmentRouter = require('./router/departmentRoutes');
const workerTaskRouter = require('./router/workerTaskRoutes');
const notificationRouter = require('./router/notificationRoutes');

const assetsRouter = require('./router/assetsRoutes');
const slaMonitor = require('./services/slaMonitoring');

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
    console.log("Google ID token payload", payload);

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
      { id: user._id, email: user.email, role: user.role, department: user.department },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Refresh token
    const refreshToken = jwt.sign(
      { id: user._id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
      token: appToken,
      refreshToken,
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
app.use('/notifications', notificationRouter);

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
  connectDB();

  // Start background services
  slaMonitor.start();
});