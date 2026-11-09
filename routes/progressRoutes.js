const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/', progressController.getProgress);

module.exports = router;
