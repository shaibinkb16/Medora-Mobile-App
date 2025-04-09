const mongoose = require('mongoose');

const OCRResultSchema = new mongoose.Schema({
  recordId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Record', 
    required: true,
    index: true
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  extractedText: { 
    type: String, 
    required: true 
  },
  extractedMetrics: {
    bloodSugar: {
      type: Number,
      set: v => v !== null && v !== undefined ? v : null
    },
    bloodPressure: {
      type: String,
      set: v => v !== null && v !== undefined ? v : null
    },
    cholesterol: {
      type: Number,
      set: v => v !== null && v !== undefined ? v : null
    }
  }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

module.exports = mongoose.model('OCRResult', OCRResultSchema);