/* const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  familyMember: { type: String },
  category: {
    type: String,
    enum: ['Lab Report', 'Prescription', 'Doctor Note', 'Imaging', 'Medical Expense'],
    required: true,
  },
  labName: { type: String },
  description: { type: String },
  condition: { type: String },
  tags: [String],
  emergencyUse: { type: Boolean, default: false },
  imageUrl: { type: String },
  extractedMetrics: {
    bloodSugar: String,
    cholesterol: String,
    bloodPressure: String,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Record', RecordSchema); */



const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  familyMember: { type: String },
  category: {
    type: String,
    enum: ['Lab Report', 'Prescription', 'Doctor Note', 'Imaging', 'Medical Expense'],
    required: true,
  },
  labName: { type: String },
  description: { type: String, required: true },
  condition: { type: String },
  tags: [String],
  emergencyUse: { type: Boolean, default: false },
  imageUrl: { type: String },
  doctor: { type: String }, // New field for doctor
  extractedMetrics: {
    bloodSugar: String,
    cholesterol: String,
    bloodPressure: String,
  },
  createdAt: { type: Date, default: Date.now },
  flagged: { type: Boolean, default: false },

});

module.exports = mongoose.model('Record', RecordSchema);
