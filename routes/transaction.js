const router = require('express').Router();
const transactionController = require('../controllers/transaction');

router.post('/', transactionController.getTransactions);

module.exports = router;