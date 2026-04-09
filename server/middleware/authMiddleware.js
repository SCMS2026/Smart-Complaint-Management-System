const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 FIX: normalize role
    req.user = {
      id: decoded.id,
      role: decoded.role
        ? decoded.role.toString().toLowerCase().trim()
        : null,
      department: decoded.department || null
    };

    console.log("✅ USER:", req.user);

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;