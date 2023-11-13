const router = require('express').Router();
const superAdminController = require('../controllers/superadmin');
const auth = require('../middlewares/auth');

// login
router.post('/signin', auth, superAdminController.login);

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

module.exports = router;