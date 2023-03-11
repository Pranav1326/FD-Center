const router = require('express').Router();
const adminController = require('../controllers/admin');

// Register
router.post('/signup', adminController.register);

// Register Auth OTP
router.post('/signup/auth', adminController.varifyOtpRegister);

// Login
router.post('/signin', adminController.login);

module.exports = router;