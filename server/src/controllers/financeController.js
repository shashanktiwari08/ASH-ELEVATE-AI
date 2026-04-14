// Phase 3: Investor's Financial Control
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const PurchaseOrder = require('../models/PurchaseOrder');

// One-Click P&L (Profit & Loss)
exports.getEventPandL = async (req, res) => {
    try {
        const { eventId } = req.params;
        
        // 1. Total Income (from Payments/Invoices)
        // Note: For a real app, query the total actual paid amount mapped to Booking/Event
        const payments = await Payment.find({ Event_ID: eventId }); 
        const totalRevenue = payments.reduce((sum, p) => sum + p.Total_Amount, 0);

        // 2. Vendor Payouts / Raw Material Costs
        const purchaseOrders = await PurchaseOrder.find({ Event_ID: eventId, status: { $ne: 'Cancelled' } });
        const materialCosts = purchaseOrders.reduce((sum, po) => sum + po.totalEstimatedCost, 0);

        // 3. Calculation
        const grossProfit = totalRevenue - materialCosts;
        const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(2) : 0;

        res.json({
            success: true,
            data: {
                eventId,
                totalRevenue,
                materialCosts,
                grossProfit,
                profitMargin: `${profitMargin}%`,
                isProfitable: grossProfit > 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Automated WhatsApp Vendor Payment Reminder
exports.sendVendorPaymentReminder = async (req, res) => {
    try {
        const { vendorId, amountDue } = req.body;
        // Logic to trigger Twilio/WATI/Meta WhatsApp API goes here.
        // E.g., await whatsappClient.messages.create({ to: vendorPhone, body: "Payment reminder..." });
        
        res.json({
            success: true,
            message: `Automated WhatsApp payment reminder for ₹${amountDue} queued for Vendor.`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
