const User = require('../models/User');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');
const Module = require('../models/Module');
const StudentProgress = require('../models/StudentProgress');
const StudySession = require('../models/StudySession');
const mongoose = require('mongoose');

/**
 * Format seconds into a friendly human-readable string (e.g. "2m 45s" or "1h 10m")
 */
function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return 'N/A';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * 1. Render Student Profile Page
 */
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId).select('-passwordHash');

    if (!user) {
      req.flash('error', 'Student account not found.');
      return res.redirect('/auth/login');
    }

    // Aggregate summary stats for the profile view
    const quizAttempts = await QuizAttempt.find({ userId });
    const totalAttempts = quizAttempts.length;
    const passedAttempts = quizAttempts.filter(a => a.passed).length;
    const avgScore = totalAttempts > 0
      ? Math.round(quizAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts)
      : 0;

    const studySessions = await StudySession.find({ userId, status: 'completed' });
    const totalStudySeconds = studySessions.reduce(
      (sum, s) => sum + (s.actualDurationSeconds || 0),
      0
    );
    const studyHours = (totalStudySeconds / 3600).toFixed(1);

    const progressDocs = await StudentProgress.find({ userId });
    const completedModulesCount = progressDocs.reduce(
      (sum, p) => sum + (p.completedModules ? p.completedModules.length : 0),
      0
    );

    res.render('dashboard/profile', {
      pageTitle: 'My Profile - FocusLearn',
      currentPath: '/dashboard/profile',
      user,
      stats: {
        totalAttempts,
        passedAttempts,
        avgScore,
        studyHours,
        completedModulesCount,
        streakDays: user.streakDays || 0
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 2. Handle Profile Information Update
 */
exports.postUpdateProfile = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const { name, email, phone, bio, department, institution, headline } = req.body;

    // Backend Input Validation
    if (!name || name.trim().length < 2) {
      req.flash('error', 'Name must be at least 2 characters long.');
      return res.redirect('/dashboard/profile');
    }

    if (name.trim().length > 60) {
      req.flash('error', 'Name cannot exceed 60 characters.');
      return res.redirect('/dashboard/profile');
    }

    if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/.test(email.trim())) {
      req.flash('error', 'Please provide a valid email address.');
      return res.redirect('/dashboard/profile');
    }

    if (bio && bio.length > 300) {
      req.flash('error', 'Bio cannot exceed 300 characters.');
      return res.redirect('/dashboard/profile');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if new email is taken by another user
    const existing = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: userId }
    });

    if (existing) {
      req.flash('error', 'This email address is already registered to another account.');
      return res.redirect('/dashboard/profile');
    }

    const user = await User.findById(userId);
    if (!user) {
      req.flash('error', 'User account not found.');
      return res.redirect('/auth/login');
    }

    user.name = name.trim();
    user.email = normalizedEmail;
    user.phone = (phone || '').trim();
    user.bio = (bio || '').trim();
    user.department = (department || '').trim();
    user.institution = (institution || '').trim();
    user.headline = (headline || '').trim();

    await user.save();

    req.flash('success', 'Profile updated successfully!');
    res.redirect('/dashboard/profile');
  } catch (err) {
    next(err);
  }
};

/**
 * 3. Render Secure Change Password Page
 */
exports.getChangePassword = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId).select('-passwordHash');

    res.render('dashboard/change-password', {
      pageTitle: 'Change Password - FocusLearn',
      currentPath: '/dashboard/change-password',
      user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 4. Handle Secure Password Change
 */
exports.postChangePassword = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      req.flash('error', 'All password fields are required.');
      return res.redirect('/dashboard/change-password');
    }

    if (newPassword !== confirmPassword) {
      req.flash('error', 'New password and confirmation password do not match.');
      return res.redirect('/dashboard/change-password');
    }

    if (newPassword.length < 6) {
      req.flash('error', 'New password must be at least 6 characters long.');
      return res.redirect('/dashboard/change-password');
    }

    const user = await User.findById(userId);
    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/auth/login');
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      req.flash('error', 'Current password is incorrect. Please check your credentials.');
      return res.redirect('/dashboard/change-password');
    }

    // Prevent changing to identical password
    const isSameAsOld = await user.comparePassword(newPassword);
    if (isSameAsOld) {
      req.flash('error', 'New password cannot be identical to your current password.');
      return res.redirect('/dashboard/change-password');
    }

    // Update password (pre-save hook hashes with bcrypt automatically)
    user.passwordHash = newPassword;
    await user.save();

    req.flash('success', 'Your password has been changed successfully!');
    res.redirect('/dashboard/profile');
  } catch (err) {
    next(err);
  }
};

/**
 * 5. Render Quiz Attempt History Page with Pagination & Filters
 */
exports.getQuizHistory = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const courseFilter = req.query.courseId || '';
    const statusFilter = req.query.status || '';

    const query = { userId };
    if (courseFilter && mongoose.Types.ObjectId.isValid(courseFilter)) {
      query.courseId = courseFilter;
    }
    if (statusFilter === 'passed') {
      query.passed = true;
    } else if (statusFilter === 'failed') {
      query.passed = false;
    }

    const totalAttempts = await QuizAttempt.countDocuments(query);
    const totalPages = Math.ceil(totalAttempts / limit) || 1;

    const rawAttempts = await QuizAttempt.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('courseId moduleId quizId');

    // Courses list for filtering
    const courses = await Course.find().sort({ order: 1 });

    // Aggregate summary across ALL student attempts
    const allUserAttempts = await QuizAttempt.find({ userId });
    const totalAllAttempts = allUserAttempts.length;
    const totalPassedAll = allUserAttempts.filter(a => a.passed).length;
    const totalFailedAll = totalAllAttempts - totalPassedAll;
    const overallAvgScore = totalAllAttempts > 0
      ? Math.round(allUserAttempts.reduce((sum, a) => sum + a.percentage, 0) / totalAllAttempts)
      : 0;

    // Format attempts for display
    const attempts = rawAttempts.map(attempt => {
      const counts = attempt.getCalculatedCounts ? attempt.getCalculatedCounts() : {
        correct: attempt.answers.filter(a => a.isCorrect).length,
        incorrect: attempt.answers.filter(a => !a.isCorrect && a.selectedOption !== -1).length,
        unanswered: attempt.answers.filter(a => a.selectedOption === -1).length,
        maxScore: attempt.maxScore || attempt.totalQuestions || 10
      };

      const dateObj = new Date(attempt.createdAt);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      const formattedTime = dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      return {
        _id: attempt._id,
        attemptNumber: attempt.attemptNumber,
        quizTitle: (attempt.quizId && attempt.quizId.title) ? attempt.quizId.title : 'Assessment Quiz',
        courseTitle: (attempt.courseId && attempt.courseId.title) ? attempt.courseId.title : 'Course',
        courseCode: (attempt.courseId && attempt.courseId.code) ? attempt.courseId.code : 'GEN',
        moduleTitle: (attempt.moduleId && attempt.moduleId.title) ? attempt.moduleId.title : 'Module',
        moduleNumber: (attempt.moduleId && attempt.moduleId.moduleNumber) ? attempt.moduleId.moduleNumber : '',
        totalQuestions: attempt.totalQuestions || 10,
        score: attempt.score,
        maxScore: counts.maxScore,
        percentage: attempt.percentage,
        passed: attempt.passed,
        correctCount: counts.correct,
        incorrectCount: counts.incorrect,
        unansweredCount: counts.unanswered,
        formattedDate,
        formattedTime,
        timeSpentFormatted: formatDuration(attempt.timeSpentSeconds)
      };
    });

    res.render('quizzes/history', {
      pageTitle: 'My Quiz History - FocusLearn',
      currentPath: '/quizzes/history',
      attempts,
      page,
      totalPages,
      totalAttempts,
      limit,
      courses,
      filters: {
        courseId: courseFilter,
        status: statusFilter
      },
      summary: {
        totalAllAttempts,
        totalPassedAll,
        totalFailedAll,
        overallAvgScore,
        passRate: totalAllAttempts > 0 ? Math.round((totalPassedAll / totalAllAttempts) * 100) : 0
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 6. Render Detailed Quiz Result Review
 */
exports.getQuizHistoryDetail = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const userId = req.session.userId;

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      req.flash('error', 'Invalid quiz attempt identifier.');
      return res.redirect('/quizzes/history');
    }

    // Enforce ownership: students can ONLY view their own quiz attempts
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      userId
    }).populate('courseId moduleId quizId');

    if (!attempt) {
      req.flash('error', 'Quiz attempt not found or you are not authorized to view this result.');
      return res.redirect('/quizzes/history');
    }

    // Load original quiz to ensure all option labels & explanations exist
    const quiz = await Quiz.findById(attempt.quizId);
    const course = attempt.courseId;
    const moduleDoc = attempt.moduleId;

    const counts = attempt.getCalculatedCounts ? attempt.getCalculatedCounts() : {
      correct: attempt.answers.filter(a => a.isCorrect).length,
      incorrect: attempt.answers.filter(a => !a.isCorrect && a.selectedOption !== -1).length,
      unanswered: attempt.answers.filter(a => a.selectedOption === -1).length,
      maxScore: attempt.maxScore || attempt.totalQuestions || 10
    };

    const dateObj = new Date(attempt.createdAt);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Build question detail view with options and selections
    const detailedQuestions = attempt.answers.map((ans, idx) => {
      const originalQ = quiz && quiz.questions ? quiz.questions[idx] : null;
      const options = (ans.options && ans.options.length === 4)
        ? ans.options
        : (originalQ ? originalQ.options : ['Option A', 'Option B', 'Option C', 'Option D']);

      const selectedOptIdx = ans.selectedOption;
      const correctOptIdx = ans.correctOption !== undefined ? ans.correctOption : (originalQ ? originalQ.correctOptionIndex : 0);

      const isUnanswered = selectedOptIdx === -1;
      const isCorrect = ans.isCorrect;

      const selectedOptText = isUnanswered
        ? 'Unanswered'
        : (options[selectedOptIdx] || ans.selectedOptionText || `Option ${String.fromCharCode(65 + selectedOptIdx)}`);

      const correctOptText = options[correctOptIdx] || ans.correctOptionText || `Option ${String.fromCharCode(65 + correctOptIdx)}`;

      const explanation = ans.explanation || (originalQ ? originalQ.explanation : 'No explanation provided.');

      return {
        index: idx + 1,
        questionText: ans.questionText || (originalQ ? originalQ.questionText : `Question ${idx + 1}`),
        options,
        selectedOption: selectedOptIdx,
        selectedOptionText: selectedOptText,
        selectedOptionLetter: isUnanswered ? 'None' : String.fromCharCode(65 + selectedOptIdx),
        correctOption: correctOptIdx,
        correctOptionText: correctOptText,
        correctOptionLetter: String.fromCharCode(65 + correctOptIdx),
        isCorrect,
        isUnanswered,
        explanation
      };
    });

    res.render('quizzes/history-detail', {
      pageTitle: `Quiz Review: ${attempt.quizId?.title || 'Result'} - FocusLearn`,
      currentPath: '/quizzes/history',
      attempt: {
        _id: attempt._id,
        attemptNumber: attempt.attemptNumber,
        score: attempt.score,
        maxScore: counts.maxScore,
        totalQuestions: attempt.totalQuestions || 10,
        percentage: attempt.percentage,
        passed: attempt.passed,
        passingScore: quiz ? (quiz.passingScore || 6) : 6,
        correctCount: counts.correct,
        incorrectCount: counts.incorrect,
        unansweredCount: counts.unanswered,
        formattedDate,
        formattedTime,
        timeSpentFormatted: formatDuration(attempt.timeSpentSeconds)
      },
      course,
      moduleDoc,
      quiz,
      questions: detailedQuestions
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 7. Render Student Performance Analytics & Visual Progress Dashboard
 */
exports.getPerformance = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const courses = await Course.find().sort({ order: 1 });

    // Chronological order for performance chart over time
    const chronologicalAttempts = await QuizAttempt.find({ userId })
      .sort({ createdAt: 1 })
      .populate('courseId moduleId quizId');

    const totalAttempts = chronologicalAttempts.length;

    let totalCorrectAnswers = 0;
    let totalIncorrectAnswers = 0;
    let totalUnanswered = 0;
    let sumPercentage = 0;
    let highestScore = 0;
    let highestPercentage = 0;

    chronologicalAttempts.forEach(att => {
      const counts = att.getCalculatedCounts ? att.getCalculatedCounts() : {
        correct: att.answers.filter(a => a.isCorrect).length,
        incorrect: att.answers.filter(a => !a.isCorrect && a.selectedOption !== -1).length,
        unanswered: att.answers.filter(a => a.selectedOption === -1).length
      };

      totalCorrectAnswers += counts.correct;
      totalIncorrectAnswers += counts.incorrect;
      totalUnanswered += counts.unanswered;

      sumPercentage += att.percentage || 0;
      if ((att.percentage || 0) > highestPercentage) {
        highestPercentage = att.percentage;
        highestScore = att.score;
      }
    });

    const averageQuizScore = totalAttempts > 0 ? Math.round(sumPercentage / totalAttempts) : 0;
    const latestAttempt = totalAttempts > 0 ? chronologicalAttempts[totalAttempts - 1] : null;
    const latestQuizScore = latestAttempt ? latestAttempt.percentage : 0;
    const passedAttemptsCount = chronologicalAttempts.filter(a => a.passed).length;
    const passRate = totalAttempts > 0 ? Math.round((passedAttemptsCount / totalAttempts) * 100) : 0;

    // Overall Performance Rating Label & Badge
    let performanceRating = 'Not Started';
    let performanceBadgeClass = 'bg-secondary';
    let performanceSummary = 'Take quizzes to build your performance profile.';

    if (totalAttempts > 0) {
      if (averageQuizScore >= 85) {
        performanceRating = 'Mastery (Excellent)';
        performanceBadgeClass = 'bg-success';
        performanceSummary = 'Outstanding performance! You are consistently demonstrating mastery across topics.';
      } else if (averageQuizScore >= 70) {
        performanceRating = 'Proficient (Good)';
        performanceBadgeClass = 'bg-primary';
        performanceSummary = 'Solid grasp of concepts! Minor revisions will push you into top mastery.';
      } else if (averageQuizScore >= 60) {
        performanceRating = 'Developing';
        performanceBadgeClass = 'bg-warning text-dark';
        performanceSummary = 'Making progress. Focus on reviewing explanations for incorrect questions to improve.';
      } else {
        performanceRating = 'Needs Practice';
        performanceBadgeClass = 'bg-danger';
        performanceSummary = 'Additional review recommended. Retake quizzes and consult module lesson notes.';
      }
    }

    // Subject-wise Breakdown with Progress & Recommendations
    const subjectBreakdown = courses.map(course => {
      const courseAttempts = chronologicalAttempts.filter(
        a => a.courseId && a.courseId._id.toString() === course._id.toString()
      );

      const count = courseAttempts.length;
      const cPassed = courseAttempts.filter(a => a.passed).length;
      const cAvg = count > 0
        ? Math.round(courseAttempts.reduce((s, a) => s + a.percentage, 0) / count)
        : 0;
      const cBest = count > 0
        ? Math.max(...courseAttempts.map(a => a.percentage))
        : 0;

      let status = 'Not Attempted';
      let statusClass = 'text-muted';
      let needsImprovement = false;
      let recommendation = 'Start this course and take its module quizzes.';

      if (count > 0) {
        if (cAvg >= 80) {
          status = 'Mastered';
          statusClass = 'text-success';
          recommendation = 'Strong subject retention. Ready for advanced topics.';
        } else if (cAvg >= 60) {
          status = 'Competent';
          statusClass = 'text-primary';
          recommendation = 'Competent understanding. Aim for 80%+ on your next attempt.';
        } else {
          status = 'Needs Focus';
          statusClass = 'text-danger';
          needsImprovement = true;
          recommendation = 'Scores below benchmark. Review module lessons before retaking.';
        }
      }

      return {
        course,
        count,
        passedCount: cPassed,
        averagePercentage: cAvg,
        bestPercentage: cBest,
        status,
        statusClass,
        needsImprovement,
        recommendation
      };
    });

    // Chart Data for Performance Over Time
    const chartLabels = chronologicalAttempts.map((a, idx) => {
      const d = new Date(a.createdAt);
      const shortDate = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
      const code = a.courseId?.code || 'Quiz';
      return `#${idx + 1} ${code} (${shortDate})`;
    });

    const chartScores = chronologicalAttempts.map(a => a.percentage);
    const chartRawMarks = chronologicalAttempts.map(a => a.score);

    res.render('dashboard/performance', {
      pageTitle: 'My Performance - FocusLearn',
      currentPath: '/dashboard/performance',
      stats: {
        totalQuizzesAttempted: totalAttempts,
        totalCorrectAnswers,
        totalIncorrectAnswers,
        totalUnanswered,
        averageQuizScore,
        highestScore,
        highestPercentage,
        latestQuizScore,
        passedAttemptsCount,
        passRate,
        performanceRating,
        performanceBadgeClass,
        performanceSummary
      },
      subjectBreakdown,
      recentAttempts: [...chronologicalAttempts].reverse().slice(0, 5),
      chartData: {
        labels: JSON.stringify(chartLabels),
        scores: JSON.stringify(chartScores),
        marks: JSON.stringify(chartRawMarks),
        rawAttempts: chronologicalAttempts.map((a, i) => ({
          label: `#${i + 1} - ${a.courseId?.code || 'Quiz'}`,
          score: a.score,
          percentage: a.percentage,
          passed: a.passed,
          date: new Date(a.createdAt).toLocaleDateString()
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};
