const express = require('express');
const router = express.Router();
const { getInvoices, getInvoiceById, exportInvoicePDF } = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.get('/:id/pdf', exportInvoicePDF);

module.exports = router;
