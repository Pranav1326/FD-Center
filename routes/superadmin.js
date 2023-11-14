const router = require('express').Router();
const superAdminController = require('../controllers/superadmin');
const auth = require('../middlewares/auth');

// login
router.post('/signin', superAdminController.login);

// All Admins List
router.get('/admin/:adminId', auth, superAdminController.getSingleAdmin);

// Admin Requests
router.get('/adminrequests', auth, superAdminController.getAllAdminRequests);

// Approve Admin
router.post('/approveadmin', auth, superAdminController.approveAdmin);

// Reject Admin
router.post('/rejectadmin', auth, superAdminController.rejectAdmin);

// Disable Admin
router.post('/disableadmin', auth, superAdminController.disableAdmin);

// Enable Admin
router.post('/enableadmin', auth, superAdminController.enableAdmin);

// All Admins List
router.get('/adminlist', auth, superAdminController.allAdminList);

// Get All FDs
router.get('/getallfds', auth, superAdminController.getAllFds);

// Get All Users
router.get('/getallusers', auth, superAdminController.getAllUsers);

// Get All Transactions
router.get('/getalltransactions', auth, superAdminController.getAllTransactions);

module.exports = router;