const Course = require('../models/Course');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const StudentProgress = require('../models/StudentProgress');
const StudyMaterial = require('../models/StudyMaterial');

// Convert YouTube URLs into embed URLs
function getYouTubeEmbedUrl(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');

    let videoId = '';

    if (host === 'youtu.be') {
      videoId = parsed.pathname.split('/')[1];
    } else if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'youtube-nocookie.com'
    ) {
      if (parsed.pathname === '/watch') {
        videoId = parsed.searchParams.get('v');
      } else {
        const match = parsed.pathname.match(/^\/(embed|shorts)\/([^/]+)/);
        if (match) {
          videoId = match[2];
        }
      }
    }

    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return null;
    }

    return `https://www.youtube.com/embed/${videoId}`;
  } catch (error) {
    return null;
  }
}

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

    // Get all quizzes for this course
    const quizzes = await Quiz.find({
      courseId: course._id
    });
    const quizzesByModule = {};
    quizzes.forEach(q => {
      quizzesByModule[q.moduleId.toString()] = q;
    });

    // Student Quiz Attempts and Best Scores
    const attemptsByModule = {};
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
        if (!attemptsByModule[key] || a.score > attemptsByModule[key].score) {
          attemptsByModule[key] = a;
        }
      });
    }

    // Get published study materials for this course
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
      attemptsByModule,
      progress,
      materials: displayMaterials
    });
  } catch (err) {
    console.error('Course details error:', err);
    next(err);
  }
};
