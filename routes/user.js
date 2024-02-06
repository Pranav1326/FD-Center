const router = require('express').Router();
const userController = require('../controllers/user');
const auth = require('../middlewares/auth');

// Register
router.post('/signup', userController.register
// #swagger.description = "User Register and get otp on email"
);

// Register Auth OTP
router.post('/signup/auth', userController.varifyOtpRegister
// #swagger.description = "User otp verify"
);

// Login
router.post('/signin', userController.login
// #swagger.description = "User login"
);

// Update
router.put('/update/:id', auth, userController.updateUser
// #swagger.description = "User update"
);

// Delete
router.delete('/delete/:id', auth, userController.deleteUser
// #swagger.description = "Delete User"
);

// Get User Details
router.get('/:id', userController.getUser
// #swagger.description = "Single User details"
);

module.exports = router;