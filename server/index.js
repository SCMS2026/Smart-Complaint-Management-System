const express    = require('express');
const session    = require('express-session');
const path       = require('path');
const connectDB  = require('./config/DB');
const passport   = require('passport');
const cors       = require('cors');
const morgan     = require('morgan');
require('./config/passport');
const dotenv     = require('dotenv');
const jwt        = require('jsonwebtoken');

// Security packages
const helmet         = require('helmet');
const rateLimit      = require('express-rate-limit');
const compression    = require('compression');
const xssClean       = require('xss-clean');
const mongoSanitize  = require('express-mongo-sanitize');
const hpp            = require('hpp');

dotenv.config();

// ── Startup: required env check ───────────────────────────────────────────────
const REQUIRED_ENV = ['JWT_SECRET', 'MONGO_URI', 'SESSION_SECRET'];
const missingEnv = REQUIRED_ENV.filter(k => !process.env[k]);
if (missingEnv.length > 0) {
  console.error('FATAL: Missing required environment variables:', missingEnv.join(', '));
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.warn('WARNING: JWT_SECRET too short. Use 32+ random characters.');
}

const app   = express();
const isDev = process.env.NODE_ENV === 'development';

// ── 1. Helmet — HTTP security headers ─────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:    ["'self'", "https://fonts.gstatic.com"],
      imgSrc:     ["'self'", "data:", "https:"],
      scriptSrc:  ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ── 2. Compression ────────────────────────────────────────────────────────────
app.use(compression());

// ── 3. Rate limiting ──────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 15,
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiters BEFORE routes
app.use('/auth/login',    authLimiter);
app.use('/auth/register', authLimiter);
app.use('/auth/google',   authLimiter);
app.use(generalLimiter);

// ── 4. CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:3001',
];
if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Postman / curl
    if (isDev || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.options('/{*path}', cors(corsOptions));

// ── 5. Request logging (production-safe) ──────────────────────────────────────
// 'dev' leaks query params and paths in colour — use 'combined' or skip in prod
if (isDev) {
  app.use(morgan('dev'));
} else {
  // Production: log only method, url, status, response-time — no body/tokens
  app.use(morgan(':method :url :status :response-time ms'));
}

// ── 6. Body parsing (small limits to prevent DoS) ─────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── 7. XSS protection — sanitise req.body / req.query / req.params ───────────
app.use(xssClean());

// ── 8. NoSQL injection protection — strip $ and . from input ─────────────────
app.use(mongoSanitize({
  replaceWith: '_',   // replace $ with _ instead of deleting (easier to debug)
  onSanitizeError: (req, res) => {
    res.status(400).json({ message: 'Invalid characters in request data' });
  },
}));

// ── 9. HTTP Parameter Pollution protection ────────────────────────────────────
app.use(hpp({
  whitelist: ['status', 'priority', 'category', 'role'], // allow arrays for filters
}));

// ── 10. Session (use env secret, secure in production) ───────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure:   !isDev,          // HTTPS only in production
    httpOnly: true,            // JS cannot read cookie
    sameSite: isDev ? 'lax' : 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000,  // 7 days
  },
}));

// ── Passport ──────────────────────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ── Routers ───────────────────────────────────────────────────────────────────
const authrouter       = require('./router/authRoutes');
const complaintRouter  = require('./router/complaintRoutes');
const permissionRouter = require('./router/permissionRoutes');
const departmentRouter = require('./router/departmentRoutes');
const workerTaskRouter = require('./router/workerTaskRoutes');
const notificationRouter = require('./router/notificationRoutes');
const assetsRouter     = require('./router/assetsRoutes');
const slaMonitor       = require('./services/slaMonitoring');

app.use('/auth',         authrouter);
app.use('/complaints',   complaintRouter);
app.use('/permissions',  permissionRouter);
app.use('/assets',       assetsRouter);
app.use('/departments',  departmentRouter);
app.use('/worker-tasks', workerTaskRouter);
app.use('/notifications',notificationRouter);

// ── Debug routes: ONLY in development ────────────────────────────────────────
if (isDev) {
  const debugRouter = require('./router/debug');
  app.use('/debug', debugRouter);
}

// ── Static files (production build) ──────────────────────────────────────────
if (!isDev) {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Global error handler (prevents stack traces leaking to client) ────────────
app.use((err, req, res, next) => {
  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS: origin not allowed' });
  }
  // Log full error server-side only
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} ERROR:`, err.message);
  if (isDev) console.error(err.stack);

  // Never expose stack traces or internal messages to client
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    message: isDev ? err.message : 'Internal server error',
  });
});

// ── DB + Server ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT} [${isDev ? 'development' : 'production'}]`);
    slaMonitor.start();
  });
}).catch(err => {
  console.error('❌ DB connection failed:', err.message);
  process.exit(1);
});