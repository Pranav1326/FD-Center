const router = require('express').Router();
const fdController = require('../controllers/fd');
const auth = require('../middlewares/auth');

// Create FD
router.post('/create', fdController.createFd);

// Get All FDs
router.get('/', fdController.getAllFds);

module.exports = router;