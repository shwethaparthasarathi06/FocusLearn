const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureGuest, ensureAuthenticated } = require('../middleware/auth');

router.get('/login', ensureGuest, authController.getLogin);
router.post('/login', ensureGuest, authController.postLogin);

router.get('/register', ensureGuest, authController.getRegister);
router.post('/register', ensureGuest, authController.postRegister);

router.post('/logout', ensureAuthenticated, authController.postLogout);
router.get('/logout', ensureAuthenticated, authController.postLogout);

module.exports = router;
