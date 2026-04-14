const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  ServiceBoy_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceBoy', required: true },
  Vendor_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  Event_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
