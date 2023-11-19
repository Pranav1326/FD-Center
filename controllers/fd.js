const Fd = require('../models/Fd');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const userAuth = require('../middlewares/userAuth');
const Transaction = require('../models/Transaction');

// Create FD
exports.createFd = async (req, res) => {
    const authUser = await userAuth(req);
    const { amount, months, interest } = req.body;
    console.log(authUser)
    if (authUser.userInfo._id === req.body.user.userId) {
        try {
            const checkBalance = await Wallet.findOne({ "user.userId": req.body.user.userId });
            if (checkBalance.money >= amount) {
                const currentDate = new Date();
                const setDate = currentDate.setMonth(new Date().getMonth() + months);
                const maturityValue = ((amount*(months/12)*interest)/100) + amount;
                const newFd = new Fd({ ...req.body, matureDate: setDate, maturityValue: maturityValue });
                await newFd.save();
                const user = await User.findOne({ _id: req.body.user.userId });
                await User.findOneAndUpdate({ _id: req.body.user.userId },
                    { Fd: [...user.Fd, newFd._id] },
                    { new: true }
                );
                await Wallet.findOneAndUpdate({ "user.userId": req.body.user.userId },
                    { $inc: { money: -req.body.amount } },
                    { new: true }
                );
                const newTransaction = new Transaction({
                    user: checkBalance.user,
                    transaction: "create fd",
                    amount: amount
                });
                await newTransaction.save();
                newFd && res.status(200).json(newFd);
            }
            else {
                res.status(400).json("Insufficient balance!");
            }
        } catch (error) {
            res.status(500);
            console.log(error);
        }
    }
    else {
        res.status(401).json("Unauthorized!");
    }
}

// Break FD
exports.breakFd = async (req, res) => {
    const authUser = await userAuth(req);
    const fdId = req.body.fdId;
    if (authUser._id === req.body.user.userId) {
        try {
            const fd = await Fd.findOne({ _id: fdId });
            if(fd?.status === "running"){
                const updateWallet = await Wallet.findOneAndUpdate({ "user.userId": req.body.user.userId },
                    { $inc: { money: fd.amount } },
                    { new: true }
                );
                const updateFd = await Fd.findOneAndUpdate({ _id: fdId }, {status: "broken"}, {new: true});
                const newTransaction = new Transaction({
                    user: updateWallet.user,
                    transaction: "brake fd",
                    amount: fd.amount
                });
                await newTransaction.save();
                updateFd && res.status(200).json(updateFd);
            }
            else{
                res.status(400).json("FD is not active!");
            }
        } catch (error) {
            res.status(500);
            console.log(error);
        }
    }
    else {
        res.status(401).json("Unauthorized!");
    }
}

// Get All FDs of Specific User
exports.getAllFdsOfUser = async (req, res) => {
    const userId = req.params.userId;
    const authUser = await userAuth(req);
    if (authUser._id === userId) {
        try {
            const allFds = await Fd.find({ "user.userId": userId });
            allFds && res.status(200).json(allFds);
        } catch (error) {
            res.status(500);
            console.log(error);
        }
    }
    else {
        res.status(401).json("Unauthorized!");
    }
}