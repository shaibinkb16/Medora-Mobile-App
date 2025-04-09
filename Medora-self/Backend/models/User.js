const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  phoneNumber: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  profileImageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  googleId: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  expoPushToken: { type: String, default: null },

  // 🔐 Admin & Role Management
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },

  // 👑 Approval system for new admin requests
  requestedAsAdmin: {
    type: Boolean,
    default: false
  },

  isAdminVerified: {
    type: Boolean,
    default: false // Will be set to true when superadmin approves
  },

  status: {
    type: String,
    enum: ['active', 'pending', 'blocked'],
    default: 'active'
  },
  // In User model
activityLog: [{
  action: String,
  timestamp: { type: Date, default: Date.now },
  details: mongoose.Schema.Types.Mixed
}]
});

module.exports = mongoose.model('User', userSchema);
