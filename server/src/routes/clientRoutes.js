const express = require('express');
const router = express.Router();
const { getClients, createClient, getClientById, updateClient, deleteClient } = require('../controllers/clientController');
const { protect } = require('../middleware/auth');

router.use(protect); // protect all client routes

router.get('/', getClients);
router.get('/:id', getClientById);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

module.exports = router;
