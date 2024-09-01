const jwt = require("jsonwebtoken");
const Admin = require("../model/adminSchema");

// Authentication middleware
const authenticate = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ success: false, message: "Invalid token." });
  }
};

// Authorization middleware for admin access
const authAdmin = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        
        return res.status(401).json({ success: false, message: "Unauthorized access." });
      }

      const admin = await Admin.findById(req.user.id);
      if (!admin) {
        return res.status(403).json({ success: false, message: "Admin not found." });
      }

      if (hasPermission(admin.role, permissions)) {
        return next();  // Proceed if permission check passes
      } else {
        return res.status(403).json({ success: false, message: "Insufficient privileges." });
      }

    } catch (err) {
      console.error("Error in authAdmin middleware:", err); // Log the error for debugging
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
  };
};

const hasPermission = (adminRole, requiredPermissions) => {
  return requiredPermissions.includes(adminRole);
};

module.exports = { authenticate, authAdmin };
