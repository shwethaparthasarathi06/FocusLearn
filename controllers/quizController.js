const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Module = require('../models/Module');
const Course = require('../models/Course');
const StudentProgress = require('../models/StudentProgress');
const StudyMaterial = require('../models/StudyMaterial');

/**
 * Render Quiz Attempt Page
 */
exports.getQuiz = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const moduleDoc = await Module.findById(moduleId);

    if (!moduleDoc) {
      req.flash('error', 'Module not found.');
      return res.redirect('/courses');
    }

    const course = await Course.findById(moduleDoc.courseId);
    const quiz = await Quiz.findOne({ moduleId: moduleDoc._id });
    const materials = await StudyMaterial.find({ courseId: moduleDoc.courseId, isPublished: true }).populate('moduleId').sort({ createdAt: -1 });

    if (!quiz) {
      req.flash('info', 'Assessment quiz is currently being prepared for this module.');
      return res.redirect(`/lessons/${moduleDoc._id}`);
    }

    // Security: Clone questions and strip correct answers before passing to view
    const sanitizedQuestions = quiz.questions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options
    }));

    res.render('quizzes/show', {
      pageTitle: `Quiz: ${moduleDoc.title} - FocusLearn`,
      currentPath: '/courses',
      course,
      moduleDoc,
      materials,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        passingScore: quiz.passingScore,
        totalQuestions: quiz.totalQuestions,
        questions: sanitizedQuestions
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Server-Side Evaluation of Submitted Quiz
 */
exports.postSubmitQuiz = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const { answers = {} } = req.body;

    const moduleDoc = await Module.findById(moduleId);
    if (!moduleDoc) {
      req.flash('error', 'Module not found.');
      return res.redirect('/courses');
    }

    const course = await Course.findById(moduleDoc.courseId);
    const quiz = await Quiz.findOne({ moduleId: moduleDoc._id });

    if (!quiz || quiz.questions.length !== 10 || quiz.questions.some(q => q.options.length !== 4)) {
      req.flash('error', 'A valid 10-question quiz is not available for this topic.');
      return res.redirect('/courses');
    }

    // Authoritative Server-Side Answer Evaluation
    let score = 0;
    const answerRecords = [];

    quiz.questions.forEach((q, idx) => {
      const submittedVal = answers[idx.toString()];
      const selectedOption = (submittedVal !== undefined && submittedVal !== '') ? parseInt(submittedVal, 10) : -1;
      if (!Number.isInteger(selectedOption) || selectedOption < -1 || selectedOption > 3) {
        throw new Error('Invalid answer selection received.');
      }
      const isCorrect = selectedOption === q.correctOptionIndex;

      if (isCorrect) score += 1;

      answerRecords.push({
        questionIndex: idx,
        questionText: q.questionText,
        selectedOption,
        correctOption: q.correctOptionIndex,
        isCorrect,
        explanation: q.explanation
      });
    });

    const totalQuestions = quiz.questions.length || 10;
    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = score >= (quiz.passingScore || 6);

    // Count previous attempts
    const previousAttemptsCount = await QuizAttempt.countDocuments({
      userId: req.session.userId,
      quizId: quiz._id
    });

    const attempt = new QuizAttempt({
      userId: req.session.userId,
      quizId: quiz._id,
      courseId: course._id,
      moduleId: moduleDoc._id,
      attemptNumber: previousAttemptsCount + 1,
      answers: answerRecords,
      score,
      totalQuestions,
      percentage,
      passed
    });

    await attempt.save();

    // If passed, update StudentProgress
    if (passed) {
      let progress = await StudentProgress.findOne({
        userId: req.session.userId,
        courseId: course._id
      });

      if (!progress) {
        progress = new StudentProgress({
          userId: req.session.userId,
          courseId: course._id,
          completedModules: []
        });
      }

      const existingIndex = progress.completedModules.findIndex(
        m => m.moduleId.toString() === moduleDoc._id.toString()
      );

      if (existingIndex > -1) {
        if (score > progress.completedModules[existingIndex].bestQuizScore) {
          progress.completedModules[existingIndex].bestQuizScore = score;
        }
      } else {
        progress.completedModules.push({
          moduleId: moduleDoc._id,
          completedAt: new Date(),
          bestQuizScore: score
        });
      }

      // Calculate overall course completion
      const allModulesCount = await Module.countDocuments({ courseId: course._id });
      progress.completionPercentage = allModulesCount > 0
        ? Math.round((progress.completedModules.length / allModulesCount) * 100)
        : 100;

      if (progress.completedModules.length >= allModulesCount) {
        progress.isCourseCompleted = true;
        progress.completedAt = new Date();
      }

      await progress.save();
    }

    res.redirect(`/quizzes/attempt/${attempt._id}/result`);
  } catch (err) {
    next(err);
  }
};

/**
 * Render Quiz Result Scorecard
 */
exports.getQuizResult = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      userId: req.session.userId
    });

    if (!attempt) {
      req.flash('error', 'Quiz attempt not found or unauthorized.');
      return res.redirect('/courses');
    }

    const course = await Course.findById(attempt.courseId);
    const moduleDoc = await Module.findById(attempt.moduleId);
    const quiz = await Quiz.findById(attempt.quizId);
    const materials = await StudyMaterial.find({ courseId: attempt.courseId, isPublished: true }).populate('moduleId').sort({ createdAt: -1 });

    const attemptHistory = await QuizAttempt.find({
      userId: req.session.userId,
      quizId: attempt.quizId
    }).sort({ createdAt: -1 });

    res.render('quizzes/result', {
      pageTitle: `Quiz Result: ${attempt.score}/10 - FocusLearn`,
      currentPath: '/courses',
      attempt,
      course,
      moduleDoc,
      quiz,
      materials,
      attemptHistory
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Render Detailed Answer Review
 */
exports.getQuizReview = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      userId: req.session.userId
    });

    if (!attempt) {
      req.flash('error', 'Quiz attempt not found or unauthorized.');
      return res.redirect('/courses');
    }

    const quiz = await Quiz.findById(attempt.quizId);
    const course = await Course.findById(attempt.courseId);
    const moduleDoc = await Module.findById(attempt.moduleId);
    const materials = await StudyMaterial.find({ courseId: attempt.courseId, isPublished: true }).populate('moduleId').sort({ createdAt: -1 });

    res.render('quizzes/review', {
      pageTitle: `Quiz Review: Attempt #${attempt.attemptNumber} - FocusLearn`,
      currentPath: '/courses',
      attempt,
      quiz,
      course,
      moduleDoc,
      materials
    });
  } catch (err) {
    next(err);
  }
};
