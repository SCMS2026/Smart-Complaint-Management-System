const allowRoles = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role ? String(req.user.role).toLowerCase().trim() : null;
    const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim());

    console.log("🔍 ROLE CHECK DEBUG:");
    console.log("   User role (from token):", req.user?.role);
    console.log("   Normalized user role:", userRole);
    console.log("   Path:", req.method, req.originalUrl);
    console.log("   Allowed roles:", normalizedRoles);
    console.log("   Is allowed?:", userRole && normalizedRoles.includes(userRole));

    if (!userRole || !normalizedRoles.includes(userRole)) {
      console.error(`❌ ACCESS DENIED: role=${req.user?.role} path=${req.method} ${req.originalUrl}`);
      return res.status(403).json({
        message: `Access denied. Your role: ${req.user?.role}. Allowed: ${normalizedRoles.join(", ")}`
      });
    }

    next();
  };
};

module.exports = allowRoles;