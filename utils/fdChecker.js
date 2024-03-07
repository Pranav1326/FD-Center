const nodemailer = require('nodemailer');

const  User =  require('../models/User');
const Transaction = require('../models/Transaction');
const Fd = require('../models/Fd');
const Wallet = require('../models/Wallet');

const { fdMatured } = require('./email_templates/fdMatured');
const { transporterConfig } = require('./email_templates/transporterConfig');

// Nodemailer
let transporter = nodemailer.createTransport(transporterConfig());

exports.checkMaturedDeposits = async () => {
    const fds = await Fd.find({ status: "running" });
    // console.log(fds);
    const maturedFds = fds.map( async (fd) => {
        function isMature(currentDate, matureDate) {
            if(currentDate.getFullYear() === matureDate.getFullYear() && currentDate.getMonth() === matureDate.getMonth() && currentDate.getDate() === matureDate.getDate()){
                return true;
            }
            return false;
        }
        if(isMature(new Date(), new Date(fd.matureDate))){
            const updateFdStatus = await Fd.findOneAndUpdate(
                { _id: fd._id},
                {
                    $set: { status: "matured" },
                },
                { new: true }
            );
            updateFdStatus && console.log(updateFdStatus);
            await Wallet.findOne(
                { "user.userId": "fd.user.userId" },
                {
                    $inc: { money: updateFdStatus.maturityValue }
                },
                { new: true }
            );
            const user = await User.findOne({ _id: "fd.user.userId" });
            const newTransactionMatureFd = new Transaction({
                user: {
                    userId: user._id,
                    username: user.username
                },
                transaction: "mature fd",
                amount: updateFdStatus.maturityValue
            });
            newTransactionMatureFd.save();
            
            user && await transporter.sendMail(fdMatured(user.email, user.username));
        }
        else{
            return null;
        }
    });
}