const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const SuperAdmin = require('../models/SuperAdmin');
const Admin = require('../models/Admin');
const AdminRequest = require('../models/AdminRequest');
const Fd = require('../models/Fd');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const userAuth = require('../middlewares/userAuth');

const Imap = require('imap');
const {simpleParser} = require('mailparser');
const { adminApproved } = require('../utils/email_templates/adminApproved');
const { adminRejected } = require('../utils/email_templates/adminRejected');
const { adminDisabled } = require('../utils/email_templates/adminDisabled');
const { adminEnabled } = require('../utils/email_templates/adminEnabled');
const { transporterConfig } = require('../utils/email_templates/transporterConfig');

const imapConfig = {
  user: process.env.GMAIL_ID,
  password: process.env.GMAIL_PASS,
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

// Nodemailer
let transporter = nodemailer.createTransport(transporterConfig());

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
                            let responseMail = await transporter.sendMail(adminApproved(doc.user.email, doc.user.username, updatedAdmin.username));
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
                            let responseMail = await transporter.sendMail(adminRejected(doc.user.email, doc.user.username));
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
                        let responseMail = await transporter.sendMail(adminDisabled(doc.email, doc.username));
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
                        let responseMail = await transporter.sendMail(adminEnabled(doc.email, doc.username));
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

// All Admins List
exports.allAdminList = async (req, res) => {
    try {
        const adminList = await Admin.find();
        doc && res.status(200).json(adminList);
    } catch (error) {
        console.log(error);
        res.status(500);
    }
}

// Get Single Admin
exports.getSingleAdmin = async (req, res) => {
    try {
        const admin = await Admin.findOne({ _id: req.params.adminId });
        admin && res.status(200).json(admin);
    } catch (error) {
        console.log(error);
        res.status(500);
    }
}

// Get All FDs
exports.getAllFds = async (req, res) => {
    try {
        const allFds = await Fd.find();
        allFds && res.status(200).json(allFds);
    } catch (error) {
        console.log(error);
        res.status(500);
    }
}

// Get All Users
exports.getAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find();
        allUsers && res.status(200).json(allUsers);
    } catch (error) {
        console.log(error);
        res.status(500);
    }
}

// Get All Transactions
exports.getAllTransactions = async (req, res) => {
    try {
        const allTransactions = await Transaction.find();
        allTransactions && res.status(200).json(allTransactions);
    } catch (error) {
        console.log(error);
        res.status(500);
    }
}

// emails
exports.getEmail = async (req, res) => {
    try {
        const getEmails = () => {
            try {
              const imap = new Imap(imapConfig);
              imap.once('ready', () => {
                imap.openBox('INBOX', false, () => {
                  imap.search(['UNSEEN', ['SINCE', new Date()]], (err, results) => {
                    const f = imap.fetch(results, {bodies: ''});
                    f.on('message', msg => {
                      msg.on('body', stream => {
                        simpleParser(stream, async (err, parsed) => {
                          // const {from, subject, textAsHtml, text} = parsed;
                          console.log(parsed);
                          /* Make API call to save the data
                             Save the retrieved data into a database.
                             E.t.c
                          */
                        });
                      });
                      msg.once('attributes', attrs => {
                        const {uid} = attrs;
                        imap.addFlags(uid, ['\\Seen'], () => {
                          // Mark the email as read after reading it
                          console.log('Marked as read!');
                        });
                      });
                    });
                    f.once('error', ex => {
                      return Promise.reject(ex);
                    });
                    f.once('end', () => {
                      console.log('Done fetching all messages!');
                      imap.end();
                      res.status(200).json("All Unseen mails fatched.");
                    });
                  });
                });
              });
          
              imap.once('error', err => {
                console.log(err);
              });
          
              imap.once('end', () => {
                console.log('Connection ended');
              });
          
              imap.connect();
            } catch (ex) {
              console.log('an error occurred');
            }
          };
          
          getEmails();
    } catch (error) {
        console.log(error);
        res.status(500);
    }
}