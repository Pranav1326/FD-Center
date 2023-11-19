const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv').config();

const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Fd = require('../models/Fd');
const userAuth = require('../middlewares/userAuth');

const generateOtp = require('../utils/otpGenerator');

const { testMail } = require('../utils/email_templates/testMail');
const { userOtp } = require('../utils/email_templates/userOtp');
const { greetingUser } = require('../utils/email_templates/greetingUser');

// Nodemailer
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_ID,
        pass: process.env.GMAIL_PASS,
    },
});

// New User Registration
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const isUserExist = await User.findOne({ username });
        const userWithSameEmail = await User.findOne({ email });
        if (userWithSameEmail) {
            res.status(403).json("Email exists! Please provide different email.");
        }
        if (isUserExist) {
            res.status(400).json("User already exist! Please Login.");
        }
        if (!userWithSameEmail && !isUserExist) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const newUser = new User({
                username: username,
                email: email,
                password: hashedPassword,
                otp: generateOtp()
            });
            const user = await newUser.save();
            let info = await transporter.sendMail(userOtp(newUser.email, newUser.username, newUser.otp));

            !info && res.status(500).json("Could not send the mail!");
            (user && info) && res.status(200).json("OTP sent to mail");
        }
    } catch (error) {
        res.status(500).json(error);
        console.log(error);
    }
}

// Register Auth OTP
exports.varifyOtpRegister = async (req, res) => {
    try {
        const { username, otp } = req.body;
        const newUser = await User.findOne({ username });
        if (otp === newUser.otp) {
            await User.findOneAndUpdate(
                { _id: newUser._id },
                {
                    $set: {
                        otp: null,
                        active: true
                    }
                },
                { new: true }
            );
            const newWallet = new Wallet({
                user: {
                    userId: newUser._id,
                    username: newUser.username
                }
            });
            await newWallet.save();
            let info = await transporter.sendMail(greetingUser(newUser.email, newUser.username));
            info && res.status(200).json(`User ${newUser.username} created. Please Login.`);
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
            if(!user.active){
                res.status(400).json("Please validate your account!");
            }
            else{
                const validated = await bcrypt.compare(req.body.password, user.password);
                !validated && res.status(400).json('Wrong credentials!');

                const walletDetails = await Wallet.findOne({ "user.userId": user._id });
                const FdDetails = await Fd.find({ "user.userId": user._id });
                const { password, ...userInfo } = user._doc;
                const token = jwt.sign(
                    { userInfo, walletDetails, FdDetails },
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