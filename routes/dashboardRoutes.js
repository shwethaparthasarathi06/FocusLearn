const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const studentController = require('../controllers/studentController');
const { ensureAuthenticated } = require('../middleware/auth');

router.use(ensureAuthenticated);

// Student Workspace Dashboard
router.get('/', dashboardController.getDashboard);

// Student Profile Management
router.get('/profile', studentController.getProfile);
router.post('/profile', studentController.postUpdateProfile);

// Secure Password Change
router.get('/change-password', studentController.getChangePassword);
router.post('/change-password', studentController.postChangePassword);

// Performance & Previous Scores Dashboard
router.get('/performance', studentController.getPerformance);

module.exports = router;
