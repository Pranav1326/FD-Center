const router = require('express').Router();
const fdController = require('../controllers/fd');

// Create FD
router.get('/create', fdController.createFd);

// Get All FDs
router.get('/', fdController.getAllFds);

module.exports = router;