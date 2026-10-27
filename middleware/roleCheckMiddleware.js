const User = require("../models/userSchema");

const requireApproved = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("isApproved isVerified");
    if (!user) {
      return res.status(401).json({ success: false, message: "User account not found." });
    }
    if (!user.isVerified || !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your account must be verified and approved to access this resource.",
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this resource.",
      });
    }

    next();
  };
}


const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required.", 
    });
  }

  next();
}

module.exports = { requireApproved, requireRole, requireAdmin };
