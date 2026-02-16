const {Router} = require('express');
const passport = require('passport');
const { register, login, googleCallback, getCurrentUser, updateProfile, logout, getAllUsers, setUserRole } = require('../controllers/Auth.C');
const { authMiddleware, isAuthenticated } = require('../middleware/auth.midl');
const allowRoles = require('../middleware/role.midl');

const authrouter = Router();

// Traditional Auth Routes
authrouter.post('/register', register);
authrouter.post('/login', login);

// Google OAuth Routes
authrouter.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'] 
}));

authrouter.get('/google/callback', passport.authenticate('google', { 
    failureRedirect: '/auth/login' 
}), googleCallback);

// Protected Routes
authrouter.get('/me', authMiddleware, getCurrentUser);
authrouter.put('/profile', authMiddleware, updateProfile);
authrouter.post('/logout', logout);


// Admin routes
authrouter.get('/admin/users', authMiddleware, allowRoles('admin'), getAllUsers);
authrouter.put('/admin/users/:id/role', authMiddleware, allowRoles('admin'), setUserRole);

module.exports = authrouter;
