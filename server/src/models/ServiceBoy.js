const mongoose = require('mongoose');

const serviceBoySchema = new mongoose.Schema({
  ServiceBoy_ID: { type: String, unique: true },
  Name: { type: String, required: true },
  Phone_Number: { type: String, required: true },
  Assigned_Vendor_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  Assigned_Event_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  Login_Type: { type: String, enum: ['ID_PHONE', 'OTP'], default: 'ID_PHONE' }
}, { timestamps: true });

// Auto-generate ServiceBoy_ID (ASH001, ASH002, etc.)
serviceBoySchema.pre('save', async function (next) {
  if (this.isNew) {
    const lastBoy = await this.constructor.findOne({}, {}, { sort: { 'createdAt': -1 } });
    if (lastBoy && lastBoy.ServiceBoy_ID) {
      const lastIdNum = parseInt(lastBoy.ServiceBoy_ID.replace('ASH', ''), 10);
      const newIdNum = lastIdNum + 1;
      this.ServiceBoy_ID = 'ASH' + newIdNum.toString().padStart(3, '0');
    } else {
      this.ServiceBoy_ID = 'ASH001';
    }
  }
  next();
});

module.exports = mongoose.model('ServiceBoy', serviceBoySchema);
