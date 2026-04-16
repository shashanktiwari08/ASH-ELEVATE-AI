const mongoose = require('mongoose');

const staffDutySchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }, // Optional, can be catering, event, etc.
    
    // Manual details for flexible entry
    clientName: { type: String },
    eventName: { type: String },
    location: { type: String },
    
    reportingTime: { type: String },
    endTime: { type: String },
    
    attendanceStatus: { 
        type: String, 
        enum: ['requested', 'present', 'absent', 'half day', 'overtime'], 
        default: 'requested' 
    },
    
    venuePhotoProof: { type: String },
    
    adminVerified: { type: Boolean, default: false },
    adminVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminVerifiedAt: { type: Date },

    clientVerified: { type: Boolean, default: false },
    clientVerifiedAt: { type: Date },

    verificationStatus: { 
        type: String, 
        enum: ['pending', 'half-verified', 'verified', 'rejected'], 
        default: 'pending' 
    },
    
    rateApplied: { type: Number, default: 0 },
    overtimeAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'paid', 'advance paid'], 
        default: 'pending' 
    },
    
    advanceAmount: { type: Number, default: 0 },
    remainingBalance: { type: Number, default: 0 },
    
    supervisorName: { type: String },
    businessId: { type: String, required: true, index: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StaffDuty', staffDutySchema);
