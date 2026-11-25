const Course = require('../models/Course');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const StudentProgress = require('../models/StudentProgress');
const StudyMaterial = require('../models/StudyMaterial');
const { getYouTubeEmbedUrl } = require('../utils/materialHelper');

// Get all courses (Student Portal "All Courses" Page)
exports.getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().sort({ order: 1 }).lean();

    // Dynamically calculate actual module counts and duration
    const [moduleStats, quizCounts, allMaterials] = await Promise.all([
      Module.aggregate([
        {
          $group: {
            _id: '$courseId',
            count: { $sum: 1 },
            totalMinutes: { $sum: '$estimatedMinutes' }
          }
        }
      ]),
      Quiz.aggregate([
        {
          $group: {
            _id: '$courseId',
            count: { $sum: 1 }
          }
        }
      ]),
      StudyMaterial.find({ isPublished: true }).sort({ createdAt: -1 })
    ]);

    const moduleMap = {};
    moduleStats.forEach(m => {
      moduleMap[m._id.toString()] = { count: m.count, totalMinutes: m.totalMinutes };
    });

    const quizMap = {};
    quizCounts.forEach(q => {
      quizMap[q._id.toString()] = q.count;
    });

    const materialsByCourse = {};
    allMaterials.forEach(material => {
      const key = material.courseId.toString();
      if (!materialsByCourse[key]) materialsByCourse[key] = [];
      const item = material.toObject();
      if (item.materialType === 'Video') item.embedUrl = getYouTubeEmbedUrl(item.materialUrl);
      materialsByCourse[key].push(item);
    });

    courses.forEach(course => {
      const cid = course._id.toString();
      const mInfo = moduleMap[cid];
      if (mInfo) {
        course.lessonCount = mInfo.count;
        if (!course.durationHours || course.durationHours === 0) {
          course.durationHours = +(mInfo.totalMinutes / 60).toFixed(1);
        }
      }
      course.quizCount = quizMap[cid] || 0;
      course.publishedMaterials = materialsByCourse[cid] || [];
    });

    const userProgress = {};
    if (req.session.userId) {
      const progressDocs = await StudentProgress.find({
        userId: req.session.userId
      });
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

// Get single course details
exports.getCourseDetails = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({ slug });
    if (!course) {
      req.flash('error', 'Course not found.');
      return res.redirect('/courses');
    }

    // Get all modules for this course
    const modules = await Module.find({
      courseId: course._id
    }).sort({ moduleNumber: 1 });

    // Get all quizzes for this course, separated by type
    const quizzes = await Quiz.find({
      courseId: course._id
    });
    const quizzesByModule = {};
    const redoQuizzesByModule = {};
    quizzes.forEach(q => {
      const mid = q.moduleId.toString();
      if (q.quizType === 'redo') {
        redoQuizzesByModule[mid] = q;
      } else {
        quizzesByModule[mid] = q;
      }
    });

    // Student Quiz Attempts separated into Original vs Redo Attempts
    const attemptsByModule = {};
    const redoAttemptsByModule = {};
    let progress = null;

    if (req.session.userId) {
      const [attempts, progressDoc] = await Promise.all([
        QuizAttempt.find({
          userId: req.session.userId,
          courseId: course._id
        }).sort({ score: -1, createdAt: -1 }),
        StudentProgress.findOne({
          userId: req.session.userId,
          courseId: course._id
        })
      ]);

      progress = progressDoc;

      attempts.forEach(a => {
        const key = a.moduleId.toString();
        if (a.isRedoAttempt || a.quizType === 'redo') {
          if (!redoAttemptsByModule[key] || a.score > redoAttemptsByModule[key].score) {
            redoAttemptsByModule[key] = a;
          }
        } else {
          if (!attemptsByModule[key] || a.score > attemptsByModule[key].score) {
            attemptsByModule[key] = a;
          }
        }
      });
    }

    // Redo Status flags
    const redoCount = progress ? (progress.redoCount || 0) : 0;
    const maxRedoAllowed = progress ? (progress.maxRedoAllowed || 1) : 1;
    const isOriginalCompleted = Boolean(progress && progress.isCourseCompleted);
    const isRedoInProgress = Boolean(progress && progress.redoStatus === 'in-progress');
    const isRedoCompleted = Boolean(progress && (progress.redoStatus === 'completed' || redoCount >= maxRedoAllowed));
    const canRedo = Boolean(isOriginalCompleted && !isRedoCompleted && !isRedoInProgress && redoCount < maxRedoAllowed);

    // Get published study materials for this course (PDF, PPT, Video, Link, Text)
    const materials = await StudyMaterial.find({
      courseId: course._id,
      isPublished: true
    }).populate('moduleId').sort({ createdAt: -1 });

    const displayMaterials = materials.map(material => {
      const item = material.toObject();
      if (item.materialType === 'Video') {
        item.embedUrl = getYouTubeEmbedUrl(item.materialUrl);
      }
      return item;
    });

    res.render('courses/details', {
      pageTitle: `${course.title} - FocusLearn`,
      currentPath: '/courses',
      course,
      modules,
      quizzesByModule,
      redoQuizzesByModule,
      attemptsByModule,
      redoAttemptsByModule,
      progress,
      canRedo,
      isRedoInProgress,
      isRedoCompleted,
      redoCount,
      maxRedoAllowed,
      materials: displayMaterials
    });
  } catch (err) {
    console.error('Course details error:', err);
    next(err);
  }
};

// Start Course Redo Attempt (Allow Only Once)
exports.postStartRedoCourse = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userId = req.session.userId;

    if (!userId) {
      req.flash('error', 'Please log in to redo a course.');
      return res.redirect('/auth/login');
    }

    const course = await Course.findOne({ slug });
    if (!course) {
      req.flash('error', 'Course not found.');
      return res.redirect('/courses');
    }

    let progress = await StudentProgress.findOne({
      userId,
      courseId: course._id
    });

    // 1. Must have completed original course
    if (!progress || !progress.isCourseCompleted) {
      req.flash('error', 'You must complete all topics in the original course before you can redo it.');
      return res.redirect(`/courses/${course.slug}`);
    }

    // 2. Enforce 1-redo limit on backend
    const currentRedoCount = progress.redoCount || 0;
    const maxRedo = progress.maxRedoAllowed || 1;

    if (currentRedoCount >= maxRedo || progress.redoStatus === 'completed') {
      req.flash('error', `You have already used your ${maxRedo} permitted redo attempt for this course. Each course can only be redone once.`);
      return res.redirect(`/courses/${course.slug}`);
    }

    // 3. If already in-progress, inform student
    if (progress.redoStatus === 'in-progress') {
      req.flash('info', 'Your redo attempt for this course is already active! Review the topics and take the redo quizzes.');
      return res.redirect(`/courses/${course.slug}`);
    }

    // 4. Activate redo attempt
    progress.redoStatus = 'in-progress';
    progress.redoStartedAt = new Date();
    progress.completedRedoModules = [];
    progress.redoCompletionPercentage = 0;
    progress.isRedoCompleted = false;

    await progress.save();

    req.flash('success', 'Course Redo started successfully! You are now taking the Redo attempt with separate Redo quizzes.');
    res.redirect(`/courses/${course.slug}`);
  } catch (err) {
    console.error('Start course redo error:', err);
    next(err);
  }
};
