const express = require('express');
const router = express.Router();
const { 
    getBookings, 
    createBooking, 
    getBookingById, 
    updateBookingStatus, 
    updateBooking, 
    deleteBooking,
    getClientBookings,
    reportPayment
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);
router.patch('/:id/status', updateBookingStatus);
router.get('/client/my-bookings', getClientBookings);
router.post('/client/report-payment', reportPayment);

module.exports = router;
