const Booking = require('../models/Booking');
const Client = require('../models/Client');
const Vendor = require('../models/Vendor');
const Staff = require('../models/Staff');
const Invoice = require('../models/Invoice');

exports.createBooking = async (req, res) => {
    const { clientId, title, eventDate, location, services, ingredients } = req.body;
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
            ingredients,
            totalAmount,
            businessId: req.user.businessId
        });
        
        client.bookings.push(booking._id);
        await client.save();
        
        booking.totalAmount = (totalAmount * 118) / 100; // Store total with 18% GST in booking
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
            .populate('invoice')
            .populate('services.vendor')
            .populate('services.staffAssigned');
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

exports.getClientBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ client: req.user._id, businessId: req.user.businessId })
            .populate('services.vendor')
            .populate('services.staffAssigned')
            .sort({ eventDate: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.reportPayment = async (req, res) => {
    try {
        const { bookingId, amount, method, screenshot, note } = req.body;
        const Payment = require('../models/Payment');
        
        const payment = await Payment.create({
            partyType: 'client',
            partyId: req.user._id,
            type: 'incoming',
            amount,
            method,
            screenshot,
            note,
            booking: bookingId,
            status: 'pending', 
            businessId: req.user.businessId
        });

        res.status(201).json(payment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
