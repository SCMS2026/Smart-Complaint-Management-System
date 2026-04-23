const User = require('../models/authModels');
const Department = require('../models/departmentModel');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { body, validationResult } = require('express-validator');

// Helper to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({ field: err.param, message: err.msg }))
    });
  }
  next();
};

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['user', 'department_admin', 'worker', 'admin', 'super_admin', 'contractor', 'analyzer']),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            department: department_id || null,
            profileImage: profileImage || null,
            isVerified: true

        });

        const token = jwt.sign(
            { id: user._id, role: user.role, department: user.department },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Generate refresh token (30 days expiry)
        const refreshToken = jwt.sign(
          { id: user._id, type: 'refresh' },
          process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
          { expiresIn: "30d" }
        );

        // Save refresh token to user (optional, for revocation)
        user.refreshToken = refreshToken;
        user.refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await user.save();

        res.status(201).json({
            message: "Registered successfully",
            token,
            refreshToken,
            user
        });

    } catch (err) {
        res.status(500).json({ message: "Registration failed", error: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: "Email & Password required" });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(401).json({ message: "Invalid credentials" });

        if (!user.password) {
            return res.status(401).json({ message: "This account was created using Google. Please login with Google." });
        }

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, role: user.role, department: user.department },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Generate and store refresh token
  const refreshToken = jwt.sign(
    { id: user._id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  user.refreshToken = refreshToken;
  user.refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await user.save();

  res.json({
    message: "Login successful",
    token,
    refreshToken,
    user
  });

    } catch (err) {
        res.status(500).json({ message: "Login error", error: err.message });
    }
};

const googleCallback = (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.redirect("http://localhost:5174/login?error=no_user");
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, department: user.department },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        const userStr = encodeURIComponent(JSON.stringify({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department || null,
            profileImage: user.profileImage
        }));

        res.redirect(
            `http://localhost:5174/google-success?token=${token}&user=${userStr}`
        );
    } catch (err) {
        console.error("Google callback error:", err);
        res.redirect(`http://localhost:5174/login?error=${encodeURIComponent(err.message)}`);
    }
};

const verifyGoogleToken = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        if (!email) {
            return res.status(400).json({ message: 'Email not found in Google token' });
        }

        let user = await User.findOne({ googleId });

        if (!user) {
            // Check if email exists
            user = await User.findOne({ email });
            if (user) {
                // Attach Google ID and picture to existing user
                user.googleId = googleId;
                user.profileImage = picture || user.profileImage;
                user.isVerified = true;
                await user.save();
            } else {
                // Create new user
                user = new User({
                    name,
                    email,
                    googleId,
                    profileImage: picture,
                    googleProfile: {
                        provider: 'google',
                        id: googleId,
                        displayName: name,
                        photo: picture
                    },
                    isVerified: true
                });
                await user.save();
            }
        } else if (picture && user.profileImage !== picture) {
            // Update picture if it changed
            user.profileImage = picture;
            await user.save();
        }

        const jwtToken = jwt.sign(
            { id: user._id, email: user.email, role: user.role, department: user.department },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Refresh token
        const refreshToken = jwt.sign(
          { id: user._id, type: 'refresh' },
          process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
          { expiresIn: '30d' }
        );

        user.refreshToken = refreshToken;
        user.refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await user.save();

        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Session error', error: err.message });
            }

  res.json({
    message: 'Google authentication successful',
    token: jwtToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || null,
      profileImage: user.profileImage
    }
  });
        });

    } catch (error) {
        console.error('Google Token Verification Error:', error);
        res.status(401).json({
            message: 'Token verification failed',
            error: error.message
        });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password").populate("department", "name");
        res.json({
            user
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch user", error: err.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, profileImage } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, profileImage, updatedAt: Date.now() },
            { new: true }
        ).select("-password");

        res.json({
            message: "Profile updated",
            user
        });

    } catch {
        res.status(500).json({ message: "Update failed" });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const filter = {};

        // Department-wise filtering for department admins
        if (req.user && req.user.role === 'department_admin' && req.user.department) {
            filter.department = req.user.department;
        }

        const users = await User.find(filter).select("-password").populate("department", "name");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

const setUserRole = async (req, res) => {
    const { role, department_id } = req.body;
    console.log("setUserRole called:", req.params.id, "role:", role, "department_id:", department_id);

    if (!["user", "admin", "super_admin", "department_admin", "worker", "contractor", "analyzer"].includes(role))
        return res.status(400).json({ message: "Invalid role" });

    if (role === 'department_admin' && !department_id) {
        return res.status(400).json({ message: "Department is required for department admin" });
    }

    // Validate department exists if provided
    if (department_id) {
        const department = await Department.findById(department_id);
        if (!department) {
            return res.status(404).json({ message: "Department not found" });
        }
    }

    // Get current user to check previous role
    const currentUser = await User.findById(req.params.id);
    if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
    }

    const updateData = { role };
    if (department_id) {
      // Convert string to ObjectId if needed
      const deptObjId = new mongoose.Types.ObjectId(department_id);
      updateData.department = deptObjId;
      console.log("Setting user department to:", deptObjId);
    } else if (role === 'department_admin' && !department_id) {
      // department_id required for department_admin - don't allow without
      return res.status(400).json({ message: "Department is required for department admin" });
    } else if (role !== 'department_admin') {
      // Clear department when removing department_admin role
      updateData.department = null;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
    ).select("-password");

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Handle department admin assignments
    if (role === 'department_admin' && department_id) {
        // If user was previously department_admin for a different department, clear that
        if (currentUser.role === 'department_admin' && currentUser.department && currentUser.department.toString() !== department_id) {
            await Department.findByIdAndUpdate(currentUser.department, { admin: null });
        }
        // Assign this user as department admin for the new department
        await Department.findByIdAndUpdate(department_id, { admin: user._id });
    } else if (currentUser.role === 'department_admin' && role !== 'department_admin') {
        // If changing from department_admin to another role, clear the department admin
        if (currentUser.department) {
            await Department.findByIdAndUpdate(currentUser.department, { admin: null });
        }
    }

    res.json(user);
};

const setUserDepartment = async (req, res) => {
    try {
        const { department_id } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { department: department_id || null },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error updating user department", error: error.message });
    }
};

// Delete User — Super Admin only
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Super admin cannot delete themselves
    if (id === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: `User '${user.name}' deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};

// Toggle User Active Status — Super Admin only
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ message: "You cannot modify your own status" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle status
    const newStatus = user.status === "active" ? "inactive" : "active";
    user.status = newStatus;
    await user.save();

    res.json({
      message: `User ${newStatus === 'active' ? 'unblocked' : 'blocked'} successfully`,
      user: user.select("-password")
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating user status", error: error.message });
  }
};

// Bulk Delete Users — Super Admin only
const bulkDeleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "No user IDs provided" });
    }

    // Prevent self-deletion
    const filteredIds = userIds.filter(id => id !== req.user.id);

    if (filteredIds.length === 0) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }

    const result = await User.deleteMany({
      _id: { $in: filteredIds }
    });

    res.json({
      message: `${result.deletedCount} user(s) deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting users", error: error.message });
  }
};

// Bulk Delete Complaints — Admin only (this should be in complaintsController - moving there)
// Keeping stub for now to avoid breaking exports
const bulkDeleteComplaints = async (req, res) => {
  res.status(501).json({ message: "Not implemented - should be in complaintsController" });
};

// Refresh Token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(403).json({ message: 'Invalid token type' });
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user || user.status !== 'active') {
      return res.status(404).json({ message: 'User not found or inactive' });
    }

    // Verify stored refresh token
    if (user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Check expiry
    if (user.refreshTokenExpiry && user.refreshTokenExpiry < new Date()) {
      return res.status(403).json({ message: 'Refresh token expired' });
    }

    // Generate new tokens
    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role, department: user.department },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const newRefreshToken = jwt.sign(
      { id: user._id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    user.refreshToken = newRefreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save();

    res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 7 * 24 * 60 * 60
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Logout - clear refresh token
const logout = async (req, res) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user.id, {
        refreshToken: null,
        refreshTokenExpiry: null
      });
    }
    req.logout(() => {
      req.session.destroy();
      res.json({ message: "Logged out successfully" });
    });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};

module.exports = {
    register,
    login,
    googleCallback,
    verifyGoogleToken,
    getCurrentUser,
    updateProfile,
    logout,
    getAllUsers,
    setUserRole,
    setUserDepartment,
    deleteUser,
    toggleUserStatus,
    bulkDeleteUsers,
    refreshToken
};