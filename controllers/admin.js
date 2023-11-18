const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config();
const nodemailer = require('nodemailer');

const userAuth = require('../middlewares/userAuth');

const Admin = require('../models/Admin');
const Wallet = require('../models/Wallet');
const Rate = require('../models/Rate');
const Fd = require('../models/Fd');
const SuperAdmin = require('../models/SuperAdmin');
const AdminRequest = require('../models/AdminRequest');

const generateOtp = require('../utils/otpGenerator');

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

// Request for an Admin
exports.requestForAdmin = async (req, res) => {
    try {
        const { username, otp } = req.body;
        const newAdmin = await Admin.findOne({ username });
        const superAdmin = await SuperAdmin.findOne({ _id: process.env.SUPERADMIN_ID });
        if (otp === newAdmin.otp) {
            const newTempAdmin = await Admin.findOneAndUpdate(
                { _id: newAdmin._id },
                { 
                    $set: {
                        validated: true,
                        otp: null
                    }
                },
                { new: true }
            );

            const newAdminRequest = new AdminRequest({
                user: {
                    userId: newTempAdmin._id,
                    username: newTempAdmin.username,
                    email: newTempAdmin.email
                },
                status: "running"
            });
            await newAdminRequest.save();

            // E-mail goes to requested Admin
            let mailToAdmin = await transporter.sendMail({
                from: 'fdcenter.mernstack@gmail.com',
                to: `${newTempAdmin.email}`,
                subject: "Request generated for Admin in FD Center",
                html: ` 
                    <p>Hello ${newTempAdmin.username},</p>
                    <br/>
                    <p>We hope this message finds you well. A request has been generated for the role of an Administrator in FD-Center under the username <strong>${newTempAdmin.username}</strong>. Our system administrator will review and take necessary action on your request shortly. You will be notified through email once the process is completed.</p>
                    <br/>
                    <p><i>Please note that the verification process may take 2-3 business days. We appreciate your patience. If the process extends beyond this timeframe, feel free to submit another request.</i></p>
                    <br/>
                    <p>Thank you for your understanding.</p>
                    <br/>
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
        else{
            res.status(400).json("Invalid OTP!");
        }
    } catch (error) {
        res.status(500);
        console.log(error);
    }
}

// New Admin Registration
exports.register = async (req, res) => {
    try {
        const { username, email } = req.body;
        const isAdminExist = await Admin.findOne({ username });
        const adminWithSameEmail = await Admin.findOne({ email });
        if (adminWithSameEmail) {
            res.status(403).json("Email exists! Please provide different email.");
        }
        if (isAdminExist) {
            res.status(400).json("Admin already exist! Please Login.");
        }
        if (!adminWithSameEmail && !isAdminExist) {
            const newAdmin = new Admin({
                username: username,
                email: email,
                otp: generateOtp(),
                active: false,
                adminStatus: "temporary"
            });
            const admin = await newAdmin.save();
            let info = await transporter.sendMail({
                from: 'fdcenter.mernstack@gmail.com',
                to: `${newAdmin.email}`,
                subject: "Greeting from FD Center",
                html: `<p>Hello ${newAdmin.username},</p> \n<p>This is your one time password(otp) <strong>${newAdmin.otp}</strong></p><p>\nPlease do not share this otp to anyone.</p>`,
            });
            !info && res.status(500).json("Could not send the mail!");
            (admin && info) && res.status(200).json("OTP sent to mail");
        }
    } catch (error) {
        res.status(500);
        console.log(error);
    }
}

// Login
exports.login = async (req, res) => {
    try {
        const admin = await Admin.findOne({ username: req.body.username });
        !admin && res.status(404).json('Admin does not exist!');

        if(admin){
            if(!admin.validated){
                res.status(400).json("Please validate your account!");
            }
            if(admin.adminStatus !== "permanent"){
                res.status(400).json("Your account has not been activated yet!");
            }
            else{
                const validated = await bcrypt.compare(req.body.password, admin.password);
                !validated && res.status(400).json('Wrong credentials!');
                
                // Destructuring Admin object fatched from db
                const { password, ...adminInfo } = admin._doc;
                const token = jwt.sign(
                    adminInfo,
                    process.env.TOKEN_PASS
                );
                token && res.status(200).json({ token });
            }
        }
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