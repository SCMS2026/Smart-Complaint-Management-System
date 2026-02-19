const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get(
  '/google',
  (req, res, next) => {
    console.log('📍 /auth/google endpoint accessed');
    next();
  },
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get(
  '/google/callback',
  (req, res, next) => {
    console.log('📍 /auth/google/callback endpoint accessed');
    passport.authenticate('google', { session: true }, (err, user, info) => {
      if (err) {
        console.error('❌ Passport Error:', err);
        return res.redirect(`http://localhost:5174/login?error=${encodeURIComponent(err.message)}`);
      }

      if (!user) {
        console.warn('⚠️ No user returned from Google:', info);
        return res.redirect(`http://localhost:5174/login?error=no_user`);
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error('❌ Login Error:', loginErr);
          return res.redirect(`http://localhost:5174/login?error=${encodeURIComponent(loginErr.message)}`);
        }

        console.log('✅ Google Auth Success for:', user.email);
        
        const token = jwt.sign(
          { id: user._id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        const userStr = encodeURIComponent(JSON.stringify({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage
        }));

        res.redirect(
          `http://localhost:5174/google-success?token=${token}&user=${userStr}`
        );
      });
    })(req, res, next);
  }
);


// Google Token Verification (for client-side Google Sign-In)
router.post('/google/verify', authController.verifyGoogleToken);

router.get('/me', authMiddleware, authController.getCurrentUser);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/logout', authController.logout);

router.get('/admin/users',
    authMiddleware,
    allowRoles('admin'),
    authController.getAllUsers
);

router.put('/admin/users/:id/role',
    authMiddleware,
    allowRoles('admin'),
    authController.setUserRole
);

module.exports = router;
