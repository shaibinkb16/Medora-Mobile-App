/* // models/Reminder.js
const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  type: {
    type: String,
    enum: ["Medication", "Appointment", "Doctor Visit", "Schedule", "Period"],
    required: true,
  },

  title: { type: String, required: true },
  description: { type: String },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  time: { type: String, required: true }, // "HH:MM AM/PM"

  repeat: {
    type: String,
    enum: ["None", "Daily", "Weekly", "Monthly", "Every 3 Days", "Custom Weekly"],
    default: "None",
  },

  repeatDays: {
    type: [Number], // 0=Sun, 1=Mon... for "Custom Weekly"
    default: [],
  },

  snoozedUntil: { type: String, default: null }, // "YYYY-MM-DD HH:MM"
  missed: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Reminder", reminderSchema);
 */

const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  message: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['medication', 'appointment', 'lab', 'checkup', 'custom'],
    default: 'custom',
  },
  remindAt: { 
    type: Date, 
    required: true 
  },
  isSent: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Reminder", reminderSchema);