const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');

router.get('/:id', lessonController.getLesson);

module.exports = router;
