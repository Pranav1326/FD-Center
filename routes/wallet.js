const router = require('express').Router();
const walletController = require('../controllers/wallet');

// Desposit cash
router.post('/deposit', walletController.deposit);

// Get wallet details
router.get('/:userId', walletController.walletDetails);

module.exports = router;