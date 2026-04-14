const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    
    // AEROSKY HOSPITALITY Details (Configurable or static)
    companyName: { type: String, default: 'AEROSKY HOSPITALITY' },
    companyContact: { type: String, default: '8800878545' },
    companyEmail: { type: String, default: 'info.aeroskyhospitality@gmail.com' },
    companyAddress: { type: String, default: 'Kh. No. 55/6/1, Raj Nagar,\nPalam, South West Delhi - 110077' },
    companyGSTIN: { type: String, default: '07CXEPP0735N2Z3' },
    companyState: { type: String, default: 'DELHI' },
    companyStateCode: { type: String, default: '07' },

    // Invoice Specifics
    issueDate: { type: Date, default: Date.now },
    
    // Buyer Info (Can override Client model defaults if needed)
    buyerName: { type: String, required: true },
    buyerAddress: { type: String, required: true },
    buyerGSTIN: { type: String },
    buyerState: { type: String },
    buyerStateCode: { type: String },

    // Function Details
    functionAddress: { type: String },
    dateOfSupply: { type: String }, // E.g., '10 & 11 AUGUST 2024'

    // Goods / Services Line Items
    items: [{
        description: { type: String, required: true }, // e.g., 'DAY HI-TEA & STARTERS 10 AUG. 2024'
        quantity: { type: String, required: true },     // e.g., '60 PAX'
        rate: { type: Number, required: true },         // e.g., 500
        amount: { type: Number, required: true }        // e.g., 30000
    }],

    // Tax Details
    totalAmountBeforeGST: { type: Number, required: true },
    cgstRate: { type: Number, default: 9 },
    sgstRate: { type: Number, default: 9 },
    igstRate: { type: Number, default: 0 },
    cgstAmount: { type: Number, default: 0 },
    sgstAmount: { type: Number, default: 0 },
    igstAmount: { type: Number, default: 0 },
    
    totalAmountWithGST: { type: Number, required: true },
    netPayableAmount: { type: Number, required: true }, // Usually rounded or same as totalAmountWithGST

    // Payment Info
    bankName: { type: String, default: 'Kotak Mahindra Bank' },
    ifscCode: { type: String, default: 'KKBK0004674' },
    accountNo: { type: String, default: '1548439888' },

    status: { type: String, enum: ['draft', 'sent', 'paid', 'unpaid', 'overdue'], default: 'unpaid' },
    businessId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
