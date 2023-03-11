const router = require('express').Router();
const walletController = require('../controllers/wallet');
const auth = require('../middlewares/auth');

// Desposit cash
router.post('/deposit', auth, walletController.deposit);

// Desposit cash
router.post('/withdraw', auth, walletController.withdraw);

// Get wallet details
router.get('/:userId', auth, walletController.walletDetails);

module.exports = router;