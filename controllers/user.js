const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Wallet = require('../models/Wallet');
const dotenv = require('dotenv').config();

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
        if (isUserExist) {
            res.status(400).json("User already exist! Please Login.");
        }
        else {
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
                userId: newUser._id
            });
            const user = await newUser.save();
            await newWallet.save();
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
        const user = await User.findOne({username: req.body.username});
        !user && res.status(404).json('User does not exist!');

        const validated = await bcrypt.compare(req.body.password, user.password);
        !validated && res.status(400).json('Wrong credentials!');

        // Destructuring user object fatched from db
        const {password, ...userInfo} = user._doc;
        const token = jwt.sign(
            userInfo,
            "RANDOM-TOKEN"
        );
        res.status(200).json({token});
    } catch (error) {
        console.log(error);
        res.status(500);
    }
}

// Update user
exports.updateUser = async (req, res) => {
    try {
        const id = req.body.userId;
        const existingUser = await User.findOne({_id: id});
        if(!existingUser){
            res.status(404).json("User does not exist!");
        }
        else{
            const updatedUser = await User.findOneAndUpdate({_id: id}, {$set: req.body}, {new: true});
            if(updatedUser){
                res.status(200).json(`User updated.`);
            }
            else{
                res.status(500).json("Error updating user details.");
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500);
    }
}

// Delete User
exports.deleteUser = async (req, res) => {
    try{
        const id = req.body.userId;
        const existingUser = await User.findOne({_id: id});
        if(!existingUser){
            res.status(404).json("User does not exist!");
        }
        else{
            const foundUser = await User.findOneAndDelete({_id: id});
            const wallet = await Wallet.findOneAndDelete({userId: foundUser._id});
            if(foundUser){
                res.status(200).json(`User ${foundUser.username} deleted!.`);
            }
            else{
                res.status(500).json(`Error deleting user ${foundUser.username} details.`);
            }
        }
    } catch(err){
        console.log(err);
        res.status(500);
    }
}