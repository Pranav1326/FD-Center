const Fd = require('../models/Fd');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

// Create FD
exports.createFd = async (req, res) => {
    try {
        const checkBalance = await Wallet.findOne({ "user.userId": req.body.user.userId });
        if(checkBalance.money >= req.body.amount){
            const currentDate = new Date();
            const setDate = currentDate.setMonth(new Date().getMonth() + req.body.months);
            const newFd = new Fd({...req.body, matureDate: setDate});
            await newFd.save();
            const user = await User.findOne({ _id: req.body.user.userId });
            const updatedUser = await User.findOneAndUpdate({_id: req.body.user.userId},
                {Fd: [...user.Fd, newFd._id]},
                {new: true}
            );
            const updateWallet = await Wallet.findOneAndUpdate({ "user.userId": req.body.user.userId },
            {$inc: { money: -req.body.amount }},
            {new: true}
            );
            newFd && res.status(200).json(newFd);
        }
        else{
            res.status(400).json("Insufficient balance!");
        }
    } catch (error) {
        res.status(500);
        console.log(error);
    }
}

// Get All FDS
exports.getAllFds = async (req, res) => {
    try {
        const allFds = await Fd.find();
        allFds && res.status(200).json(allFds);
    } catch (error) {
        res.status(500);
        console.log(error);
    }
}