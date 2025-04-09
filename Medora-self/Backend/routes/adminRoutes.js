const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const adminController = require("../controllers/adminController");

const router = express.Router();

// 🔐 Inline verifyToken middleware
const verifyToken = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// 🔐 Inline check for superadmin
const isSuperAdmin = (req, res, next) => {
  if (req.user.role === "superadmin") return next();
  res.status(403).json({ message: "Access denied: Super admin only" });
};

// 🔐 Inline check for approved admin or superadmin
const isAdminOrSuperAdmin = (req, res, next) => {
  const { role, isAdminVerified, status } = req.user;
  if (
    (role === "admin" && isAdminVerified && status === "active") ||
    role === "superadmin"
  ) {
    return next();
  }
  res.status(403).json({ message: "Access denied: Admins only" });
};

// ✅ Register/Login
router.post("/register", adminController.registerAdmin);
router.post("/login", adminController.loginAdmin);

// ✅ Superadmin actions
router.put("/approve/:id", verifyToken, isSuperAdmin, adminController.approveAdmin);
router.get("/pending", verifyToken, isSuperAdmin, adminController.getPendingAdmins);

// ✅ Dashboard & Notifications
router.get("/dashboard-stats", verifyToken, isAdminOrSuperAdmin, adminController.getDashboardStats);
router.get("/notifications", verifyToken, isAdminOrSuperAdmin, adminController.getRecentNotifications);
router.post("/send-notification", verifyToken, isAdminOrSuperAdmin, adminController.sendNotification);

module.exports = router;
