const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  // Student Information (Optional)
  studentId: {
    type: String,
    default: null
  },
  
  // Input Data (11 features)
  inputData: {
    term_mark_avg: { type: Number, required: true },
    prev_term_mark_avg: { type: Number, required: true },
    daily_study: { type: Number, required: true },
    prefer_study: { type: Number, required: true },
    travel_time: { type: Number, required: true },
    financial_status: { type: Number, required: true },
    social_media: { type: Number, required: true },
    sleep_hours: { type: Number, required: true },
    attendance: { type: Number, required: true },
    tuition_hours_per_week: { type: Number, required: true },
    disaster_impact: { type: Number, required: true }
  },
  
  // Prediction Results
  stressLevel: {
    type: String,
    enum: ['Good', 'Bad', 'Awful'],
    required: true
  },
  
  predictionCode: {
    type: Number,
    min: 0,
    max: 2,
    required: true
  },
  
  // AI Recommendations
  aiRecommendations: [{
    type: String
  }],
  
  aiPowered: {
    type: Boolean,
    default: false
  },
  
  // Main Causes (optional feature importance)
  mainCauses: [{
    feature: String,
    impact: Number
  }],
  
  // Metadata
  timestamp: {
    type: Date,
    default: Date.now
  },
  
  // Early Warning Flag
  earlyWarning: {
    isHighRisk: { type: Boolean, default: false },
    consecutiveHighRisk: { type: Number, default: 0 },
    lastHighRiskDate: { type: Date, default: null }
  },
  
  // Intervention Tracking
  interventionTaken: {
    type: Boolean,
    default: false
  },
  
  interventionNotes: {
    type: String,
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for faster queries
predictionSchema.index({ studentId: 1, timestamp: -1 });
predictionSchema.index({ stressLevel: 1, timestamp: -1 });

// Static methods for analytics
predictionSchema.statics.getStudentHistory = function(studentId, limit = 10) {
  return this.find({ studentId })
    .sort({ timestamp: -1 })
    .limit(limit);
};

predictionSchema.statics.getHighRiskStudents = function(days = 7) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  return this.find({
    stressLevel: { $in: ['Bad', 'Awful'] },
    timestamp: { $gte: dateThreshold }
  }).sort({ timestamp: -1 });
};

predictionSchema.statics.getEarlyWarningStudents = function() {
  return this.find({
    'earlyWarning.isHighRisk': true,
    'earlyWarning.consecutiveHighRisk': { $gte: 2 }
  }).sort({ 'earlyWarning.consecutiveHighRisk': -1 });
};

module.exports = mongoose.model('Prediction', predictionSchema);
