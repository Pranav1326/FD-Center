const Wallet = require('../models/Wallet');

// Deposit
exports.deposit = async (req, res) => {
    const userId = req.body.userId;
    const depositAmount = req.body.deposit;
    try {
        const updateWallet = await Wallet.updateOne({userId}, {
            $inc: {money: depositAmount}
        }).then(data => {
            res.status(200).json("Money deposited");
        }).catch(err => {
            res.status(500).json(err);
        });
    } catch (error) {
        console.log(error);
    }
}

// Withdrawl
exports.withdraw = async (req, res) => {
    const userId = req.body.userId;
    const withdrawlAmount = req.body.withdraw;
    try {
        const updateWallet = await Wallet.updateOne({userId}, {
            $inc: {money: -withdrawlAmount}
        }).then(data => {
            res.status(200).json("Money Withdrawl");
        }).catch(err => {
            res.status(500).json(err);
        });
    } catch (error) {
        console.log(error);
    }
}

// Get Wallet Details
exports.walletDetails = async (req, res) => {
    const userId = req.params.userId;
    try {
        const foundWallet = await Wallet.findOne({"user.userId": userId})
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json(err);
        });
    } catch (error) {
        console.log(error);
    }
}