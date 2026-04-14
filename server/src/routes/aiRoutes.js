const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
// const { protect, authorize } = require('../middlewares/auth');

// Note: Ensure auth & role middleware are used prior in a production environment
router.post('/scan-menu', aiController.processMenuDocument);
router.post('/auto-procurement', aiController.generateAutoProcurement);

// Exclusive AI Customer Chat Support
router.post('/chat', aiController.handleClientChat);
router.get('/chat/:businessId/:sessionId', aiController.getChatHistory);

module.exports = router;
