const Fd = require('../models/Fd');
const Wallet = require('../models/Wallet');

// Create FD
exports.createFd = async (req, res) => {
    try {
        const allFds = await Fd.find();
        allFds && res.status(200).json(allFds);
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