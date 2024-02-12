const  User =  require('../models/User');

const nodemailer = require('nodemailer');

const Fd = require('../models/Fd');
const Wallet = require('../models/Wallet');
const { fdMatured } = require('./email_templates/fdMatured');
const { transporterConfig } = require('./email_templates/transporterConfig');

// Nodemailer
let transporter = nodemailer.createTransport(transporterConfig());

exports.checkMaturedDeposits = async () => {
    const fds = await Fd.find({ status: "running" });
    const maturedFds = fds.map( async (fd) => {
        if(new Date() > fd.matureDate){
            const updateFdStatus = Fd.findOneAndUpdate(
                { _id: fd._id},
                { status : "matured" },
                { new: true }
            );
            await Wallet.findOne(
                { "user.userId": "fd.user.userId" },
                {
                    $inc: { money: updateFdStatus.maturityValue }
                },
                { new: true }
            );
            const user = await User.findOne({ _id: "fd.user.userId" });
            user && await transporter.sendMail(fdMatured(user.email, user.username));
        }
        else{
            return null;
        }
    });
}