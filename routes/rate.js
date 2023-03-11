const router = require('express').Router();
const rateController = require('../controllers/rate');

// Get All Rates
router.get('/', rateController.getAllRates);

module.exports = router;