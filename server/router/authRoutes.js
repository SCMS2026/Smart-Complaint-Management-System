const router = require('express').Router();
const passport = require('passport');

const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  authController.googleCallback
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
