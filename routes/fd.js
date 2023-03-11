const router = require('express').Router();
const fdController = require('../controllers/fd');
const auth = require('../middlewares/auth');

// Create FD
router.post('/create', auth, fdController.createFd);

// Get All FDs of Specific User
router.get('/:userId', auth, fdController.getAllFdsOfUser);

// Get All FDs
router.get('/', auth, fdController.getAllFds);

module.exports = router;