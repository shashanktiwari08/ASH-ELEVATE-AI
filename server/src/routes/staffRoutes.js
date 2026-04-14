const express = require('express');
const router = express.Router();
const { 
    getStaff, 
    createStaff, 
    getStaffById,
    updateStaff,
    deleteStaff,
    createDuty,
    getStaffDutyHistory,
    getDutyReportByDate,
    updateDutyStatus,
    downloadDutyPDF,
    getStaffStatsSummary
} = require('../controllers/staffController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getStaff);
router.get('/report', getDutyReportByDate);
router.get('/stats/summary', getStaffStatsSummary);
router.get('/report/pdf', downloadDutyPDF);
router.get('/:id', getStaffById);
router.get('/:id/history', getStaffDutyHistory);
router.post('/', createStaff);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);
router.post('/duty', createDuty);
router.patch('/duty/:id', updateDutyStatus);

module.exports = router;
