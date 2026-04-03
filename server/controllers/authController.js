const User = require('../models/authModels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const register = async (req, res) => {
    try {
        const { name, email, password, profileImage,role } = req.body;

        if (!name) return res.status(400).json({ message: "Name required" });
        if (!email) return res.status(400).json({ message: "Email required" });
        if (!password) return res.status(400).json({ message: "Password required" });

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            profileImage: profileImage || null,
            isVerified: true

        });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "Registered successfully",
            token,
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

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, role: user.role, department: user.department },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful",
            token,
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

        const jwtToken = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Session error', error: err.message });
            }

            res.status(200).json({
                message: 'Google authentication successful',
                token: jwtToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
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
        const user = await User.findById(req.user.id).select("-password");
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

const logout = (req, res) => {
    req.logout(() => {
        req.session.destroy();
        res.json({ message: "Logged out successfully" });
    });
};

const getAllUsers = async (req, res) => {
    const users = await User.find().select("-password");
    res.json(users);
};

const setUserRole = async (req, res) => {
    const { role, department_id } = req.body;

    if (!["user", "admin", "super_admin", "department_admin", "worker", "contractor", "analyzer"].includes(role))
        return res.status(400).json({ message: "Invalid role" });

    if (role === 'department_admin' && !department_id) {
        return res.status(400).json({ message: "Department is required for department admin" });
    }

    const updateData = { role };
    if (department_id) updateData.department_id = department_id;

    const user = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
    ).select("-password");

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
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
    setUserRole
};
