const Fd = require('../models/Fd');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const userAuth = require('../middlewares/userAuth');

// Create FD
exports.createFd = async (req, res) => {
    const authUser = await userAuth(req);
    if (authUser._id === req.body.user.userId) {
        try {
            const checkBalance = await Wallet.findOne({ "user.userId": req.body.user.userId });
            if (checkBalance.money >= req.body.amount) {
                const currentDate = new Date();
                const setDate = currentDate.setMonth(new Date().getMonth() + req.body.months);
                const newFd = new Fd({ ...req.body, matureDate: setDate });
                await newFd.save();
                const user = await User.findOne({ _id: req.body.user.userId });
                const updatedUser = await User.findOneAndUpdate({ _id: req.body.user.userId },
                    { Fd: [...user.Fd, newFd._id] },
                    { new: true }
                );
                const updateWallet = await Wallet.findOneAndUpdate({ "user.userId": req.body.user.userId },
                    { $inc: { money: -req.body.amount } },
                    { new: true }
                );
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

// Get All FDs
exports.getAllFds = async (req, res) => {
    try {
        const allFds = await Fd.find();
        allFds && res.status(200).json(allFds);
    } catch (error) {
        res.status(500);
        console.log(error);
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