/* const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin', 'all'],
    default: null,
  },
  scheduledAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);
 */


const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin', 'all'],
    default: null,
  },
  scheduledAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  reminderId: { type: mongoose.Schema.Types.ObjectId, ref: "Reminder" }
});

module.exports = mongoose.model("Notification", notificationSchema);