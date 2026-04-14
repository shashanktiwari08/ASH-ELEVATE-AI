const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  entityName: { type: String, required: true }, // e.g., 'Aerosky Hospitality'
  type: { type: String, enum: ['GST', 'NON_GST'], required: true },
  gstin: { type: String }, // Required if type is GST
  bankDetails: {
    bankName: String,
    accountNo: String,
    ifscCode: String
  },
  address: String,
  contactPhone: String,
  primaryEmail: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
