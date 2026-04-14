const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  serviceType: { type: String, required: true },
  pin: { type: String }, // Auto-generated
  rating: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  businessId: { type: String, required: true, index: true },
  assignedWork: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }]
}, { timestamps: true });

vendorSchema.pre('save', async function() {
    if (!this.pin) {
        this.pin = Math.floor(1000 + Math.random() * 9000).toString();
    }
});

module.exports = mongoose.model('Vendor', vendorSchema);
