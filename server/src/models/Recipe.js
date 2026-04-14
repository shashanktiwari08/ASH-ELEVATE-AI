const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  Company_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  dishName: { type: String, required: true }, // e.g., 'Shahi Paneer'
  servingSize: { type: Number, default: 1 }, // 1 portion basis
  
  // Mapping exactly how much of each inventory item is needed per portion
  ingredients: [{
    inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    quantityRequired: { type: Number, required: true }, // e.g., 0.2
    unit: { type: String, required: true } // e.g., 'KG'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);
