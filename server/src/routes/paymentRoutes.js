const express = require('express');
const router = express.Router();
const { createPayment, getPayments, getTransactionsSummary } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getPayments);
router.get('/summary', getTransactionsSummary);
router.post('/', createPayment);

module.exports = router;
