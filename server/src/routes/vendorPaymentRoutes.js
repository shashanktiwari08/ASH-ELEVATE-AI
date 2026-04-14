const express = require('express');
const router = express.Router();
const { 
  createVendorPayment,
  getVendorPayments,
  getVendorPaymentById,
  updateVendorPayment,
  sendPaymentReminder,
  markPaymentPaid
} = require('../controllers/vendorPaymentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getVendorPayments);
router.get('/:id', getVendorPaymentById);
router.post('/', createVendorPayment);
router.patch('/:id', updateVendorPayment);
router.post('/:id/remind', sendPaymentReminder);
router.post('/:id/paid', markPaymentPaid);

module.exports = router;