const User = require('../../models/User');
const Quiz = require('../../models/Quiz');
const QuizAttempt = require('../../models/QuizAttempt');
const Course = require('../../models/Course');
const Module = require('../../models/Module');
const StudentProgress = require('../../models/StudentProgress');
const StudySession = require('../../models/StudySession');
const mongoose = require('mongoose');

/**
 * GET /api/student/profile
 * Fetch logged-in student profile (never exposes passwordHash)
 */
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const quizAttempts = await QuizAttempt.find({ userId });
    const totalAttempts = quizAttempts.length;
    const passedAttempts = quizAttempts.filter(a => a.passed).length;
    const avgScore = totalAttempts > 0
      ? Math.round(quizAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts)
      : 0;

    return res.status(200).json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        bio: user.bio || '',
        department: user.department || '',
        institution: user.institution || '',
        headline: user.headline || '',
        role: user.role,
        streakDays: user.streakDays || 0,
        lastLoginDate: user.lastLoginDate,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      stats: {
        totalAttempts,
        passedAttempts,
        avgScore
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/student/profile
 * Update student profile information
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const { name, email, phone, bio, department, institution, headline } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters long.' });
    }
    if (name.trim().length > 60) {
      return res.status(400).json({ success: false, message: 'Name cannot exceed 60 characters.' });
    }

    if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (bio && bio.length > 300) {
      return res.status(400).json({ success: false, message: 'Bio cannot exceed 300 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: userId }
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Email address already in use by another account.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.name = name.trim();
    user.email = normalizedEmail;
    user.phone = (phone || '').trim();
    user.bio = (bio || '').trim();
    user.department = (department || '').trim();
    user.institution = (institution || '').trim();
    user.headline = (headline || '').trim();

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        department: user.department,
        institution: user.institution,
        headline: user.headline
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/student/change-password
 * Secure password change
 */
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All password fields are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirmation password do not match.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const isSame = await user.comparePassword(newPassword);
    if (isSame) {
      return res.status(400).json({ success: false, message: 'New password cannot be the same as your current password.' });
    }

    user.passwordHash = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/student/quiz-history
 * Fetch quiz attempts history with pagination and filtering
 */
exports.getQuizHistory = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const courseId = req.query.courseId;
    const status = req.query.status;

    const query = { userId };
    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
      query.courseId = courseId;
    }
    if (status === 'passed') query.passed = true;
    if (status === 'failed') query.passed = false;

    const totalCount = await QuizAttempt.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit) || 1;

    const attempts = await QuizAttempt.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('courseId moduleId quizId');

    const formatted = attempts.map(a => {
      const counts = a.getCalculatedCounts ? a.getCalculatedCounts() : {
        correct: a.answers.filter(ans => ans.isCorrect).length,
        incorrect: a.answers.filter(ans => !ans.isCorrect && ans.selectedOption !== -1).length,
        unanswered: a.answers.filter(ans => ans.selectedOption === -1).length,
        maxScore: a.maxScore || a.totalQuestions || 10
      };

      return {
        id: a._id,
        attemptNumber: a.attemptNumber,
        quizTitle: a.quizId?.title || 'Quiz',
        courseCode: a.courseId?.code || '',
        courseTitle: a.courseId?.title || '',
        moduleTitle: a.moduleId?.title || '',
        score: a.score,
        maxScore: counts.maxScore,
        totalQuestions: a.totalQuestions || 10,
        percentage: a.percentage,
        passed: a.passed,
        correctAnswersCount: counts.correct,
        incorrectAnswersCount: counts.incorrect,
        unansweredCount: counts.unanswered,
        timeSpentSeconds: a.timeSpentSeconds || 0,
        attemptDate: a.createdAt
      };
    });

    return res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      },
      attempts: formatted
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/student/quiz-attempts/:attemptId
 * Fetch detailed quiz attempt result (Ownership strictly enforced)
 */
exports.getQuizAttemptDetail = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const userId = req.session.userId;

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({ success: false, message: 'Invalid attempt ID.' });
    }

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      userId
    }).populate('courseId moduleId quizId');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found or unauthorized.'
      });
    }

    const quiz = await Quiz.findById(attempt.quizId);
    const counts = attempt.getCalculatedCounts ? attempt.getCalculatedCounts() : {
      correct: attempt.answers.filter(ans => ans.isCorrect).length,
      incorrect: attempt.answers.filter(ans => !ans.isCorrect && ans.selectedOption !== -1).length,
      unanswered: attempt.answers.filter(ans => ans.selectedOption === -1).length,
      maxScore: attempt.maxScore || attempt.totalQuestions || 10
    };

    const questions = attempt.answers.map((ans, idx) => {
      const originalQ = quiz?.questions?.[idx];
      const options = (ans.options && ans.options.length === 4)
        ? ans.options
        : (originalQ?.options || []);

      return {
        questionIndex: idx,
        questionText: ans.questionText || originalQ?.questionText || '',
        options,
        selectedOption: ans.selectedOption,
        selectedOptionText: (ans.selectedOption >= 0 && options[ans.selectedOption]) ? options[ans.selectedOption] : 'Unanswered',
        correctOption: ans.correctOption,
        correctOptionText: options[ans.correctOption] || '',
        isCorrect: ans.isCorrect,
        isUnanswered: ans.selectedOption === -1,
        explanation: ans.explanation || originalQ?.explanation || ''
      };
    });

    return res.status(200).json({
      success: true,
      attempt: {
        id: attempt._id,
        attemptNumber: attempt.attemptNumber,
        quizTitle: attempt.quizId?.title || 'Quiz',
        courseTitle: attempt.courseId?.title || '',
        courseCode: attempt.courseId?.code || '',
        moduleTitle: attempt.moduleId?.title || '',
        score: attempt.score,
        maxScore: counts.maxScore,
        totalQuestions: attempt.totalQuestions || 10,
        percentage: attempt.percentage,
        passed: attempt.passed,
        passingScore: quiz ? (quiz.passingScore || 6) : 6,
        correctAnswersCount: counts.correct,
        incorrectAnswersCount: counts.incorrect,
        unansweredCount: counts.unanswered,
        timeSpentSeconds: attempt.timeSpentSeconds || 0,
        createdAt: attempt.createdAt
      },
      questions
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/student/performance
 * Fetch performance stats and chart data
 */
exports.getPerformance = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const attempts = await QuizAttempt.find({ userId })
      .sort({ createdAt: 1 })
      .populate('courseId moduleId quizId');

    const totalAttempts = attempts.length;
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalUnanswered = 0;
    let sumPercentage = 0;
    let highestScore = 0;
    let highestPercentage = 0;

    attempts.forEach(a => {
      const counts = a.getCalculatedCounts ? a.getCalculatedCounts() : {
        correct: a.answers.filter(ans => ans.isCorrect).length,
        incorrect: a.answers.filter(ans => !ans.isCorrect && ans.selectedOption !== -1).length,
        unanswered: a.answers.filter(ans => ans.selectedOption === -1).length
      };

      totalCorrect += counts.correct;
      totalIncorrect += counts.incorrect;
      totalUnanswered += counts.unanswered;

      sumPercentage += a.percentage || 0;
      if ((a.percentage || 0) > highestPercentage) {
        highestPercentage = a.percentage;
        highestScore = a.score;
      }
    });

    const averageQuizScore = totalAttempts > 0 ? Math.round(sumPercentage / totalAttempts) : 0;
    const latestAttempt = totalAttempts > 0 ? attempts[attempts.length - 1] : null;
    const passedCount = attempts.filter(a => a.passed).length;
    const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;

    const timeline = attempts.map((a, i) => ({
      attemptIndex: i + 1,
      attemptId: a._id,
      courseCode: a.courseId?.code || 'Quiz',
      quizTitle: a.quizId?.title || 'Quiz',
      score: a.score,
      maxScore: a.maxScore || a.totalQuestions || 10,
      percentage: a.percentage,
      passed: a.passed,
      date: a.createdAt
    }));

    return res.status(200).json({
      success: true,
      statistics: {
        totalQuizzesAttempted: totalAttempts,
        totalCorrectAnswers: totalCorrect,
        totalIncorrectAnswers: totalIncorrect,
        totalUnanswered,
        averageQuizScore,
        highestQuizScore: highestScore,
        highestQuizPercentage: highestPercentage,
        latestQuizScore: latestAttempt ? latestAttempt.score : 0,
        latestQuizPercentage: latestAttempt ? latestAttempt.percentage : 0,
        passedQuizzesCount: passedCount,
        passRate
      },
      timeline
    });
  } catch (err) {
    next(err);
  }
};
