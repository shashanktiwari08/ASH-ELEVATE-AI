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
            status: 'verified', // Admin created payments are auto-verified
            createdBy: req.user._id,
            businessId: req.user.businessId
        });
        
        // Update Booking status if applicable
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

        if (partyType === 'client') {
            // Generate Invoice Receipt for this verified payment
            const invoiceCount = await Invoice.countDocuments({ businessId: req.user.businessId });
            const invoiceNumber = `RCP-${String(invoiceCount + 1).padStart(5, '0')}`;
            const subTotal = (payment.amount / 1.18);
            const gstAmount = payment.amount - subTotal;

            const newInvoice = await Invoice.create({
                invoiceNumber,
                booking: bookingId,
                client: partyId,
                buyerName: 'Valued Client',
                buyerAddress: 'On File',
                totalAmountBeforeGST: subTotal,
                gstAmount,
                cgstAmount: gstAmount / 2,
                sgstAmount: gstAmount / 2,
                totalAmountWithGST: payment.amount,
                netPayableAmount: payment.amount,
                items: [{
                    description: `Payment Receipt for ${note || 'Event Services'}`,
                    quantity: '1',
                    rate: subTotal,
                    amount: subTotal
                }],
                status: 'paid',
                businessId: req.user.businessId
            });

            payment.invoice = newInvoice._id;
            await payment.save();
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
            { $match: { businessId: req.user.businessId, status: 'verified' } },
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

exports.getPendingPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ 
            businessId: req.user.businessId, 
            status: 'pending' 
        })
        .populate('booking')
        .sort({ date: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    const { status } = req.body; // 'verified' or 'rejected'
    try {
        const payment = await Payment.findOne({ 
            _id: req.params.id, 
            businessId: req.user.businessId 
        });
        
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        if (payment.status === 'verified') return res.status(400).json({ message: 'Payment already verified' });

        payment.status = status;
        if (status === 'verified') {
            // Update Totals only now
            if (payment.booking) {
                const booking = await Booking.findById(payment.booking);
                if (booking) {
                    booking.amountPaid += Number(payment.amount);
                    if (booking.amountPaid >= booking.totalAmount) {
                        booking.paymentStatus = 'paid';
                    } else if (booking.amountPaid > 0) {
                        booking.paymentStatus = 'partial';
                    }
                    await booking.save();
                }
            }
            
            if (payment.partyType === 'client') {
                // Generate Invoice Receipt for this verified payment
                const invoiceCount = await Invoice.countDocuments({ businessId: req.user.businessId });
                const invoiceNumber = `RCP-${String(invoiceCount + 1).padStart(5, '0')}`;
                const subTotal = (payment.amount / 1.18);
                const gstAmount = payment.amount - subTotal;

                const newInvoice = await Invoice.create({
                    invoiceNumber,
                    booking: payment.booking,
                    client: payment.partyId,
                    buyerName: 'Valued Client', // Default for receipts
                    buyerAddress: 'On File',
                    totalAmountBeforeGST: subTotal,
                    gstAmount,
                    cgstAmount: gstAmount / 2,
                    sgstAmount: gstAmount / 2,
                    totalAmountWithGST: payment.amount,
                    netPayableAmount: payment.amount,
                    items: [{
                        description: `Payment Receipt for ${payment.note || 'Event Services'}`,
                        quantity: '1',
                        rate: subTotal,
                        amount: subTotal
                    }],
                    status: 'paid',
                    businessId: req.user.businessId
                });

                payment.invoice = newInvoice._id;
            }
        }

        await payment.save();
        res.json(payment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
