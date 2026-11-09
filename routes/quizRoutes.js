const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { ensureAuthenticated } = require('../middleware/auth');

// All quiz operations require student authentication
router.use(ensureAuthenticated);

router.get('/:moduleId', quizController.getQuiz);
router.post('/:moduleId/submit', quizController.postSubmitQuiz);
router.get('/attempt/:attemptId/result', quizController.getQuizResult);
router.get('/attempt/:attemptId/review', quizController.getQuizReview);

module.exports = router;
