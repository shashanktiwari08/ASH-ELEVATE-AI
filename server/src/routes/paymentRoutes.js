const express = require('express');
const router = express.Router();
const { createPayment, getPayments, getTransactionsSummary, getPendingPayments, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getPayments);
router.get('/pending', getPendingPayments);
router.get('/summary', getTransactionsSummary);
router.post('/', createPayment);
router.patch('/:id/verify', verifyPayment);

module.exports = router;
