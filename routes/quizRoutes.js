
const express = require('express');
const router = express.Router();

const quizController = require('../controllers/quizController');
const studentController = require('../controllers/studentController');

const { ensureAuthenticated } = require('../middleware/auth');

// All quiz operations require authentication
router.use(ensureAuthenticated);

// Quiz history routes — keep these before /:moduleId
router.get('/history', studentController.getQuizHistory);
router.get('/history/:attemptId', studentController.getQuizHistoryDetail);

// Individual quiz attempt routes
router.get('/attempt/:attemptId/result', quizController.getQuizResult);
router.get('/attempt/:attemptId/review', quizController.getQuizReview);

// Quiz routes
router.get('/:moduleId', quizController.getQuiz);
router.post('/:moduleId/submit', quizController.postSubmitQuiz);

module.exports = router;
