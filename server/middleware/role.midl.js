const allowRoles = (...roles) => {
  try {
    return (req, res, next) => {
      if (!roles.includes(req.user.role))
        return res.status(403).json({ message: "Access denied" })
      next()
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = allowRoles