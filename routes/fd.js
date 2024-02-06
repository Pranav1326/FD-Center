const router = require('express').Router();
const fdController = require('../controllers/fd');
const auth = require('../middlewares/auth');

// Create FD
router.post('/create', auth, fdController.createFd
// #swagger.description = "Create an FD"
);

// Break FD
router.delete('/break', auth, fdController.breakFd
// #swagger.description = "Break an Fd"
);

// Get All FDs of Specific User
router.get('/:userId', auth, fdController.getAllFdsOfUser
// #swagger.description = "Get all Fds of a specific User"
);

module.exports = router;