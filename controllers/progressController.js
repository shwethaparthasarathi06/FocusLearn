const Course = require('../models/Course');
const Module = require('../models/Module');
const StudySession = require('../models/StudySession');
const QuizAttempt = require('../models/QuizAttempt');
const StudentProgress = require('../models/StudentProgress');

/**
 * Render Student Progress Analytics Page
 */
exports.getProgress = async (req, res, next) => {
  try {
    const userId = req.session.userId;

    const courses = await Course.find().sort({ order: 1 });
    const progressDocs = await StudentProgress.find({ userId });
    const allQuizAttempts = await QuizAttempt.find({ userId }).sort({ createdAt: -1 });
    const allStudySessions = await StudySession.find({ userId, completed: true });

    const progressMap = {};
    progressDocs.forEach(p => {
      progressMap[p.courseId.toString()] = p;
    });

    let totalCompletedModules = 0;
    let totalModulesAllCourses = 0;
    let totalStudyTimeSeconds = 0;

    const courseProgressData = await Promise.all(
      courses.map(async course => {
        const totalModulesCount = await Module.countDocuments({ courseId: course._id });
        totalModulesAllCourses += totalModulesCount;

        const p = progressMap[course._id.toString()];
        const completedModulesCount = p ? p.completedModules.length : 0;
        totalCompletedModules += completedModulesCount;

        const completionPercentage = totalModulesCount > 0
          ? Math.round((completedModulesCount / totalModulesCount) * 100)
          : 0;

        // Study time for this specific course
        const courseSessions = allStudySessions.filter(
          s => s.courseId && s.courseId.toString() === course._id.toString()
        );
        const courseStudySeconds = courseSessions.reduce(
          (sum, s) => sum + (s.actualDurationSeconds || 0),
          0
        );
        totalStudyTimeSeconds += courseStudySeconds;

        const cHours = Math.floor(courseStudySeconds / 3600);
        const cMins = Math.floor((courseStudySeconds % 3600) / 60);
        const studyTimeFormatted = cHours > 0 ? `${cHours}h ${cMins}m` : `${cMins}m`;

        // Quiz metrics for this course
        const courseAttempts = allQuizAttempts.filter(
          a => a.courseId && a.courseId.toString() === course._id.toString()
        );
        const quizAttemptsCount = courseAttempts.length;
        const latestScore = quizAttemptsCount > 0 ? courseAttempts[0].score : null;
        const bestScore = quizAttemptsCount > 0
          ? Math.max(...courseAttempts.map(a => a.score))
          : null;

        return {
          course,
          totalModulesCount,
          completedModulesCount,
          completionPercentage,
          studyTimeFormatted,
          quizAttemptsCount,
          latestScore,
          bestScore,
          isCompleted: p ? p.isCourseCompleted : false
        };
      })
    );

    const overallCompletion = totalModulesAllCourses > 0
      ? Math.round((totalCompletedModules / totalModulesAllCourses) * 100)
      : 0;

    const totalHoursStudied = (totalStudyTimeSeconds / 3600).toFixed(1);
    const totalQuizzesPassed = allQuizAttempts.filter(a => a.passed).length;

    res.render('progress/index', {
      pageTitle: 'My Progress - FocusLearn',
      currentPath: '/progress',
      courseProgressData,
      overallCompletion,
      totalCompletedModules,
      totalModulesAllCourses,
      totalHoursStudied,
      totalQuizzesPassed
    });
  } catch (err) {
    next(err);
  }
};
