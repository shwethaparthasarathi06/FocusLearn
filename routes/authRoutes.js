const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureGuest, ensureAuthenticated } = require('../middleware/auth');

// Login
router.get('/login', ensureGuest, authController.getLogin);
router.post('/login', ensureGuest, authController.postLogin);

// Google Sign-In Endpoint
router.post('/google', ensureGuest, authController.googleAuth);

// Registration
router.get('/register', ensureGuest, authController.getRegister);
router.post('/register', ensureGuest, authController.postRegister);

// Logout
router.post('/logout', ensureAuthenticated, authController.postLogout);
router.get('/logout', ensureAuthenticated, authController.postLogout);

module.exports = router;
