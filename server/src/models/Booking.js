const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  title: { type: String },
  eventDate: { type: Date },
  location: { type: String },
  services: [{
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    staffAssigned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }],
    serviceType: { type: String },
    amount: { type: Number }
  }],
  ingredients: [{
    name: { type: String },
    quantity: { type: String },
    cost: { type: Number }
  }],
  totalAmount: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  businessId: { type: String, required: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
