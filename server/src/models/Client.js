const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyName: { type: String },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  gstNumber: { type: String },
  notes: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  pin: { type: String }, // Auto-generated
  businessId: { type: String, required: true, index: true },
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }]
}, { timestamps: true });

clientSchema.pre('save', async function() {
    if (!this.pin) {
        this.pin = Math.floor(1000 + Math.random() * 9000).toString();
    }
});

module.exports = mongoose.model('Client', clientSchema);
