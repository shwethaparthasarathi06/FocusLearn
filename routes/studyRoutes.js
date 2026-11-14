const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');
const { ensureAuthenticated } = require('../middleware/auth');

// All study timer routes require authentication
router.use(ensureAuthenticated);

router.get('/timer', studyController.getTimerPage);
router.get('/room/:moduleId', studyController.getStudyRoom);

// API endpoints for session tracking
router.post('/session/start', studyController.postStartSession);
router.post('/session/:id/pause', studyController.postPauseSession);
router.post('/session/:id/resume', studyController.postResumeSession);
router.post('/session/:id/break', studyController.postBreakSession);
router.post('/session/:id/extend', studyController.postExtendSession);
router.post('/session/:id/complete', studyController.postCompleteSession);
router.post('/session/:id/cancel', studyController.postCancelSession);
router.post('/session/cancel-active', studyController.postCancelActiveSession);
router.post('/module/:moduleId/complete', studyController.postCompleteModule);
router.post('/module/:moduleId/quiz-ready', studyController.postOpenModuleQuiz);
router.post('/course/:courseId/complete', studyController.postCompleteCourse);

module.exports = router;
