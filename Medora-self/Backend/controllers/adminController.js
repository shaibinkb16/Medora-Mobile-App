const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { pushNotification } = require("../utils/notificationHelper");

// ✅ Register Admin (Requires Super Admin Approval)
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, dateOfBirth, gender } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const newAdmin = new User({
      name,
      email,
      passwordHash,
      phoneNumber,
      dateOfBirth,
      gender,
      role: "admin",
      requestedAsAdmin: true,
      isAdminVerified: false,
      status: "pending",
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Admin registration request sent. Waiting for super admin approval.",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Admin/Superadmin Login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "admin" && user.role !== "superadmin") {
      return res.status(403).json({ message: "You are not an admin" });
    }

    if (
      user.role === "admin" &&
      (!user.isAdminVerified || user.status !== "active")
    ) {
      return res.status(403).json({ message: "You are not an approved admin yet." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        isAdminVerified: user.isAdminVerified,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdminVerified: user.isAdminVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Superadmin Approves New Admin
exports.approveAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findById(id);
    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.isAdminVerified = true;
    admin.status = "active";
    await admin.save();

    res.status(200).json({ message: "Admin approved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get All Pending Admins
exports.getPendingAdmins = async (req, res) => {
  try {
    const pendingAdmins = await User.find({
      role: "admin",
      isAdminVerified: false,
      status: "pending",
    });

    res.status(200).json(pendingAdmins);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 📊 Admin Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const activeUsers = await User.countDocuments({ role: "user", status: "active" });
    const admins = await User.countDocuments({ role: "admin", isAdminVerified: true });
    const pendingAdmins = await User.countDocuments({
      role: "admin",
      isAdminVerified: false,
      requestedAsAdmin: true,
    });

    res.json({ totalUsers, activeUsers, admins, pendingAdmins });
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

// 🔔 Fetch recent notifications (latest 10)
exports.getRecentNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title message createdAt");

    res.json(notifications);
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// 🔔 Send notification
exports.sendNotification = async (req, res) => {
  try {
    const { title, message, targetRole } = req.body;
    const senderRole = req.user.role;

    if (!title || !message || !targetRole) {
      return res.status(400).json({ error: "Missing fields" });
    }

    if (senderRole === "admin" && targetRole !== "user") {
      return res.status(403).json({ error: "Admins can only notify users" });
    }

    const users = await User.find({ role: targetRole, expoPushToken: { $ne: null } });

    const created = [];
    for (const user of users) {
      const notif = new Notification({
        userId: user._id,
        title,
        message,
        role: targetRole,
      });
      await notif.save();
      await pushNotification(user._id, title, message);
      created.push(notif);
    }

    res.json({ message: `✅ Notification sent to ${users.length} ${targetRole}s`, notifications: created });
  } catch (err) {
    res.status(500).json({ error: "Failed to send notifications", details: err.message });
  }
};
