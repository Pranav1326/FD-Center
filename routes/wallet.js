const router = require('express').Router();
const walletController = require('../controllers/wallet');
const auth = require('../middlewares/auth');

// Desposit cash
router.post('/deposit', auth, walletController.deposit
// #swagger.description = "Cash deposit in wallet"
);

// Desposit cash
router.post('/withdraw', auth, walletController.withdraw
// #swagger.description = "Cash withdraw from wallet"
);

// Get wallet details
router.get('/:userId', auth, walletController.walletDetails
// #swagger.description = "Get wallet details of a specific User"
);

module.exports = router;