const router = require('express').Router();
const userController = require('../controllers/user');
const auth = require('../middlewares/auth');

// Register
router.post('/signup', userController.register);

// Register Auth OTP
router.post('/signup/auth', userController.varifyOtpRegister);

// Login
router.post('/signin', userController.login);

// Update
router.put('/update/:id',auth , userController.updateUser);

// Delete
router.delete('/delete/:id',auth ,userController.deleteUser);

module.exports = router;