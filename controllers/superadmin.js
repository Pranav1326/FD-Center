const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const SuperAdmin = require('../models/SuperAdmin');
const Admin = require('../models/Admin');
const AdminRequest = require('../models/AdminRequest');
const userAuth = require('../middlewares/userAuth');

const bcrypt = require('bcrypt');

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

// Super Admin Login
exports.login = async (req, res) => {
    try {
        const superadmin = await SuperAdmin.findOne({ username: req.body.username });
        !superadmin && res.status(404).json("No User Found!");

        const validated = await bcrypt.compare(req.body.password, superadmin.password);
        !validated && res.status(400).json('Wrong credentials!');

        // Destructuring Admin object fatched from db
        const { password, ...adminInfo } = superadmin._doc;
        const token = jwt.sign(
            adminInfo,
            process.env.TOKEN_PASS,
            { expiresIn: '2h' }
        );

        token && res.status(200).json({ token });
    } catch (error) {
        console.log(error);
        res.status(500);
    }
}

// Get All the Requests for an Admin
exports.getAllAdminRequests = async (req, res) => {
    try {
        const authUser = await userAuth(req);
        if(authUser._id === process.env.SUPERADMIN_ID){
            const adminRequests = await AdminRequest.find();

            !adminRequests && res.status(404).json("No requests found!");
            adminRequests && res.status(200).json(adminRequests);
        }
        else{
            res.status(401).json("Not Authorized!");
        }
    } catch (error) {
        console.log(error);
        res.status(500);
    }
}

// Approve Admin Request
exports.approveAdmin = async (req, res) => {
    try {
        const authUser = await userAuth(req);
        if(authUser._id === process.env.SUPERADMIN_ID){
            await AdminRequest.findOne({ _id: req.body.requestId })
            .then(async (doc) => {
                if(doc && doc.status === "running"){
                    await AdminRequest.findOneAndUpdate(
                        { _id: req.body.requestId },
                        { status: "approved" },
                        { new: true },
                        )
                        .then(async (doc) => {
                            const salt = await bcrypt.genSalt(10);
                            const hashedPassword = await bcrypt.hash("Admin@fdcenter", salt);
                            const updatedAdmin = await Admin.findOneAndUpdate(
                                { _id: doc.user.userId },
                                {
                                    $set: { 
                                        username: "admin."+doc.user.username,
                                        password: hashedPassword,
                                        active: true,
                                        adminStatus: "permanent"
                                    }
                                },
                                { new: true }
                            );
                            await updatedAdmin.save();
                            // E-mail goes to Requested User
                            let responseMail = await transporter.sendMail({
                                from: 'fdcenter.mernstack@gmail.com',
                                to: `${doc.user.email}`,
                                subject: "Response for Admin Request in FD Center",
                                html: `
                                    <p>Hello ${doc.user.username},</p>
                                    <br/>
                                    <p>Congratulations! Your request to become an Admin at FD Center has been approved by the FD Center team. You now have access to the FD Center system.</p>
                                    <p><strong>Admin Details:</strong></p>
                                    <ul>
                                        <li>Username: ${updatedAdmin.username}</li>
                                        <li>Email: ${"Admin@fdcenter"}</li>
                                    </ul>
                                    <br/>
                                    <p>As an Admin, it is now your responsibility to manage interest rates and ensure a positive user experience for FD Center users.</p>
                                    <br/>
                                    <p>If you have any questions or concerns, please don't hesitate to reach out to fdcenter.mernstack@gmail.com.</p>
                                    <br/>
                                    <p>Regards</p>
                                    <p><strong>Team FD-Center</strong></p>
                                `
                            });
                            (doc && responseMail) && res.status(200).json("Request Approved!");
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json("Something went Wrong!");
                        });
                }
                else{
                    res.status(400).json("Cannot change the Response!");
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json("Something went Wrong!");
            });
        }
        else{
            res.status(401).json("Not Authorized!");
        }
    } catch (error) {
        console.log(error);
        res.status(500);
    }
}

// Reject Admin Request
exports.rejectAdmin = async (req, res) => {
    try {
        const authUser = await userAuth(req);
        if(authUser._id === process.env.SUPERADMIN_ID){
            await AdminRequest.findOne({ _id: req.body.requestId })
            .then(async (doc) => {
                if(doc && doc.status === "running"){
                    await AdminRequest.findOneAndUpdate(
                        { _id: req.body.requestId },
                        { status: "rejected" },
                        { new: true },
                        )
                        .then(async (doc) => {
                            // E-mail goes to Requested User
                            let responseMail = await transporter.sendMail({
                                from: 'fdcenter.mernstack@gmail.com',
                                to: `${doc.user.email}`,
                                subject: "Response for Admin Request in FD Center",
                                html: `
                                    <p>Hello ${doc.user.username},</p>
                                    <br/>
                                    <p>We regret to inform you that your request to become an Admin at FD Center has been rejected by the FD Center team.</p>
                                    <br/>
                                    <p>If you have any questions or concerns regarding the rejection, please feel free to reach out to fdcenter.mernstack@gmail.com.</p>
                                    <br/>
                                    <p>Best Regards,</p>
                                    <p><strong>Team FD-Center</strong></p>                                
                                `
                            });
                            (doc && responseMail) && res.status(200).json("Request Rejected!");
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json("Something went Wrong!");
                        });
                }
                else{
                    res.status(400).json("Cannot change the Response!");
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json("Something went Wrong!");
            });
        }
        else{
            res.status(401).json("Not Authorized!");
        }
    } catch (error) {
        console.log(error);
        res.status(500);
    }
}

// Disable Admin
exports.disableAdmin = async (req, res) => {
    try {
        const authUser = await userAuth(req);
        if(authUser._id === process.env.SUPERADMIN_ID){
            await Admin.findOne({ _id: req.body.adminId })
            .then(async (doc) => {
                if(doc.adminStatus === "temporary"){
                    res.status(400).json("Admin is not Approved!");
                }
                else if(doc.active === true){
                    await Admin.findOneAndUpdate(
                        { _id: req.body.adminId },
                        { active: false },
                        { new: true }
                    )
                    .then(async (doc) => {
                        let responseMail = await transporter.sendMail({
                            from: 'fdcenter.mernstack@gmail.com',
                            to: `${doc.email}`,
                            subject: "Admin account deactivaiton in FD Center",
                            html: `
                                <p>Hello ${doc.username},</p>
                                <br/>
                                <p>This is to inform you that you account in FD Center as an Admin has been Disabled by Superadmin.</p>
                                <br/>
                                <p>If you have any questions or concerns regarding the rejection, please feel free to reach out to fdcenter.mernstack@gmail.com.</p>
                                <br/>
                                <p>Regards,</p>
                                <p><strong>Team FD-Center</strong></p>                                
                            `
                        });
                        (doc && responseMail) && res.status(200).json(`Admin ${doc.username} Disabled!`);
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json("Error finding Admin!");
                    });
                }
                else{
                    res.status(400).json("Admin is already disabled!");
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json("Something went wrong!");
            });
        }
        else{
            res.status(401).json("Not Authorized!");
        }
    } catch (error) {
        console.log(error);
        res.status(500);
    }
}

// Enable Admin
exports.enableAdmin = async (req, res) => {
    try {
        const authUser = await userAuth(req);
        if(authUser._id === process.env.SUPERADMIN_ID){
            await Admin.findOne({ _id: req.body.adminId })
            .then(async (doc) => {
                if(doc.adminStatus === "temporary"){
                    res.status(400).json("Admin is not Approved!");
                }
                else if(doc.active === false){
                    await Admin.findOneAndUpdate(
                        { _id: req.body.adminId },
                        { active: true },
                        { new: true }
                    )
                    .then(async (doc) => {
                        let responseMail = await transporter.sendMail({
                            from: 'fdcenter.mernstack@gmail.com',
                            to: `${doc.email}`,
                            subject: "Admin account reactivaiton in FD Center",
                            html: `
                                <p>Hello ${doc.username},</p>
                                <br/>
                                <p>This is to inform you that you account in FD Center as an Admin has been Enabled by Superadmin.</p>
                                <br/>
                                <p>If you have any questions or concerns regarding the rejection, please feel free to reach out to fdcenter.mernstack@gmail.com.</p>
                                <br/>
                                <p>Regards,</p>
                                <p><strong>Team FD-Center</strong></p>                                
                            `
                        });
                        (doc && responseMail) && res.status(200).json(`Admin ${doc.username} Enabled!`);
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json("Error finding Admin!");
                    });
                }
                else{
                    res.status(400).json("Admin is already enabled!");
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json("Something went wrong!");
            });
        }
        else{
            res.status(401).json("Not Authorized!");
        }
    } catch (error) {
        console.log(error);
        res.status(500);
    }
}