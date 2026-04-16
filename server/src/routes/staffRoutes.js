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
    getStaffStatsSummary,
    verifyAttendance,
    uploadAttendanceProof,
    getMyDuties,
    clientVerifyAttendance
} = require('../controllers/staffController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getStaff);
router.get('/report', getDutyReportByDate);
router.get('/stats/summary', getStaffStatsSummary);
router.get('/my-duties', getMyDuties);
router.get('/report/pdf', downloadDutyPDF);
router.get('/:id', getStaffById);
router.get('/:id/history', getStaffDutyHistory);
router.post('/', createStaff);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);
router.post('/duty', createDuty);
router.patch('/duty/:id', updateDutyStatus);
router.patch('/duty/:id/verify', verifyAttendance);
router.patch('/duty/:id/client-verify', clientVerifyAttendance);
router.patch('/duty/:id/upload-proof', uploadAttendanceProof);

module.exports = router;
