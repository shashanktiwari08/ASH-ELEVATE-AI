const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    serviceBoyId: { type: String, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    pin: { type: String }, // Auto-generated
    idProofDetails: { type: String },
    skillCategory: { 
        type: String, 
        enum: ['waiter', 'helper', 'cleaner', 'decorator helper', 'loader', 'kitchen helper'], 
        default: 'helper' 
    },
    rateType: { 
        type: String, 
        enum: ['per day', 'per event'], 
        default: 'per day' 
    },
    baseRate: { type: Number, required: true, default: 0 },
    overtimeRate: { type: Number, default: 0 },
    totalDaysWorked: { type: Number, default: 0 },
    totalEventsWorked: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    advancePaid: { type: Number, default: 0 },
    pendingBalance: { type: Number, default: 0 },
    businessId: { type: String, required: true, index: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

staffSchema.pre('save', async function() {
    if (!this.pin) {
        this.pin = Math.floor(1000 + Math.random() * 9000).toString();
    }
});

staffSchema.pre('save', async function() {
    if (!this.serviceBoyId) {
        const count = await this.constructor.countDocuments();
        this.serviceBoyId = `SB${String(count + 1).padStart(4, '0')}`;
    }
});

module.exports = mongoose.model('Staff', staffSchema);
