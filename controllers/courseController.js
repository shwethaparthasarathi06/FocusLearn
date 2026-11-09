const Course = require('../models/Course');
const Module = require('../models/Module');
const StudentProgress = require('../models/StudentProgress');

/**
 * Get all courses
 */
exports.getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().sort({ order: 1 });

    const userProgress = {};
    if (req.session.userId) {
      const progressDocs = await StudentProgress.find({ userId: req.session.userId });
      progressDocs.forEach(p => {
        userProgress[p.courseId.toString()] = p;
      });
    }

    res.render('courses/index', {
      pageTitle: 'Our Courses - FocusLearn',
      currentPath: '/courses',
      courses,
      userProgress
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single course by slug
 */
exports.getCourseDetails = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const course = await Course.findOne({ slug });

    if (!course) {
      req.flash('error', 'Course not found.');
      return res.redirect('/courses');
    }

    const modules = await Module.find({ courseId: course._id }).sort({ moduleNumber: 1 });

    let progress = null;
    if (req.session.userId) {
      progress = await StudentProgress.findOne({
        userId: req.session.userId,
        courseId: course._id
      });
    }

    res.render('courses/details', {
      pageTitle: `${course.title} - FocusLearn`,
      currentPath: '/courses',
      course,
      modules,
      progress
    });
  } catch (err) {
    next(err);
  }
};
