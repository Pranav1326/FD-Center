const router = require('express').Router();
const walletController = require('../controllers/wallet');

// Desposit cash
router.post('/deposit', walletController.deposit);

// Desposit cash
router.post('/withdraw', walletController.withdraw);

// Get wallet details
router.get('/:userId', walletController.walletDetails);

module.exports = router;