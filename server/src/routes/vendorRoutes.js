const express = require('express');
const router = express.Router();
const { getVendors, createVendor, getVendorById, updateVendor, deleteVendor } = require('../controllers/vendorController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getVendors);
router.get('/:id', getVendorById);
router.post('/', createVendor);
router.put('/:id', updateVendor);
router.delete('/:id', deleteVendor);

module.exports = router;
