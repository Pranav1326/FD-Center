const router = require('express').Router();
const userController = require('../controllers/user');

// Register
router.post('/signup', userController.register);

// Register Auth OTP
router.post('/signup/auth', userController.varifyOtpRegister);

// Login
router.post('/signin', userController.login);

module.exports = router;