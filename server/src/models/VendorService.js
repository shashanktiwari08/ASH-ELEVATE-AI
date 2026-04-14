const mongoose = require('mongoose');

const vendorServiceSchema = new mongoose.Schema({
  Vendor_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  Service_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true }
}, { timestamps: true });

module.exports = mongoose.model('VendorService', vendorServiceSchema);
