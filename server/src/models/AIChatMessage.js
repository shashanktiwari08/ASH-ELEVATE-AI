const mongoose = require('mongoose');

const aiChatMessageSchema = new mongoose.Schema({
  businessId: { type: String, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  sessionId: { type: String, required: true },
  
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  
  context: {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' }
  },
  
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

module.exports = mongoose.model('AIChatMessage', aiChatMessageSchema);