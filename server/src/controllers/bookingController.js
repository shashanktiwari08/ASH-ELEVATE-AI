const Booking = require('../models/Booking');
const Client = require('../models/Client');
const Vendor = require('../models/Vendor');
const Staff = require('../models/Staff');
const Invoice = require('../models/Invoice');

exports.createBooking = async (req, res) => {
    const { clientId, title, eventDate, location, services } = req.body;
    try {
        const client = await Client.findOne({ _id: clientId, businessId: req.user.businessId });
        if (!client) return res.status(404).json({ message: 'Client not found' });
        
        let totalAmount = 0;
        services.forEach(s => totalAmount += Number(s.amount));
        
        const booking = await Booking.create({
            client: clientId,
            title,
            eventDate,
            location,
            services,
            totalAmount,
            businessId: req.user.businessId
        });
        
        client.bookings.push(booking._id);
        await client.save();
        
        // Auto-generate invoice
        const invoiceCount = await Invoice.countDocuments({ businessId: req.user.businessId });
        const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(5, '0')}`;
        const gstAmount = (totalAmount * 18) / 100;
        const totalWithGst = totalAmount + gstAmount;

        const invoice = await Invoice.create({
            invoiceNumber,
            booking: booking._id,
            client: clientId,
            subTotal: totalAmount,
            gstAmount,
            totalAmount: totalWithGst,
            status: 'unpaid',
            businessId: req.user.businessId
        });
        
        booking.invoice = invoice._id;
        booking.totalAmount = totalWithGst; // Store total with GST in booking too for quick summary
        await booking.save();
        
        // Update Vendors and Staff assignments
        for (const service of services) {
            if (service.vendor) {
                await Vendor.findOneAndUpdate(
                    { _id: service.vendor, businessId: req.user.businessId }, 
                    { $push: { assignedWork: booking._id } }
                );
            }
            if (service.staffAssigned && service.staffAssigned.length > 0) {
                for (const staffId of service.staffAssigned) {
                    await Staff.findOneAndUpdate(
                        { _id: staffId, businessId: req.user.businessId }, 
                        { $push: { workedHistory: booking._id } }
                    );
                }
            }
        }
        
        const populatedBooking = await Booking.findOne({ _id: booking._id, businessId: req.user.businessId })
            .populate('client')
            .populate('invoice');
        
        res.status(201).json(populatedBooking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ businessId: req.user.businessId })
            .populate('client')
            .populate('invoice');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, businessId: req.user.businessId })
            .populate('client')
            .populate('invoice')
            .populate('services.vendor')
            .populate('services.staffAssigned');
        if (booking) res.json(booking);
        else res.status(404).json({ message: 'Booking not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, businessId: req.user.businessId }, 
            { status }, 
            { new: true }
        );
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBooking = async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, businessId: req.user.businessId },
            req.body,
            { new: true }
        );
        if (booking) res.json(booking);
        else res.status(404).json({ message: 'Booking not found' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
        if (booking) res.json({ message: 'Booking removed' });
        else res.status(404).json({ message: 'Booking not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
