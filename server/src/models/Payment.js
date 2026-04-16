const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  partyType: { type: String, enum: ['client', 'vendor', 'staff'] },
  partyId: { type: mongoose.Schema.Types.ObjectId, refPath: 'partyType' },
  type: { type: String, enum: ['incoming', 'outgoing'], required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['cash', 'upi', 'bank_transfer', 'card', 'cheque', 'online_banking'] },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  note: { type: String },
  screenshot: { type: String },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'verified' },
  date: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  businessId: { type: String, required: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
