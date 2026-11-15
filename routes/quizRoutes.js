const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const studentController = require('../controllers/studentController');
const { ensureAuthenticated } = require('../middleware/auth');

// All quiz operations require student authentication
router.use(ensureAuthenticated);

// Quiz Attempt History & Detailed Review
router.get('/history', studentController.getQuizHistory);
router.get('/history/:attemptId', studentController.getQuizHistoryDetail);

// Quiz Taking & Direct Submission
router.get('/:moduleId', quizController.getQuiz);
router.post('/:moduleId/submit', quizController.postSubmitQuiz);
router.get('/attempt/:attemptId/result', quizController.getQuizResult);
router.get('/attempt/:attemptId/review', studentController.getQuizHistoryDetail);

module.exports = router;
