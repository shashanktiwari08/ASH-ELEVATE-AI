const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }, // Ties to GST or Non-GST
  itemName: { type: String, required: true }, // e.g., 'Paneer', 'Rice'
  category: { type: String, enum: ['Raw Material', 'Equipment', 'Decor', 'Other'] },
  unit: { type: String }, // KGs, Liters, Pieces
  currentStock: { type: Number, default: 0 },
  parLevel: { type: Number, default: 0 }, // Alert level for low stock
  costPerUnit: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
