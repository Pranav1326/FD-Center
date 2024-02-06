const router = require('express').Router();
const rateController = require('../controllers/rate');

// Get All Rates
router.get('/', rateController.getAllRates
// #swagger.description = "Get all Rates"
);

// Get All Rates for specific user
router.get('/:user', rateController.getAllRatesUser
// #swagger.description = "Get all Rates for a specific type of a user"
);

// Get Single Rate
router.get('/:rateId', rateController.getRate
// #swagger.description = "Get a single rate"
);

module.exports = router;