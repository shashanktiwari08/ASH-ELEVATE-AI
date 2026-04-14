const Client = require('../models/Client');
const Booking = require('../models/Booking');

exports.getClients = async (req, res) => {
    try {
        const clients = await Client.find({ businessId: req.user.businessId });
        const mappedClients = clients.map(c => ({
            ...c._doc,
            repeatCount: c.bookings ? c.bookings.length : 0
        }));
        res.json(mappedClients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getClientById = async (req, res) => {
    try {
        const client = await Client.findOne({ _id: req.params.id, businessId: req.user.businessId })
            .populate('bookings');
        if (client) {
            res.json(client);
        } else {
            res.status(404).json({ message: 'Client not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createClient = async (req, res) => {
    const { name, companyName, phone, email, address, gstNumber, notes } = req.body;
    try {
        const client = await Client.create({ 
            name, companyName, phone, email, address, gstNumber, notes, 
            businessId: req.user.businessId 
        });
        res.status(201).json(client);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateClient = async (req, res) => {
    try {
        const client = await Client.findOneAndUpdate(
            { _id: req.params.id, businessId: req.user.businessId }, 
            req.body, 
            { new: true }
        );
        if (client) {
            res.json(client);
        } else {
            res.status(404).json({ message: 'Client not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteClient = async (req, res) => {
    try {
        const client = await Client.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
        if (client) {
            res.json({ message: 'Client removed' });
        } else {
            res.status(404).json({ message: 'Client not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
