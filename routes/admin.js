const router = require('express').Router();
const adminController = require('../controllers/admin');
const auth = require('../middlewares/auth');

// Register
router.post('/register', adminController.register
// #swagger.description = "Admin registration"
);

// Auth OTP & Admin Request
router.post('/signup/auth', adminController.requestForAdmin
// #swagger.description = "Otp authentication for admin and request generate for admin account"
);

// Login
router.post('/signin', adminController.login
// #swagger.description = "Admin login"
);

router.get('/getcenterdata', auth, adminController.getCenterData
// #swagger.description = "Get all data about fd and revenue"
);

// Get All FDs
router.get('/getallfds', auth, adminController.getAllFds
// #swagger.description = "Get all Fds"
);

// Create Rate
router.post('/rate/create', auth, adminController.createRate
// #swagger.description = "Create Rate"
);

// Update Rate
router.put('/rate/update/:rateId', auth, adminController.updateRate
// #swagger.description = "Update Rate"
);

// Delete Rate
router.delete('/rate/delete/:rateId', auth, adminController.deleteRate
// #swagger.description = "Delete Rate"
);

module.exports = router;