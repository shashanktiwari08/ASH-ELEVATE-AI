const VendorPayment = require('../models/VendorPayment');
const Vendor = require('../models/Vendor');
const cron = require('node-cron');
const axios = require('axios');

// WhatsApp Message Templates
const REMINDER_TEMPLATES = {
  THREE_DAYS_BEFORE: (vendorName, amount, dueDate, eventName) => `
📢 *पेमेंट रिमाइंडर*
नमस्ते ${vendorName} जी,

आपका ₹${amount} का पेमेंट ${dueDate.toLocaleDateString('hi-IN')} को ड्यू है।
इवेंट: ${eventName || 'आपकी सर्विस'}

कृपया समय पर पेमेंट करें ताकि कोई रुकावट न आए।
धन्यवाद 🙏
- AEROSKY HOSPITALITY
  `,
  
  ONE_DAY_BEFORE: (vendorName, amount, dueDate) => `
⚠️ *अंतिम रिमाइंडर*
नमस्ते ${vendorName} जी,

आपका ₹${amount} का पेमेंट कल ${dueDate.toLocaleDateString('hi-IN')} को ड्यू है।
कृपया आज ही पेमेंट प्रोसेस करें।

धन्यवाद 🙏
  `,
  
  OVERDUE: (vendorName, amount, daysOverdue) => `
🔴 *पेमेंट बकाया*
नमस्ते ${vendorName} जी,

आपका ₹${amount} का पेमेंट ${daysOverdue} दिन से बकाया है।
कृपया जल्द से जल्द पेमेंट करें।

कोई प्रश्न हो तो कॉल करें: 8800878545
  `,
  
  PAYMENT_CONFIRM: (vendorName, amount) => `
✅ *पेमेंट कन्फर्म*
नमस्ते ${vendorName} जी,

आपका ₹${amount} का पेमेंट सफलतापूर्वक प्राप्त हो गया है।

धन्यवाद! आपका साथ हमें बहुत पसंद है 🙏
  `
};

// Send WhatsApp Message (using Twilio/WhatsApp Business API)
const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    // Clean phone number format
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    
    // For demo - in production use actual WhatsApp API
    console.log(`📱 Sending WhatsApp to ${formattedPhone}: ${message}`);
    
    // Example with Twilio (uncomment when credentials are available)
    // const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // const authToken = process.env.TWILIO_AUTH_TOKEN;
    // const client = require('twilio')(accountSid, authToken);
    // 
    // await client.messages.create({
    //   body: message,
    //   from: 'whatsapp:+14155238886',
    //   to: `whatsapp:+${formattedPhone}`
    // });
    
    return { success: true, phone: formattedPhone };
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return { success: false, error: error.message };
  }
};

// Check and send due payment reminders
const checkAndSendReminders = async () => {
  console.log('🔍 Checking vendor payments for reminders...');
  
  const today = new Date();
  const threeDaysLater = new Date(today);
  threeDaysLater.setDate(today.getDate() + 3);
  
  const oneDayLater = new Date(today);
  oneDayLater.setDate(today.getDate() + 1);

  try {
    // 3 Days Before Reminder
    const threeDayPayments = await VendorPayment.find({
      dueDate: { $gte: today, $lte: threeDaysLater },
      status: 'pending',
      'reminders.type': { $ne: 'whatsapp' },
      'reminders.sentAt': { $lt: new Date(today.getTime() - 24*60*60*1000) }
    }).populate('vendor booking event');

    for (const payment of threeDayPayments) {
      const vendor = payment.vendor;
      const message = REMINDER_TEMPLATES['THREE_DAYS_BEFORE'](
        vendor.Name, 
        payment.amount, 
        payment.dueDate,
        payment.event?.Event_Name
      );
      
      const result = await sendWhatsAppMessage(vendor.Phone_Number, message);
      
      payment.reminders.push({
        sentAt: new Date(),
        type: 'whatsapp',
        status: result.success ? 'sent' : 'failed',
        message
      });
      
      await payment.save();
      console.log(`✅ 3-day reminder sent to ${vendor.Name}`);
    }

    // 1 Day Before Reminder
    const oneDayPayments = await VendorPayment.find({
      dueDate: { $gte: today, $lte: oneDayLater },
      status: 'pending',
      'reminders.type': { $ne: 'whatsapp' }
    }).populate('vendor');

    for (const payment of oneDayPayments) {
      const message = REMINDER_TEMPLATES['ONE_DAY_BEFORE'](
        payment.vendor.Name, 
        payment.amount, 
        payment.dueDate
      );
      
      await sendWhatsAppMessage(payment.vendor.Phone_Number, message);
      
      payment.reminders.push({
        sentAt: new Date(),
        type: 'whatsapp',
        status: 'sent',
        message
      });
      
      await payment.save();
      console.log(`✅ 1-day reminder sent to ${payment.vendor.Name}`);
    }

    // Overdue Reminders
    const overduePayments = await VendorPayment.find({
      dueDate: { $lt: today },
      status: { $in: ['pending', 'overdue'] }
    }).populate('vendor');

    for (const payment of overduePayments) {
      const daysOverdue = Math.floor((today - payment.dueDate) / (1000 * 60 * 60 * 24));
      
      // Send reminder every 2 days for overdue
      const lastReminder = payment.reminders
        .filter(r => r.type === 'whatsapp')
        .sort((a, b) => b.sentAt - a.sentAt)[0];
      
      if (!lastReminder || (today - lastReminder.sentAt) > 48*60*60*1000) {
        const message = REMINDER_TEMPLATES['OVERDUE'](
          payment.vendor.Name, 
          payment.amount - payment.amountPaid, 
          daysOverdue
        );
        
        await sendWhatsAppMessage(payment.vendor.Phone_Number, message);
        
        payment.reminders.push({
          sentAt: new Date(),
          type: 'whatsapp',
          status: 'sent',
          message
        });
        
        payment.status = 'overdue';
        await payment.save();
        console.log(`✅ Overdue reminder sent to ${payment.vendor.Name} (${daysOverdue} days)`);
      }
    }

  } catch (error) {
    console.error('Error checking reminders:', error);
  }
};

// Initialize cron job - runs daily at 9 AM
const initReminderScheduler = () => {
  // Run daily at 9:00 AM
  cron.schedule('0 9 * * *', () => {
    checkAndSendReminders();
  });
  
  console.log('✅ Vendor payment reminder scheduler started');
  
  // Run once on startup for testing
  setTimeout(checkAndSendReminders, 5000);
};

module.exports = {
  sendWhatsAppMessage,
  checkAndSendReminders,
  initReminderScheduler,
  REMINDER_TEMPLATES
};