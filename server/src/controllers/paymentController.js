const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');

exports.createPayment = async (req, res) => {
    const { partyType, partyId, type, amount, method, bookingId, invoiceId, note } = req.body;
    try {
        const payment = await Payment.create({
            partyType,
            partyId,
            type,
            amount,
            method,
            booking: bookingId,
            invoice: invoiceId,
            note,
            createdBy: req.user._id,
            businessId: req.user.businessId
        });
        
        // Update Booking/Invoice status if applicable
        if (bookingId) {
            const booking = await Booking.findOne({ _id: bookingId, businessId: req.user.businessId });
            if (booking) {
                booking.amountPaid += Number(amount);
                if (booking.amountPaid >= booking.totalAmount) {
                    booking.paymentStatus = 'paid';
                } else if (booking.amountPaid > 0) {
                    booking.paymentStatus = 'partial';
                }
                await booking.save();
            }
        }
        
        if (invoiceId) {
            const invoice = await Invoice.findOne({ _id: invoiceId, businessId: req.user.businessId });
            if (invoice) {
                invoice.paymentHistory.push(payment._id);
                // Simple check for full payment
                if (payment.amount >= invoice.totalAmount) {
                    invoice.status = 'paid';
                } else {
                   invoice.status = 'unpaid'; // more logic needed for partials
                }
                await invoice.save();
            }
        }
        
        res.status(201).json(payment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ businessId: req.user.businessId })
            .populate('booking')
            .populate('invoice')
            .sort({ date: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTransactionsSummary = async (req, res) => {
    try {
        const stats = await Payment.aggregate([
            { $match: { businessId: req.user.businessId } },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' }
                }
            }
        ]);
        
        let revenue = 0;
        let expenses = 0;
        
        stats.forEach(s => {
            if (s._id === 'incoming') revenue = s.total;
            if (s._id === 'outgoing') expenses = s.total;
        });
        
        res.json({
            revenue,
            expenses,
            profit: revenue - expenses
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
