const Rate = require("../models/Rate");

// Get All Rates
exports.getAllRates = async (req, res) => {
    try {
        const rates = await Rate.find();
        rates && res.status(200).json(rates);
    } catch (error) {
        console.log(error);
        res.status(500);
    }
}