const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');

router.get('/pnl/:eventId', financeController.getEventPandL);
router.post('/vendor/remind', financeController.sendVendorPaymentReminder);

module.exports = router;
