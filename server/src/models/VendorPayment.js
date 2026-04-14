const mongoose = require('mongoose');

const vendorPaymentSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  
  status: { 
    type: String, 
    enum: ['pending', 'partial', 'paid', 'overdue'], 
    default: 'pending' 
  },
  
  amountPaid: { type: Number, default: 0 },
  paymentDate: { type: Date },
  
  reminders: [{
    sentAt: { type: Date },
    type: { type: String, enum: ['whatsapp', 'sms', 'email'] },
    status: { type: String, enum: ['sent', 'failed', 'read'] },
    message: { type: String }
  }],
  
  businessId: { type: String, required: true }
}, { timestamps: true });

// Auto-check overdue status
vendorPaymentSchema.pre('save', function(next) {
  if (this.status === 'pending' && this.dueDate < new Date()) {
    this.status = 'overdue';
  }
  next();
});

module.exports = mongoose.model('VendorPayment', vendorPaymentSchema);