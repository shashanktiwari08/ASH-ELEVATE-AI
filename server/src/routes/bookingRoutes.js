const express = require('express');
const router = express.Router();
const { getBookings, createBooking, getBookingById, updateBookingStatus, updateBooking, deleteBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);
router.patch('/:id/status', updateBookingStatus);

module.exports = router;
