const Notification = require("../models/Notification");
const { pushNotification } = require("../utils/notificationHelper");

// ✅ Fetch user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized: No user ID found" });

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// ✅ Mark a single notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ error: "Notification not found" });

    notification.isRead = true;
    await notification.save();

    res.json({ message: "✅ Notification marked as read" });
  } catch (error) {
    console.error("❌ Error updating notification:", error);
    res.status(500).json({ error: "Failed to update notification" });
  }
};

// ✅ Mark multiple notifications as read
exports.markMultipleNotificationsAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    if (!notificationIds?.length) return res.status(400).json({ error: "No notification IDs provided" });

    await Notification.updateMany({ _id: { $in: notificationIds } }, { $set: { isRead: true } });

    res.json({ message: "✅ Notifications marked as read" });
  } catch (error) {
    console.error("❌ Error updating notifications:", error);
    res.status(500).json({ error: "Failed to update notifications" });
  }
};

// ✅ Create a new notification and send push notification
exports.createNotification = async (userId, title, message) => {
  try {
    const notification = new Notification({ userId, title, message });
    await notification.save();
    console.log(`🔔 Notification saved for user ${userId}`);

    await pushNotification(userId, title, message);
    return notification;
  } catch (error) {
    console.error("❌ Error creating notification:", error);
  }
};

// ✅ Update user's Expo Push Token
exports.updatePushToken = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { expoPushToken } = req.body;
    if (!expoPushToken) return res.status(400).json({ error: "Expo push token is required" });

    await User.findByIdAndUpdate(userId, { expoPushToken });

    res.json({ message: "✅ Push token updated successfully" });
  } catch (error) {
    console.error("❌ Error updating push token:", error);
    res.status(500).json({ error: "Failed to update push token" });
  }
};

// ✅ Delete a single notification
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

// ✅ Delete multiple notifications
exports.deleteMultipleNotifications = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    if (!notificationIds?.length) return res.status(400).json({ error: "No notification IDs provided" });

    await Notification.deleteMany({ _id: { $in: notificationIds } });

    res.json({ message: "✅ Notifications deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting notifications:", error);
    res.status(500).json({ error: "Failed to delete notifications" });
  }
};

// ✅ Delete all notifications for the user
// ✅ Delete all notifications for the authenticated user
exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // Get the authenticated user ID

    // ✅ Delete all notifications belonging to the user
    await Notification.deleteMany({ user: userId });

    res.json({ message: "✅ All notifications deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting all notifications:", error);
    res.status(500).json({ error: "Failed to delete all notifications" });
  }
};

