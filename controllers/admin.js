const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Wallet = require('../models/Wallet');
const dotenv = require('dotenv').config();
const userAuth = require('../middlewares/userAuth');

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

// New Admin Registration
exports.register = async (req, res) => {
    try {
        const isAdminExist = await Admin.findOne({ username: req.body.username });
        const adminWithSameEmail = await Admin.findOne({email: req.body.email });
        if(adminWithSameEmail){
            res.status(403).json("Email exists! Please provide different email.");
        }
        if (isAdminExist) {
            res.status(400).json("Admin already exist! Please Login.");
        }
        if(!adminWithSameEmail && !isAdminExist) {
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
        const admin = await Admin.findOne({username: req.body.username});
        !admin && res.status(404).json('Admin does not exist!');

        const validated = await bcrypt.compare(req.body.password, admin.password);
        !validated && res.status(400).json('Wrong credentials!');

        // Destructuring Admin object fatched from db
        const {password, ...adminInfo} = admin._doc;
        const token = jwt.sign(
            adminInfo,
            "RANDOM-TOKEN"
        );
        token && res.status(200).json({token});
    } catch (error) {
        console.log(error);
        res.status(500);
    }
}

