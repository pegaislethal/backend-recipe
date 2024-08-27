const jwt = require("jsonwebtoken");
const Admin = require("../model/adminSchema");
const Recipe = require("../model/recipeSchema"); // assuming you have a Recipe model

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
      const admin = await getAdmin(req.user.id);
      if (!admin) {
        return res.status(403).json({ success: false, message: "You don't have permission to access this route." });
      }

      if (hasPermission(admin.role, permissions)) {
        return next();
      }

    
    } catch (err) {
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  };
};

const getAdmin = async (id) => {
  try {
    return await Admin.findById(id);
  } catch (err) {
    throw err;
  }
};

const hasPermission = (role, permissions) => {
  return permissions.includes(role);
};

module.exports = {authenticate,authAdmin};