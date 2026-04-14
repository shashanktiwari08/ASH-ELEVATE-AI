const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Phone_Number: { type: String, required: true, unique: true },
  Email: { type: String, required: true, unique: true },
  Role: { type: String, default: 'SuperAdmin' }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
