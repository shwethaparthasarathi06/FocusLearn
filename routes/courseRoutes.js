
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/', courseController.getAllCourses);
router.get('/:slug', courseController.getCourseDetails);
router.post('/:slug/redo', ensureAuthenticated, courseController.postStartRedoCourse);

module.exports = router;
