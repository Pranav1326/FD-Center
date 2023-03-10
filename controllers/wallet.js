const Wallet = require('../models/Wallet');
const userAuth = require('../middlewares/userAuth');

// Deposit
exports.deposit = async (req, res) => {
    const userId = req.body.userId;
    const depositAmount = req.body.deposit;
    const authUser = await userAuth(req);
    if (authUser._id === userId) {
        try {
            const checkWallet = await Wallet.findOne({ "user.userId": userId });
            if (checkWallet.money+depositAmount <= 10000000) {
                const updateWallet = await Wallet.updateOne({ "user.userId": userId }, {
                    $inc: { money: depositAmount }
                }).then(data => {
                    res.status(200).json("Money deposited");
                }).catch(err => {
                    res.status(500).json(err);
                });
            }
            else {
                res.status(400).json("Deposit amount shouldn't greater than 10000000 Bucks!");
            }
        } catch (error) {
            console.log(error);
        }
    }
    else {
        res.status(401).json(`You can only deposit in your account!`);
    }
}

// Withdrawl
exports.withdraw = async (req, res) => {
    const userId = req.body.userId;
    const withdrawlAmount = req.body.withdraw;
    const authUser = await userAuth(req);
    if (authUser._id === userId) {
        try {
            const checkWallet = await Wallet.findOne({ "user.userId": userId });
            if (checkWallet.money > 0 && (checkWallet.money-withdrawlAmount > 0)) {
                const updateWallet = await Wallet.updateOne({ "user.userId": userId }, {
                    $inc: { money: -withdrawlAmount }
                }).then(data => {
                    res.status(200).json("Money Withdrawl");
                }).catch(err => {
                    res.status(500).json(err);
                });
            }
            else {
                res.status(400).json("Insufficient balance!");
            }
        } catch (error) {
            console.log(error);
        }
    }
    else {
        res.status(401).json(`You can only withdraw from you account!`);
    }
}

// Get Wallet Details
exports.walletDetails = async (req, res) => {
    const userId = req.params.userId;
    const authUser = await userAuth(req);
    if (authUser._id === userId) {
        try {
            const foundWallet = await Wallet.findOne({ "user.userId": userId })
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
    else {
        res.status(401).json(`You can only view your account!`);
    }
}