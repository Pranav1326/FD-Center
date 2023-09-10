const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Fd = require('../models/Fd');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
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

// New User Registration
exports.register = async (req, res) => {
    try {
        const isUserExist = await User.findOne({ username: req.body.username });
        const userWithSameEmail = await User.findOne({ email: req.body.email });
        if (userWithSameEmail) {
            res.status(403).json("Email exists! Please provide different email.");
        }
        if (isUserExist) {
            res.status(400).json("User already exist! Please Login.");
        }
        if (!userWithSameEmail && !isUserExist) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword
            });
            // const user = await newUser.save();
            otp = generateOtp();
            let info = await transporter.sendMail({
                from: 'fdcenter.mernstack@gmail.com',
                to: `${req.body.email}`,
                subject: "OTP for Registration in FD Center",
                html: `<p>Hello ${req.body.username},</p> \n<p>This is your one time password(otp) <strong>${otp}</strong></p><p>\nPlease do not share this otp to anyone.</p>`,
            });
            !info && res.status(500).json("Could not send the mail!");
            info && res.status(200).json("OTP sent to mail");
        }
    } catch (error) {
        res.status(500).json(error);
        console.log(error);
    }
}

// Register Auth OTP
exports.varifyOtpRegister = async (req, res) => {
    try {
        const userOtp = Number(req.body.otp);
        if (userOtp === otp) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword
            });
            const newWallet = new Wallet({
                user: {
                    userId: newUser._id,
                    username: newUser.username
                }
            });
            const user = await newUser.save();
            await newWallet.save();
            let info = await transporter.sendMail({
                from: 'fdcenter.mernstack@gmail.com',
                to: `${req.body.email}`,
                subject: "Greeting from FD Center",
                html: `<div dir=3D"ltr">Hello <b>${req.body.username},</b><br><br>Hope you are doing well, Here are your credentials for sign in to <b>FD-Center</b><br><br>Username: <b>${req.body.username}</b><br>Password: <b>${req.body.password}</b><br><br>Please do not share these credentials to anyone.<br><br><p><i><b>Note:</b>This is a prototype website and does not involve any trancasction with real money. FD-Center will not responsible for any transaction that includes real money. The money and transactions shown in this website are totally virtual.</i></p><b>Happy Investing!<br></b><br>`,
            });
            res.status(200).json(`User ${req.body.username} created. Please Login.`);
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
        const user = await User.findOne({ username: req.body.username });
        !user && res.status(404).json('User does not exist!');

        if (user) {
            const validated = await bcrypt.compare(req.body.password, user.password);
            !validated && res.status(400).json('Wrong credentials!');

            // Destructuring user object fatched from db
            const walletDetails = await Wallet.findOne({ "user.userId": user._id });
            const FdDetails = await Fd.find({ "user.userId": user._id });
            const { password, ...userInfo } = user._doc;
            const token = jwt.sign(
                { userInfo, walletDetails, FdDetails },
                process.env.TOKEN_PASS
            );
            token && res.status(200).json({ token });
        }
    } catch (error) {
        console.log(error);
        res.status(500);
    }
}

// Update user
exports.updateUser = async (req, res) => {
    const authUser = await userAuth(req);
    if (authUser.userInfo._id === req.body.userId && req.body.userId === req.params.id) {
        try {
            const id = req.body.userId;
            const existingUser = await User.findOne({ _id: id });
            if (!existingUser) {
                res.status(404).json("User does not exist!");
            }
            else {
                const updatedUser = await User.findOneAndUpdate({ _id: id }, { $set: req.body }, { new: true });
                if (updatedUser) {
                    res.status(200).json(`User updated.`);
                }
                else {
                    res.status(500).json("Error updating user details.");
                }
            }
        } catch (error) {
            console.log(error);
            res.status(500);
        }
    }
    else {
        res.status(401).json(`You can update only your account!`);
    }
}

// Delete User
exports.deleteUser = async (req, res) => {
    const authUser = await userAuth(req);
    if (authUser.userInfo._id === req.body.userId && req.body.userId === req.params.id) {
        try {
            const id = req.body.userId;
            const existingUser = await User.findOne({ _id: id });
            if (!existingUser) {
                res.status(404).json("User does not exist!");
            }
            else {
                const foundUser = await User.findOneAndDelete({ _id: id });
                const wallet = await Wallet.findOneAndDelete({ "user.userId": foundUser._id });
                if (foundUser) {
                    res.status(200).json(`User ${foundUser.username} deleted!.`);
                }
                else {
                    res.status(500).json(`Error deleting user ${foundUser.username} details.`);
                }
            }
        } catch (err) {
            console.log(err);
            res.status(500);
        }
    }
    else {
        res.status(401).json(`You can Delete only your account!`);
    }
}

// Get User Details
exports.getUser = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findOne({ _id: userId });
        !user && res.status(404).json("User not found!");
        if (user) {
            const { password, __v, ...userInfo } = user._doc;
            res.status(200).json(userInfo);
        }
    } catch (error) {
        console.log(error);
    }
}