const router = require('express').Router();
const superAdminController = require('../controllers/superadmin');
const auth = require('../middlewares/auth');

// login
router.post('/signin', superAdminController.login
// #swagger.description = "SuperAdmin login"
);

// get mails
router.get('/getmails', superAdminController.getEmail
// #swagger.description = "Get emails from officaial email inbox"
);

// Single Admin Details
router.get('/admin/:adminId', auth, superAdminController.getSingleAdmin
// #swagger.description = "Get a single admin details"
);

// Admin Requests
router.get('/adminrequests', auth, superAdminController.getAllAdminRequests
// #swagger.description = "Get all admin requests list"
);

// Approve Admin
router.post('/approveadmin', auth, superAdminController.approveAdmin
// #swagger.description = "Approve for admin request"
);

// Reject Admin
router.post('/rejectadmin', auth, superAdminController.rejectAdmin
// #swagger.description = "Reject for admin request"
);

// Disable Admin
router.post('/disableadmin', auth, superAdminController.disableAdmin
// #swagger.description = "Disable an admin account"
);

// Enable Admin
router.post('/enableadmin', auth, superAdminController.enableAdmin
// #swagger.description = "Enable an admin account"
);

// All Admins List
router.get('/adminlist', auth, superAdminController.allAdminList
// #swagger.description = "Get all admins list"
);

// Get All FDs
router.get('/getallfds', auth, superAdminController.getAllFds
// #swagger.description = "Get all Fds list"
);

// Get All Users
router.get('/getallusers', auth, superAdminController.getAllUsers
// #swagger.description = "Get all Users list"
);

// Get All Transactions
router.get('/getalltransactions', auth, superAdminController.getAllTransactions
// #swagger.description = "Get all transactions list"
);

module.exports = router;