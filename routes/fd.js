const router = require('express').Router();
const fdController = require('../controllers/fd');
const auth = require('../middlewares/auth');

// Create FD
router.post('/create', auth, fdController.createFd);

// Break FD
router.delete('/break', auth, fdController.breakFd);

// Get All FDs of Specific User
router.get('/:userId', auth, fdController.getAllFdsOfUser);

module.exports = router;