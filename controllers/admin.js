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
const { userOtp } = require('../utils/email_templates/userOtp');
const { adminRequest } = require('../utils/email_templates/adminRequest');
const { requestToSuperadmin } = require('../utils/email_templates/requestToSuperadmin');
const { transporterConfig } = require('../utils/email_templates/transporterConfig');

// Nodemailer
const transporter = nodemailer.createTransport(transporterConfig());

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
            const mailToAdmin = await transporter.sendMail(adminRequest(newTempAdmin.email, newTempAdmin.username));

            // E-mail goes to SuperAdmin
            const mailToSuperadmin = await transporter.sendMail(requestToSuperadmin(superAdmin.email, superAdmin.username, newTempAdmin.username, newTempAdmin.email));
            
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
        else if (isAdminExist) {
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
            const info = await transporter.sendMail(userOtp(newAdmin.email, newAdmin.username, newAdmin.otp));
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
            else if(admin.adminStatus !== "permanent"){
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