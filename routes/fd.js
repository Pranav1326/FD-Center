const router = require('express').Router();
const fdController = require('../controllers/fd');
const auth = require('../middlewares/auth');

// Create FD
router.get('/create', auth, fdController.createFd);

// Get All FDs
router.get('/', auth, fdController.getAllFds);

module.exports = router;