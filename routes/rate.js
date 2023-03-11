const router = require('express').Router();
const rateController = require('../controllers/rate');

// Get All Rates
router.get('/', rateController.getAllRates);

// Get Single Rate
router.get('/:rateId', rateController.getRate);

module.exports = router;