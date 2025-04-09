const Notification = require("../../models/Notification");
const User = require("../../models/User");
const { pushNotification } = require("../../utils/notificationHelper");

/**
 * Send notification (quick or scheduled) to selected audience
 * @route POST /api/superadmin/notifications/send
 */
exports.sendNotification = async (req, res) => {
  try {
    const { title, message, role, userIds = [], delay = 0 } = req.body;

    // Validate input
    if (!title || !message || !role) {
      return res.status(400).json({ error: "Title, message, and role are required." });
    }

    let recipients = [];

    if (role === "specific") {
      // Send to specific users/admins
      recipients = await User.find({ _id: { $in: userIds } });
    } else if (role === "user") {
      recipients = await User.find({
        $or: [{ role: "user" }, { role: { $exists: false } }]
      });
    } else if (role === "admin") {
      recipients = await User.find({ role: "admin" });
    } else if (role === "all") {
      recipients = await User.find();
    } else {
      return res.status(400).json({ error: "Invalid role type" });
    }

    if (recipients.length === 0) {
      return res.status(404).json({ error: "No recipients found" });
    }

    const sendNotifications = async () => {
      for (const user of recipients) {
       /*  const notification = new Notification({
          userId: user._id,
          title,
          message,
          role: user.role || "user",
        });

        await notification.save(); */
        await pushNotification(user._id, title, message);
      }
      console.log("✅ Notifications dispatched.");
    };

    if (delay > 0) {
      console.log(`⏳ Notification scheduled in ${delay}ms`);
      setTimeout(sendNotifications, delay);
    } else {
      await sendNotifications();
    }

    res.json({ message: `✅ Notification ${delay > 0 ? "scheduled" : "sent"} successfully` });
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
};

/**
 * Fetch all notifications sent (admin view)
 * @route GET /api/superadmin/notifications/history
 */
exports.getAllSentNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).populate("userId", "name email role");
    res.json({ notifications });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

/**
 * Delete a notification by ID (admin)
 */
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ error: "Notification not found" });

    await notification.deleteOne();
    res.json({ message: "✅ Notification deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
};

/**
 * Delete all notifications for all users (dangerous!)
 */
exports.deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({ message: "✅ All notifications deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting all notifications:", error);
    res.status(500).json({ error: "Failed to delete all notifications" });
  }
};
