const router = require('express').Router();
const adminController = require('../controllers/admin');
const auth = require('../middlewares/auth');

// Register
router.post('/signup', adminController.register);

// Register Auth OTP
router.post('/signup/auth', adminController.varifyOtpRegister);

// Login
router.post('/signin', adminController.login);

// Get All FDs
router.get('/getallfds', auth, adminController.getAllFds);

// Create Rate
router.post('/rate/create', auth, adminController.createRate);

// Update Rate
router.put('/rate/update/:rateId', auth, adminController.updateRate);

// Delete Rate
router.delete('/rate/delete/:rateId', auth, adminController.deleteRate);

module.exports = router;