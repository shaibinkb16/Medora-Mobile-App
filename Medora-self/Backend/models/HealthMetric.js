const mongoose = require('mongoose');

const healthMetricSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['blood_pressure', 'blood_sugar', 'weight', 'cholesterol'],
    required: true 
  },
  value: { 
    type: Number, 
    required: true 
  },
  unit: { 
    type: String, 
    required: true 
  },
  trend: { 
    type: String, 
    enum: ['up', 'down', 'stable'],
    default: 'stable'
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  previousValue: { 
    type: Number 
  }
});

module.exports = mongoose.model('HealthMetric', healthMetricSchema);