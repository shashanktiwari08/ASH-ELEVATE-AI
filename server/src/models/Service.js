const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  Service_Name: { type: String, required: true },
  Service_Type: { type: String, required: true },
  Price: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
