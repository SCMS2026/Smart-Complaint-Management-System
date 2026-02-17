const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Check for session-based authentication (OAuth users)
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }

    // Check for JWT token in headers
    const header = req.headers.authorization;

    if (!header)
        return res.status(401).json({ message: "Token required" });

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token", error: error.message });
    }
};

module.exports = authMiddleware;
