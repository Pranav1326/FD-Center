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

exports.getRate = async (req, res) => {
    const rateId = req.params.rateId;
    try {
        const rate = await Rate.findOne({ _id: rateId });
        rate && res.status(200).json(rate);
    } catch (error) {
        console.log(error);
        res.status(500);
    }
}