const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Wallet = require('../models/Wallet');
const dotenv = require('dotenv').config();
const userAuth = require('../middlewares/userAuth');
const Rate = require('../models/Rate');
const Fd = require('../models/Fd');
const SuperAdmin = require('../models/SuperAdmin');
const AdminRequest = require('../models/AdminRequest');

// Nodemailer
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "fdcenter.mernstack@gmail.com",
        pass: process.env.GMAIL_KEYPASS,
    },
});

var otp;
const generateOtp = () => {
    otptemp = Math.floor(Math.random() * 10000);
    if (otptemp.toString().length < 4) {
        generateOtp();
    }
    return otptemp;
}

// Request for an Admin
exports.requestForAdmin = async (req, res) => {
    try {
        const { username, email } = req.body;
        const isAdminExist = await Admin.findOne({ username });
        const adminWithSameEmail = await Admin.findOne({ email });
        const superAdmin = await SuperAdmin.findOne({ _id: process.env.SUPERADMIN_ID });
        if (adminWithSameEmail) {
            res.status(403).json("Email exists! Please provide different email.");
        }
        if (isAdminExist) {
            res.status(400).json("Admin already exist! Please Login.");
        }
        if (!adminWithSameEmail && !isAdminExist) {
            const newTempAdmin = new Admin({
                username: username,
                email: email,
                active: false,
                adminStatus: "temporary"
            });
            await newTempAdmin.save();

            const newAdminRequest = new AdminRequest({
                user: {
                    userId: newTempAdmin._id,
                    username: newTempAdmin.username,
                    email: newTempAdmin.email
                },
                status: "running"
            });
            await newAdminRequest.save();

            // E-mail goes to requested admin
            let mailToAdmin = await transporter.sendMail({
                from: 'fdcenter.mernstack@gmail.com',
                to: `${newTempAdmin.email}`,
                subject: "Request generated for Admin in FD Center",
                html: ` 
                    <p>Hello ${newTempAdmin.username},</p>

                    <p>We hope this message finds you well. A request has been generated for the role of an Administrator in FD-Center under the username <strong>${newTempAdmin.username}</strong>. Our system administrator will review and take necessary action on your request shortly. You will be notified through email once the process is completed.</p>
                    
                    <p><i>Please note that the verification process may take 2-3 business days. We appreciate your patience. If the process extends beyond this timeframe, feel free to submit another request.</i></p>
                    
                    <p>Thank you for your understanding.</p>
                    
                    <p>Best Regards,</p>
                    <p><strong>Team FD-Center</strong></p>
                    `
            });

            // E-mail goes to SuperAdmin
            let mailToSuperadmin = await transporter.sendMail({
                from: 'fdcenter.mernstack@gmail.com',
                to: `${superAdmin.email}`,
                subject: "Request generated for Admin in FD Center",
                html: `
                    <p>Hello ${superAdmin.username},</p> \n

                    <p>A request has been generated for an Admin role under following credentials</p>
                    <p>Username: <strong>${newTempAdmin.username}</strong></p>
                    <p>Email: <strong>${newTempAdmin.email}</strong></p>
                    
                    <p>Kindly verify the request on portal.</p>

                    <p><strong>FD-Center</strong></p>
                    `
            });
            !(mailToAdmin && mailToSuperadmin) && res.status(500).json("Could not send the mail!");
            (mailToAdmin && mailToSuperadmin) && res.status(200).json("Please check your mail.");
        }
    } catch (error) {
        res.status(500);
        console.log(error);
    }
}

// New Admin Registration
exports.register = async (req, res) => {
    try {
        const isAdminExist = await Admin.findOne({ username: req.body.username });
        const adminWithSameEmail = await Admin.findOne({ email: req.body.email });
        if (adminWithSameEmail) {
            res.status(403).json("Email exists! Please provide different email.");
        }
        if (isAdminExist) {
            res.status(400).json("Admin already exist! Please Login.");
        }
        if (!adminWithSameEmail && !isAdminExist) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            const newAdmin = new Admin({
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword
            });
            // const admin = await newAdmin.save();
            otp = generateOtp();
            let info = await transporter.sendMail({
                from: 'fdcenter.mernstack@gmail.com',
                to: `${req.body.email}`,
                subject: "Greeting from FD Center",
                html: `<p>Hello ${req.body.username},</p> \n<p>This is your one time password(otp) <strong>${otp}</strong></p><p>\nPlease do not share this otp to anyone.</p>`,
            });
            !info && res.status(500).json("Could not send the mail!");
            info && res.status(200).json("OTP sent to mail");
        }
    } catch (error) {
        res.status(500);
        console.log(error);
    }
}

// Register Auth OTP
exports.varifyOtpRegister = async (req, res) => {
    try {
        const adminOtp = Number(req.body.otp);
        if (adminOtp === otp) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            const newAdmin = new Admin({
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword
            });
            const admin = await newAdmin.save();
            res.status(200).json(`Admin ${req.body.username} created. Please Login.`);
        }
        else {
            res.status(400).json("Invalid OTP!");
        }
    } catch (error) {
        res.status(500).json(error);
        console.log(error);
    }
}

// Login
exports.login = async (req, res) => {
    try {
        const admin = await Admin.findOne({ username: req.body.username });
        !admin && res.status(404).json('Admin does not exist!');

        const validated = await bcrypt.compare(req.body.password, admin.password);
        !validated && res.status(400).json('Wrong credentials!');

        // Destructuring Admin object fatched from db
        const { password, ...adminInfo } = admin._doc;
        const token = jwt.sign(
            adminInfo,
            process.env.TOKEN_PASS
        );
        token && res.status(200).json({ token });
    } catch (error) {
        console.log(error);
        res.status(500);
    }
}

// Create Rate
exports.createRate = async (req, res) => {
    const authUser = await userAuth(req);
    if (authUser._id === req.body.userId) {
        try {
            const newRate = new Rate({
                interestRate: req.body.interestRate,
                months: req.body.months,
                for: req.body.for,
                createdBy: {
                    adminId: authUser._id,
                    admin: authUser.username
                }
            });
            await newRate.save();
            newRate && res.status(200).json(newRate);
        } catch (error) {
            console.log(error);
            res.status(500);
        }
    }
    else{
        res.status(401).json("Not Authorized!");
    }
}

// Update Rate
exports.updateRate = async (req, res) => {
    const authUser = await userAuth(req);
    if (authUser._id === req.body.userId && req.body.rateId === req.params.rateId) {
        try {
            const updatedRate = await Rate.findOneAndUpdate(
                {_id: req.params.rateId},
                {interestRate: req.body.interestRate},
                {new: true}    
            );
            updatedRate && res.status(200).json(updatedRate);
        } catch (error) {
            console.log(error);
            res.status(500);
        }
    }
    else{
        res.status(401).json("Not Authorized!");
    }
}

// Delete Rate
exports.deleteRate = async (req, res) => {
    const authUser = await userAuth(req);
    if (authUser._id === req.body.userId && req.body.rateId === req.params.rateId) {
        try {
            const rate = await Rate.findOne({_id: req.params.rateId});
            if(rate){
                const updatedRate = await Rate.findOneAndDelete(
                    {_id: req.params.rateId}
                );
                updatedRate && res.status(200).json("Rate Deleted!");
            }
            else{
                res.status(404).json("Record not found!");
            }
        } catch (error) {
            console.log(error);
            res.status(500);
        }
    }
    else{
        res.status(401).json("Not Authorized!");
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