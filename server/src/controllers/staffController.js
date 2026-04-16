const Staff = require('../models/Staff');
const StaffDuty = require('../models/StaffDuty');

// Master Records
exports.getStaff = async (req, res) => {
    try {
        const staff = await Staff.find({ businessId: req.user.businessId }).sort({ name: 1 });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createStaff = async (req, res) => {
    try {
        const staff = await Staff.create({ ...req.body, businessId: req.user.businessId });
        res.status(201).json(staff);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getStaffById = async (req, res) => {
    try {
        const staff = await Staff.findOne({ _id: req.params.id, businessId: req.user.businessId });
        if (staff) res.json(staff);
        else res.status(404).json({ message: 'Staff not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateStaff = async (req, res) => {
    try {
        const staff = await Staff.findOneAndUpdate(
            { _id: req.params.id, businessId: req.user.businessId },
            req.body,
            { new: true }
        );
        if (staff) res.json(staff);
        else res.status(404).json({ message: 'Staff not found' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteStaff = async (req, res) => {
    try {
        const staff = await Staff.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
        if (staff) res.json({ message: 'Staff removed' });
        else res.status(404).json({ message: 'Staff not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Duty Assignments
exports.createDuty = async (req, res) => {
    try {
        const duty = await StaffDuty.create({ 
            ...req.body, 
            attendanceStatus: 'requested',
            verificationStatus: 'pending',
            businessId: req.user.businessId 
        });
        
        // Totals will be updated after verification by Admin
        res.status(201).json(duty);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getStaffDutyHistory = async (req, res) => {
    try {
        const duties = await StaffDuty.find({ staff: req.params.id, businessId: req.user.businessId })
            .populate('booking')
            .sort({ date: -1 });
        res.json(duties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDutyReportByDate = async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const filter = { businessId: req.user.businessId };
        if (startDate && endDate) {
            filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }
        const duties = await StaffDuty.find(filter)
            .populate('staff')
            .populate('booking')
            .sort({ date: -1 });
        res.json(duties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateDutyStatus = async (req, res) => {
    try {
        const duty = await StaffDuty.findOneAndUpdate(
            { _id: req.params.id, businessId: req.user.businessId }, 
            req.body, 
            { new: true }
        );
        res.json(duty);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.uploadAttendanceProof = async (req, res) => {
    try {
        const { photoUrl } = req.body;
        const duty = await StaffDuty.findOneAndUpdate(
            { _id: req.params.id, staff: req.user.id }, // Ensure it's for the logged in staff
            { 
                venuePhotoProof: photoUrl,
                verificationStatus: 'pending'
            },
            { new: true }
        );
        if (!duty) return res.status(404).json({ message: 'Duty not found or not assigned to you' });
        res.json(duty);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.verifyAttendance = async (req, res) => {
    try {
        const { status, attendanceStatus, rateApplied, overtimeAmount } = req.body; // status: verified/rejected
        const duty = await StaffDuty.findOne({ _id: req.params.id, businessId: req.user.businessId });
        if (!duty) return res.status(404).json({ message: 'Duty not found' });

        if (status === 'verified') {
            duty.adminVerified = true;
            duty.adminVerifiedBy = req.user._id;
            duty.adminVerifiedAt = new Date();
            duty.attendanceStatus = attendanceStatus || 'present';
            if (rateApplied) duty.rateApplied = rateApplied;
            if (overtimeAmount) duty.overtimeAmount = overtimeAmount;
            duty.totalAmount = Number(duty.rateApplied) + Number(duty.overtimeAmount);
        } else {
            duty.verificationStatus = 'rejected';
        }

        // Check if both are now verified
        if (duty.adminVerified && duty.clientVerified) {
            duty.verificationStatus = 'verified';
            
            // Update staff master totals ONLY when fully verified
            const Staff = require('../models/Staff');
            const staff = await Staff.findOne({ _id: duty.staff, businessId: req.user.businessId });
            if (staff) {
                staff.totalDaysWorked += 1;
                staff.totalEarnings += (duty.totalAmount || 0);
                staff.pendingBalance += ((duty.totalAmount || 0) - (duty.advanceAmount || 0));
                if (duty.booking) staff.totalEventsWorked += 1;
                await staff.save();
            }
        } else if (duty.adminVerified || duty.clientVerified) {
            duty.verificationStatus = 'half-verified';
        }
        
        await duty.save();
        res.json(duty);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.clientVerifyAttendance = async (req, res) => {
    try {
        const duty = await StaffDuty.findOne({ _id: req.params.id, businessId: req.user.businessId });
        if (!duty) return res.status(404).json({ message: 'Duty not found' });

        duty.clientVerified = true;
        duty.clientVerifiedAt = new Date();

        if (duty.adminVerified && duty.clientVerified) {
            duty.verificationStatus = 'verified';
            const Staff = require('../models/Staff');
            const staff = await Staff.findOne({ _id: duty.staff, businessId: req.user.businessId });
            if (staff) {
                staff.totalDaysWorked += 1;
                staff.totalEarnings += (duty.totalAmount || 0);
                staff.pendingBalance += ((duty.totalAmount || 0) - (duty.advanceAmount || 0));
                if (duty.booking) staff.totalEventsWorked += 1;
                await staff.save();
            }
        } else {
            duty.verificationStatus = 'half-verified';
        }

        await duty.save();
        res.json(duty);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getMyDuties = async (req, res) => {
    try {
        // req.user is the staff/service boy document if logged in via PIN
        const duties = await StaffDuty.find({ 
            staff: req.user._id,
            businessId: req.user.businessId 
        })
        .populate('booking')
        .sort({ date: -1 });
        res.json(duties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const PDFDocument = require('pdfkit');

exports.downloadDutyPDF = async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const duties = await StaffDuty.find({
            businessId: req.user.businessId,
            date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }).populate('staff').populate('booking');

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Staff_Work_Report_${startDate}.pdf`);
        doc.pipe(res);

        doc.fontSize(25).text('Staff Duty Registry Report', { align: 'center' });
        doc.fontSize(12).text(`Period: ${startDate} to ${endDate}`, { align: 'center' });
        doc.moveDown();

        duties.forEach((duty, index) => {
            doc.fontSize(14).text(`${index + 1}. Worker: ${duty.staff?.name} (${duty.staff?.serviceBoyId})`);
            doc.fontSize(11).text(`   Date: ${duty.date.toDateString()}`);
            doc.text(`   Event: ${duty.eventName || duty.booking?.title}`);
            doc.text(`   Location: ${duty.location}`);
            doc.text(`   Status: ${duty.attendanceStatus} | Amount: ₹${duty.totalAmount}`);
            doc.moveDown(0.5);
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStaffStatsSummary = async (req, res) => {
    try {
        const stats = await Staff.aggregate([
            { $match: { businessId: req.user.businessId } },
            {
                $group: {
                    _id: null,
                    totalPending: { $sum: '$pendingBalance' },
                    totalAdvance: { $sum: '$advancePaid' },
                    activeWorkers: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
                }
            }
        ]);

        const pendingDuties = await StaffDuty.countDocuments({ 
            businessId: req.user.businessId,
            verificationStatus: 'pending',
            venuePhotoProof: { $exists: true, $ne: null }
        });

        res.json({ 
            ...(stats[0] || { totalPending: 0, totalAdvance: 0, activeWorkers: 0 }),
            pendingVerifications: pendingDuties
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
