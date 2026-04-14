const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  Payment_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  Amount: { type: Number, required: true },
  Transaction_Type: { type: String, enum: ['Advance', 'Balance'], required: true },
  Date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
