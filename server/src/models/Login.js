const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
  User_Type: { type: String, enum: ['Client', 'Vendor', 'ServiceBoy', 'Admin'], required: true },
  Phone_Number: { type: String },
  Username: { type: String }, // For ServiceBoy (ASH001)
  OTP_Code: { type: String },
  OTP_Expiry: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Login', loginSchema);
