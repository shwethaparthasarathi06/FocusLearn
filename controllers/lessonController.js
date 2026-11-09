const Module = require('../models/Module');
const Course = require('../models/Course');

/**
 * Render Lesson / Learning Module
 */
exports.getLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const moduleDoc = await Module.findById(id);

    if (!moduleDoc) {
      req.flash('error', 'Learning module not found.');
      return res.redirect('/courses');
    }

    const course = await Course.findById(moduleDoc.courseId);
    if (!course) {
      req.flash('error', 'Associated course not found.');
      return res.redirect('/courses');
    }

    // Find previous and next modules
    const prevModule = await Module.findOne({
      courseId: course._id,
      moduleNumber: moduleDoc.moduleNumber - 1
    });

    const nextModule = await Module.findOne({
      courseId: course._id,
      moduleNumber: moduleDoc.moduleNumber + 1
    });

    res.render('lessons/show', {
      pageTitle: `${moduleDoc.title} - ${course.title}`,
      currentPath: '/courses',
      course,
      moduleDoc,
      prevModule,
      nextModule
    });
  } catch (err) {
    next(err);
  }
};
