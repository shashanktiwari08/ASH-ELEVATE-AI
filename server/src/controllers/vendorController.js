const Vendor = require('../models/Vendor');

exports.getVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find({ businessId: req.user.businessId });
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createVendor = async (req, res) => {
    try {
        const vendor = await Vendor.create({ ...req.body, businessId: req.user.businessId });
        res.status(201).json(vendor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getVendorById = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ _id: req.params.id, businessId: req.user.businessId }).populate('assignedWork');
        if (vendor) res.json(vendor);
        else res.status(404).json({ message: 'Vendor not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findOneAndUpdate(
            { _id: req.params.id, businessId: req.user.businessId },
            req.body,
            { new: true }
        );
        if (vendor) res.json(vendor);
        else res.status(404).json({ message: 'Vendor not found' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
        if (vendor) res.json({ message: 'Vendor removed' });
        else res.status(404).json({ message: 'Vendor not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
