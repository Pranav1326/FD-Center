const router = require('express').Router();
const transactionController = require('../controllers/transaction');

router.post('/', transactionController.getTransactions
// #swagger.description = "Get all transactions"
);

module.exports = router;