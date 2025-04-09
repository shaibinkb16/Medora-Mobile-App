const express = require("express");
const router = express.Router();
const {
  sendNotification,
  getAllSentNotifications,
  deleteNotification,
  deleteAllNotifications,
} = require("../../controllers/superadmin/superAdminNotificationController");
const requireSuperAdmin  = require("../../middleware/requireSuperAdmin");

router.post("/send", requireSuperAdmin, sendNotification);
router.get("/history", requireSuperAdmin, getAllSentNotifications);
router.delete("/:id", requireSuperAdmin, deleteNotification);
router.delete("/", requireSuperAdmin, deleteAllNotifications);

module.exports = router;
