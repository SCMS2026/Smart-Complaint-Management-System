const express = require('express');
const session = require('express-session');
const path = require('path');
const connectDB = require('./config/DB');
const passport = require('passport');
const cors = require('cors');
const morgan = require('morgan');
require('./config/passport');
const dotenv = require('dotenv');

// Security
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const hpp = require('hpp');

dotenv.config();

// ── ENV CHECK ─────────────────────────────
const REQUIRED_ENV = ['JWT_SECRET', 'MONGO_URI', 'SESSION_SECRET'];
const missingEnv = REQUIRED_ENV.filter(k => !process.env[k]);
if (missingEnv.length) {
  console.error('FATAL Missing ENV:', missingEnv);
  process.exit(1);
}

const app = express();
const isDev = process.env.NODE_ENV === 'development';

// ── CORS (must be first, before any route handling) ─────────────
// In development, allow any origin; in production, restrict to CLIENT_URL
app.use(cors({
  origin: isDev ? true : (process.env.CLIENT_URL || 'http://localhost:3000'),
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support
}));

// ── HELMET ────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false, // Allow cross-origin popups (needed for OAuth)
}));

// ── COMPRESSION ───────────────────────────
app.use(compression());

// ── RATE LIMIT ────────────────────────────
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: { message: 'Too many login attempts. Try again later.' },
  skip: (req) => req.method === 'OPTIONS',
});

const generalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests. Slow down.' },
  skip: (req) => req.method === 'OPTIONS', // Don't rate limit preflight
});

app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
app.use(generalLimiter);

// ── LOGGER ────────────────────────────────
app.use(morgan(isDev ? 'dev' : 'combined'));

// ── BODY PARSER ───────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── SAFE CUSTOM SANITIZER ─────────────────
app.use((req, res, next) => {
  const clean = (obj) => {
    if (!obj || typeof obj !== 'object') return;

    for (const key in obj) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        clean(obj[key]);
      }
    }
  };

  clean(req.body);
  clean(req.params);
  clean(req.query);

  next();
});

// ── HPP ───────────────────────────────────
app.use(hpp({
  whitelist: ['status', 'priority', 'category', 'role']
}));

// ── SESSION ───────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: !isDev,
    httpOnly: true,
    sameSite: isDev ? 'lax' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

// ── PASSPORT ──────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ── ROUTES ────────────────────────────────
app.use('/auth', require('./router/authRoutes'));
app.use('/complaints', require('./router/complaintRoutes'));
app.use('/permissions', require('./router/permissionRoutes'));
app.use('/assets', require('./router/assetsRoutes'));
app.use('/departments', require('./router/departmentRoutes'));
app.use('/worker-tasks', require('./router/workerTaskRoutes'));
app.use('/notifications', require('./router/notificationRoutes'));

// ── STATIC (PRODUCTION) ───────────────────
if (!isDev) {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // ✅ Express 5 safe wildcard
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// ── 404 HANDLER ───────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── ERROR HANDLER ─────────────────────────
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err.message);

  res.status(err.status || 500).json({
    message: isDev ? err.message : 'Internal server error'
  });
});

// ── START SERVER ──────────────────────────
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });