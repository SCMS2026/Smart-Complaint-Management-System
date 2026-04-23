const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const { body, validationResult } = require('express-validator');

// Validation middleware helper
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  };
};

const getClientUrl = () => {
  return process.env.CLIENT_URL || 'http://localhost:3000';
};

// Validation rules
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['user', 'department_admin', 'worker', 'admin', 'super_admin', 'contractor', 'analyzer']),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerRules, validate(registerRules), authController.register);
router.post('/login', loginRules, validate(loginRules), authController.login);
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
    const clientUrl = getClientUrl().replace(/\/+$/, '');
    passport.authenticate('google', { session: true }, (err, user, info) => {
      if (err) {
        console.error('❌ Passport Error:', err);
        return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(err.message)}`);
      }

      if (!user) {
        console.warn('⚠️ No user returned from Google:', info);
        return res.redirect(`${clientUrl}/login?error=no_user`);
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error('❌ Login Error:', loginErr);
          return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(loginErr.message)}`);
        }

        console.log('✅ Google Auth Success for:', user.email);

        const token = jwt.sign(
          { id: user._id, email: user.email, role: user.role, department: user.department },
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
          `${clientUrl}/google-success?token=${token}&user=${userStr}`
        );
      });
    })(req, res, next);
  }
);


// Google Token Verification (for client-side Google Sign-In)
router.post('/google', authController.verifyGoogleToken);
router.post('/google/verify', authController.verifyGoogleToken);

router.get('/me', authMiddleware, authController.getCurrentUser);
router.patch('/profile', authMiddleware, authController.updateProfile);
router.post('/logout', authController.logout);

router.get('/admin/users',
  authMiddleware,
  allowRoles('admin','super_admin','department_admin'),
  authController.getAllUsers
);

router.put('/admin/users/:id/role',
  authMiddleware,
  allowRoles('admin','super_admin'),
  authController.setUserRole
);

router.put('/admin/users/:id/department',
  authMiddleware,
  allowRoles('admin','super_admin'),
  authController.setUserDepartment
);

// Toggle user status
router.patch('/admin/users/:id/toggle-status',
  authMiddleware,
  allowRoles('admin','super_admin'),
  authController.toggleUserStatus
);

// Bulk delete users
router.post('/admin/users/bulk-delete',
  authMiddleware,
  allowRoles('admin','super_admin'),
  authController.bulkDeleteUsers
);

// Delete User — Super Admin only
router.delete('/admin/users/:id',
  authMiddleware,
  allowRoles('admin','super_admin'),
  authController.deleteUser
);

// Refresh Token endpoint
router.post('/refresh', authController.refreshToken);

module.exports = router;