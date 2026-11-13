const Course = require('../models/Course');
const Module = require('../models/Module');
const StudySession = require('../models/StudySession');
const QuizAttempt = require('../models/QuizAttempt');
const StudentProgress = require('../models/StudentProgress');
const User = require('../models/User');

/**
 * Returns a date string "YYYY-MM-DD" in local time for comparison
 */
function toDateKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Render Student Dashboard with Persistent Analytics
 */
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.session.userId;

    const courses = await Course.find().sort({ order: 1 });
    const progressDocs = await StudentProgress.find({ userId });
    const studySessions = await StudySession.find({ userId, status: 'completed' });
    const quizAttempts = await QuizAttempt.find({ userId });

    // Aggregate Total Study Time (Seconds)
    const totalStudySeconds = studySessions.reduce(
      (sum, s) => sum + (s.actualDurationSeconds || 0),
      0
    );

    const studyHours = Math.floor(totalStudySeconds / 3600);
    const studyMinutes = Math.floor((totalStudySeconds % 3600) / 60);
    const formattedStudyTime = studyHours > 0 ? `${studyHours}h ${studyMinutes}m` : `${studyMinutes} mins`;

    // Quizzes Statistics
    const totalQuizzesAttempted = quizAttempts.length;
    const quizzesPassed = quizAttempts.filter(a => a.passed).length;
    const averageQuizScore = totalQuizzesAttempted > 0
      ? Math.round(quizAttempts.reduce((sum, a) => sum + a.percentage, 0) / totalQuizzesAttempted)
      : 0;

    // Course Progress Mapping
    const progressMap = {};
    progressDocs.forEach(p => {
      progressMap[p.courseId.toString()] = p;
    });

    let coursesStarted = 0;
    let coursesCompleted = 0;

    const courseProgressList = await Promise.all(
      courses.map(async course => {
        const totalModulesCount = await Module.countDocuments({ courseId: course._id });
        const p = progressMap[course._id.toString()];
        const completedModulesCount = p ? p.completedModules.length : 0;
        const percentage = totalModulesCount > 0 ? Math.round((completedModulesCount / totalModulesCount) * 100) : 0;

        if (completedModulesCount > 0 || (p && p.totalStudyTimeSeconds > 0)) {
          coursesStarted += 1;
        }
        if (p && p.isCourseCompleted) {
          coursesCompleted += 1;
        }

        return {
          course,
          totalModulesCount,
          completedModulesCount,
          percentage,
          isCompleted: p ? p.isCourseCompleted : false
        };
      })
    );

    // Recent 5 study sessions
    const recentSessions = await StudySession.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('courseId moduleId');

    // Recent 5 quiz attempts
    const recentAttempts = await QuizAttempt.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('courseId moduleId');

    // Time of day greeting
    const hour = new Date().getHours();
    let greeting = 'Good Morning';
    if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
    else if (hour >= 17) greeting = 'Good Evening';

    // Current Date formatting
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });

    // Active Goal Course (first course in progress or first course)
    const activeGoal = courseProgressList.find(c => c.percentage > 0 && !c.isCompleted) 
      || courseProgressList[0] 
      || null;

    // ── Real Date-Based Streak ────────────────────────────────────────────────
    const userDoc = await User.findById(userId);
    const todayKey = toDateKey(new Date());
    let streakDays = userDoc.streakDays || 0;

    if (!userDoc.lastLoginDate) {
      // First ever dashboard visit
      streakDays = 1;
    } else {
      const lastKey = toDateKey(userDoc.lastLoginDate);
      if (lastKey === todayKey) {
        // Same day — keep streak unchanged (already counted today)
        streakDays = streakDays || 1;
      } else {
        // Check if yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = toDateKey(yesterday);

        if (lastKey === yesterdayKey) {
          // Consecutive day — increment
          streakDays += 1;
        } else {
          // Skipped a day or more — reset
          streakDays = 1;
        }
        // Persist the updated streak and today as lastLoginDate
        await User.findByIdAndUpdate(userId, {
          streakDays,
          lastLoginDate: new Date()
        });
      }
    }

    // Save first-visit or reset update
    if (!userDoc.lastLoginDate || toDateKey(userDoc.lastLoginDate) !== todayKey) {
      await User.findByIdAndUpdate(userId, {
        streakDays,
        lastLoginDate: new Date()
      });
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Relative time helper
    function timeAgo(date) {
      if (!date) return 'Recently';
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);
      if (seconds < 60) return 'Just now';
      const mins = Math.floor(seconds / 60);
      if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      const days = Math.floor(hours / 24);
      if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
      return new Date(date).toLocaleDateString();
    }

    // Recent Activities list
    const recentActivities = [];
    quizAttempts.slice(0, 4).forEach(a => {
      const courseCode = a.courseId && a.courseId.code ? a.courseId.code : 'Course';
      recentActivities.push({
        title: `Finished ${courseCode} Quiz (Score: ${a.score}/10)`,
        timeStr: timeAgo(a.createdAt),
        passed: a.passed
      });
    });

    progressDocs.forEach(p => {
      if (p.completedModules && p.completedModules.length > 0) {
        const c = courses.find(cr => cr._id.toString() === p.courseId.toString());
        p.completedModules.slice(-2).forEach(m => {
          recentActivities.push({
            title: `Completed Module in ${c ? c.title : 'Course'}`,
            timeStr: timeAgo(m.completedAt),
            passed: true
          });
        });
      }
    });

    if (recentActivities.length === 0) {
      recentActivities.push(
        { title: 'Enrolled in Computer Science Curriculum', timeStr: 'Recently', passed: true },
        { title: 'Started Data Structures Learning Path', timeStr: 'Today', passed: true }
      );
    }

    res.render('dashboard/index', {
      pageTitle: 'Dashboard - FocusLearn',
      currentPath: '/dashboard',
      greeting,
      currentDate: { dateStr, dayName },
      activeGoal,
      streakDays,
      recentActivities: recentActivities.slice(0, 5),
      stats: {
        totalCourses: courses.length,
        coursesStarted,
        coursesCompleted,
        formattedStudyTime,
        totalSessions: studySessions.length,
        totalQuizzesAttempted,
        quizzesPassed,
        averageQuizScore
      },
      courseProgressList,
      recentSessions,
      recentAttempts
    });
  } catch (err) {
    next(err);
  }
};
