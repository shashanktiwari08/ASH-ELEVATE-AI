const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getMe, verifyLoginPIN } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);

// PIN Login endpoint
router.post('/verify-pin', verifyLoginPIN);

module.exports = router;
