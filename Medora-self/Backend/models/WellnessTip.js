const mongoose = require('mongoose');

const wellnessTipSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['nutrition', 'fitness', 'mental_health', 'preventive_care'],
    required: true 
  },
  tags: [{ 
    type: String 
  }],
  source: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('WellnessTip', wellnessTipSchema);