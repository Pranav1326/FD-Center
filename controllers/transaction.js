const Transaction = require("../models/Transaction");

exports.getTransactions = async (req, res) => {
    const userId = req.body.userId;
    try {
        const transactions = await Transaction.find({ "user.userId": userId });
        transactions && res.status(200).json(transactions);
    } catch (error) {
        console.log(error);
        res.status(500);
    }
}