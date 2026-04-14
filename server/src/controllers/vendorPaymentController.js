const VendorPayment = require('../models/VendorPayment');
const Vendor = require('../models/Vendor');
const { sendWhatsAppMessage, REMINDER_TEMPLATES } = require('./paymentReminderController');

exports.createVendorPayment = async (req, res) => {
  try {
    const { vendor, booking, event, amount, dueDate } = req.body;
    
    const payment = await VendorPayment.create({
      vendor,
      booking,
      event,
      amount,
      dueDate,
      businessId: req.user.businessId
    });
    
    await payment.populate('vendor booking');
    
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getVendorPayments = async (req, res) => {
  try {
    const payments = await VendorPayment.find({ businessId: req.user.businessId })
      .populate('vendor booking event')
      .sort({ dueDate: 1 });
    
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVendorPaymentById = async (req, res) => {
  try {
    const payment = await VendorPayment.findOne({ 
      _id: req.params.id, 
      businessId: req.user.businessId 
    }).populate('vendor booking event');
    
    if (payment) res.json(payment);
    else res.status(404).json({ message: 'Payment not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateVendorPayment = async (req, res) => {
  try {
    const payment = await VendorPayment.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      req.body,
      { new: true }
    ).populate('vendor');
    
    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.sendPaymentReminder = async (req, res) => {
  try {
    const payment = await VendorPayment.findOne({ 
      _id: req.params.id, 
      businessId: req.user.businessId 
    }).populate('vendor');
    
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    
    const message = REMINDER_TEMPLATES['THREE_DAYS_BEFORE'](
      payment.vendor.Name,
      payment.amount,
      payment.dueDate
    );
    
    const result = await sendWhatsAppMessage(payment.vendor.Phone_Number, message);
    
    payment.reminders.push({
      sentAt: new Date(),
      type: 'whatsapp',
      status: result.success ? 'sent' : 'failed',
      message
    });
    
    await payment.save();
    
    res.json({ success: result.success, payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markPaymentPaid = async (req, res) => {
  try {
    const { amountPaid, paymentDate } = req.body;
    
    const payment = await VendorPayment.findOne({ 
      _id: req.params.id, 
      businessId: req.user.businessId 
    }).populate('vendor');
    
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    
    payment.amountPaid = amountPaid || payment.amount;
    payment.paymentDate = paymentDate || new Date();
    payment.status = payment.amountPaid >= payment.amount ? 'paid' : 'partial';
    
    // Send confirmation message
    if (payment.status === 'paid') {
      const message = REMINDER_TEMPLATES['PAYMENT_CONFIRM'](
        payment.vendor.Name,
        payment.amountPaid
      );
      await sendWhatsAppMessage(payment.vendor.Phone_Number, message);
    }
    
    await payment.save();
    
    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};