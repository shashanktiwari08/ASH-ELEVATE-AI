const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  Client_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  Company_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }, // The Dual Entity mapping
  Event_Type: { type: String, required: true },
  Event_Date: { type: Date, required: true },
  Location: { type: String, required: true },
  Total_Guests: { type: Number },
  
  // Real-Time Magic: Operational Status tracking
  Status: { 
    type: String, 
    enum: ['Upcoming', 'Team on Way', 'Reached Site', 'Prep Started', 'Service Live', 'Completed', 'Cancelled'], 
    default: 'Upcoming' 
  },
  
  statusTimeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    location: {
      lat: Number,
      lng: Number,
      address: String
    },
    notes: String
  }],
  
  // Digital SOP Check functionality for Staff
  staffChecklist: [{
    category: { type: String, enum: ['Cleanliness', 'Dress Code', 'Presentation', 'Setup', 'Safety'] },
    taskDetails: String, // e.g., "Dining Area Cleanup", "Staff Dress Code verified"
    isCompleted: { type: Boolean, default: false },
    photoProofUrl: String, // App will require photo upload to complete
    completedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    notes: String
  }],
  
  // Client Dashboard progress data
  progress: {
    percentage: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
    estimatedCompletion: Date
  },
  
  businessId: { type: String }
}, { timestamps: true });

// Auto calculate progress percentage based on status
eventSchema.pre('save', function(next) {
  const statusWeights = {
    'Upcoming': 0,
    'Team on Way': 20,
    'Reached Site': 40,
    'Prep Started': 60,
    'Service Live': 80,
    'Completed': 100,
    'Cancelled': 0
  };
  
  this.progress.percentage = statusWeights[this.Status] || 0;
  this.progress.lastUpdated = new Date();
  
  // Add to timeline if status changed
  if (this.isModified('Status')) {
    this.statusTimeline.push({
      status: this.Status
    });
  }
  
  next();
});

module.exports = mongoose.model('Event', eventSchema);
