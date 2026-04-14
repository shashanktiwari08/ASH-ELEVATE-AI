const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  Company_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  Event_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }, // The event this list was generated for
  Vendor_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }, // Specific vendor if ordered
  
  // The items the AI calculated we need to buy
  procurementList: [{
    inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    quantityToBuy: { type: Number, required: true },
    unit: String,
    estimatedCost: Number
  }],
  
  status: { type: String, enum: ['Auto-Generated', 'Pending Approval', 'Ordered', 'Delivered'], default: 'Auto-Generated' },
  totalEstimatedCost: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
