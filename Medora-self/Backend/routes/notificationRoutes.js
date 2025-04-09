const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  markNotificationAsRead,
  markMultipleNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} = require("../controllers/notificationController"); // Ensure correct import

const authMiddleware = require("../middleware/authMiddleware"); // Ensure auth middleware is correctly imported

// ✅ Fetch user notifications (GET)
router.get("/", authMiddleware, getUserNotifications);

// ✅ Mark a single notification as read (PUT)
router.put("/:id/read", authMiddleware, markNotificationAsRead);

// ✅ Mark multiple notifications as read (PUT)
router.put("/mark-all-read", authMiddleware, markMultipleNotificationsAsRead);



// ✅ Delete a single notification (DELETE)

// ✅ Delete all notifications (DELETE)
router.delete("/delete-all", authMiddleware, deleteAllNotifications);

router.delete("/:id", authMiddleware, deleteNotification);

module.exports = router;
