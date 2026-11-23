
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
    const isRedoRequested = req.query.type === 'redo';

    const moduleDoc = await Module.findById(moduleId);

    if (!moduleDoc) {
      req.flash('error', 'Module not found.');
      return res.redirect('/courses');
    }

    const course = await Course.findById(moduleDoc.courseId);

    let progress = null;

    if (req.session.userId) {
      progress = await StudentProgress.findOne({
        userId: req.session.userId,
        courseId: moduleDoc.courseId
      });
    }

    // Validate redo quiz access
    if (isRedoRequested) {
      if (!req.session.userId) {
        req.flash('error', 'Please log in to access the redo assessment.');
        return res.redirect('/auth/login');
      }

      if (!progress || !progress.isCourseCompleted) {
        req.flash('error', 'You must complete the original course before taking redo quizzes.');
        return res.redirect(`/courses/${course.slug}`);
      }

      if (
        (progress.redoCount || 0) >= (progress.maxRedoAllowed || 1) ||
        progress.redoStatus === 'completed'
      ) {
        req.flash(
          'error',
          `You have already used your ${progress.maxRedoAllowed || 1} permitted redo attempt for this course. Redo is only allowed once.`
        );
        return res.redirect(`/courses/${course.slug}`);
      }

      if (progress.redoStatus !== 'in-progress') {
        req.flash(
          'error',
          'The redo quiz is only available during an active permitted course redo attempt. Please click "Redo Course" to start.'
        );
        return res.redirect(`/courses/${course.slug}`);
      }
    }

    // Fetch the appropriate quiz
    let quiz = null;

    if (isRedoRequested) {
      quiz = await Quiz.findOne({
        moduleId: moduleDoc._id,
        quizType: 'redo'
      });
    } else {
      quiz = await Quiz.findOne({
        moduleId: moduleDoc._id,
        quizType: { $ne: 'redo' }
      });
    }

    const materials = await StudyMaterial.find({
      courseId: moduleDoc.courseId,
      isPublished: true
    })
      .populate('moduleId')
      .sort({ createdAt: -1 });

    if (!quiz) {
      const quizName = isRedoRequested
        ? 'Redo assessment quiz'
        : 'Assessment quiz';

      req.flash('info', `${quizName} is currently being prepared for this module.`);
      return res.redirect(`/courses/${course.slug}`);
    }

    // Remove correct answers before sending questions to the browser
    const sanitizedQuestions = quiz.questions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options
    }));

    res.render('quizzes/show', {
      pageTitle: `${isRedoRequested ? 'Redo Quiz' : 'Quiz'}: ${moduleDoc.title} - FocusLearn`,
      currentPath: '/courses',
      course,
      moduleDoc,
      materials,
      isRedo: isRedoRequested,
      quizType: isRedoRequested ? 'redo' : 'regular',
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        quizType: quiz.quizType || 'regular',
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

    const {
      answers = {},
      timeSpentSeconds = 0
    } = req.body;

    const isRedoSubmission =
      req.query.type === 'redo' ||
      req.body.quizType === 'redo';

    const moduleDoc = await Module.findById(moduleId);

    if (!moduleDoc) {
      req.flash('error', 'Module not found.');
      return res.redirect('/courses');
    }

    const course = await Course.findById(moduleDoc.courseId);

    if (!course) {
      req.flash('error', 'Course not found.');
      return res.redirect('/courses');
    }

    // Find student progress
    let progress = await StudentProgress.findOne({
      userId: req.session.userId,
      courseId: course._id
    });

    // Validate redo quiz submission
    if (isRedoSubmission) {
      if (!progress || !progress.isCourseCompleted) {
        req.flash(
          'error',
          'You must complete the original course before submitting redo quizzes.'
        );
        return res.redirect(`/courses/${course.slug}`);
      }

      if (
        (progress.redoCount || 0) >= (progress.maxRedoAllowed || 1) ||
        progress.redoStatus === 'completed'
      ) {
        req.flash(
          'error',
          'You have already completed your permitted redo attempt for this course.'
        );
        return res.redirect(`/courses/${course.slug}`);
      }

      if (progress.redoStatus !== 'in-progress') {
        req.flash(
          'error',
          'Redo quiz submissions are only accepted during an active course redo attempt.'
        );
        return res.redirect(`/courses/${course.slug}`);
      }
    }

    // Fetch the corresponding quiz
    let quiz = null;

    if (isRedoSubmission) {
      quiz = await Quiz.findOne({
        moduleId: moduleDoc._id,
        quizType: 'redo'
      });
    } else {
      quiz = await Quiz.findOne({
        moduleId: moduleDoc._id,
        quizType: { $ne: 'redo' }
      });
    }

    if (
      !quiz ||
      quiz.questions.length !== 10 ||
      quiz.questions.some(q => q.options.length !== 4)
    ) {
      req.flash(
        'error',
        'A valid 10-question quiz is not available for this topic.'
      );
      return res.redirect(`/courses/${course.slug}`);
    }

    // Evaluate answers on the server
    let score = 0;
    const answerRecords = [];

    quiz.questions.forEach((q, idx) => {
      const submittedVal = answers[idx.toString()];

      const selectedOption =
        submittedVal !== undefined && submittedVal !== ''
          ? parseInt(submittedVal, 10)
          : -1;

      if (
        !Number.isInteger(selectedOption) ||
        selectedOption < -1 ||
        selectedOption > 3
      ) {
        throw new Error('Invalid answer selection received.');
      }

      const isCorrect = selectedOption === q.correctOptionIndex;

      if (isCorrect) {
        score += 1;
      }

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
    const percentage = Math.round(
      (score / totalQuestions) * 100
    );

    const passed = score >= (quiz.passingScore || 6);

    // Count previous attempts for this quiz
    const previousAttemptsCount = await QuizAttempt.countDocuments({
      userId: req.session.userId,
      quizId: quiz._id
    });

    // Save quiz attempt
    const attempt = new QuizAttempt({
      userId: req.session.userId,
      quizId: quiz._id,
      courseId: course._id,
      moduleId: moduleDoc._id,
      quizType: isRedoSubmission ? 'redo' : 'regular',
      isRedoAttempt: isRedoSubmission,
      attemptNumber: previousAttemptsCount + 1,
      answers: answerRecords,
      score,
      totalQuestions,
      percentage,
      passed
    });

    await attempt.save();

    // Update student progress when the quiz is passed
    if (passed) {
      if (!progress) {
        progress = new StudentProgress({
          userId: req.session.userId,
          courseId: course._id,
          completedModules: []
        });
      }

      const allModulesCount = await Module.countDocuments({
        courseId: course._id
      });

      if (isRedoSubmission) {
        // Track redo modules separately
        if (!progress.completedRedoModules) {
          progress.completedRedoModules = [];
        }

        const existingRedoIndex =
          progress.completedRedoModules.findIndex(
            m => m.moduleId.toString() === moduleDoc._id.toString()
          );

        if (existingRedoIndex > -1) {
          if (
            score >
            progress.completedRedoModules[existingRedoIndex].bestQuizScore
          ) {
            progress.completedRedoModules[existingRedoIndex].bestQuizScore = score;
          }
        } else {
          progress.completedRedoModules.push({
            moduleId: moduleDoc._id,
            completedAt: new Date(),
            bestQuizScore: score
          });
        }

        progress.redoCompletionPercentage = allModulesCount > 0
          ? Math.round(
              (progress.completedRedoModules.length / allModulesCount) * 100
            )
          : 100;

        // Mark redo complete after all modules are passed
        if (
          progress.completedRedoModules.length >= allModulesCount
        ) {
          progress.redoStatus = 'completed';
          progress.isRedoCompleted = true;
          progress.redoCount = (progress.redoCount || 0) + 1;
          progress.redoCompletedAt = new Date();
        }

        await progress.save();

      } else {
        // Update regular course progress
        const existingIndex = progress.completedModules.findIndex(
          m => m.moduleId.toString() === moduleDoc._id.toString()
        );

        if (existingIndex > -1) {
          if (
            score > progress.completedModules[existingIndex].bestQuizScore
          ) {
            progress.completedModules[existingIndex].bestQuizScore = score;
          }
        } else {
          progress.completedModules.push({
            moduleId: moduleDoc._id,
            completedAt: new Date(),
            bestQuizScore: score
          });
        }

        progress.completionPercentage = allModulesCount > 0
          ? Math.round(
              (progress.completedModules.length / allModulesCount) * 100
            )
          : 100;

        if (
          progress.completedModules.length >= allModulesCount
        ) {
          progress.isCourseCompleted = true;
          progress.completedAt = new Date();
        }

        await progress.save();
      }
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

    const materials = await StudyMaterial.find({
      courseId: attempt.courseId,
      isPublished: true
    })
      .populate('moduleId')
      .sort({ createdAt: -1 });

    const attemptHistory = await QuizAttempt.find({
      userId: req.session.userId,
      quizId: attempt.quizId
    }).sort({ createdAt: -1 });

    const progress = await StudentProgress.findOne({
      userId: req.session.userId,
      courseId: attempt.courseId
    });

    const isOriginalCompleted = Boolean(
      progress && progress.isCourseCompleted
    );

    const redoCount = progress
      ? (progress.redoCount || 0)
      : 0;

    const maxRedoAllowed = progress
      ? (progress.maxRedoAllowed || 1)
      : 1;

    const isRedoCompleted = Boolean(
      progress &&
      (
        progress.redoStatus === 'completed' ||
        redoCount >= maxRedoAllowed
      )
    );

    const canRedo = Boolean(
      isOriginalCompleted &&
      !isRedoCompleted &&
      redoCount < maxRedoAllowed
    );

    res.render('quizzes/result', {
      pageTitle: `Quiz Result: ${attempt.score}/10 - FocusLearn`,
      currentPath: '/courses',
      attempt,
      course,
      moduleDoc,
      quiz,
      materials,
      attemptHistory,
      progress,
      canRedo,
      isRedoCompleted,
      redoCount,
      maxRedoAllowed
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

    const materials = await StudyMaterial.find({
      courseId: attempt.courseId,
      isPublished: true
    })
      .populate('moduleId')
      .sort({ createdAt: -1 });

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
