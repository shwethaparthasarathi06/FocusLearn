const express = require('express');
const router = express.Router();
const studentApiController = require('../controllers/api/studentApiController');
const { ensureAuthenticated } = require('../middleware/auth');

// Protect all student API endpoints with authentication
router.use(ensureAuthenticated);

// 1. Profile Endpoints
router.get('/profile', studentApiController.getProfile);
router.put('/profile', studentApiController.updateProfile);

// 2. Secure Password Change Endpoint
router.post('/change-password', studentApiController.changePassword);

// 3. Quiz Attempt History Endpoints
router.get('/quiz-history', studentApiController.getQuizHistory);
router.get('/quiz-attempts/:attemptId', studentApiController.getQuizAttemptDetail);

// 4. Performance Statistics Endpoint
router.get('/performance', studentApiController.getPerformance);

module.exports = router;
