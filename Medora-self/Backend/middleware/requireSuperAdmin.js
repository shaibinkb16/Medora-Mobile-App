// middleware/requireSuperAdmin.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Auth token missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      // Optionally log this silently, or not at all
      // console.warn("Superadmin token expired:", err.expiredAt); // or skip entirely
    } else {
      console.error("Superadmin auth error:", err); // keep for other errors
    }

    return res.status(401).json({ message: "Token expired or invalid" });
  }
};
