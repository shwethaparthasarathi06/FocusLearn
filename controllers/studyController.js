const StudySession = require('../models/StudySession');
const Course = require('../models/Course');
const Module = require('../models/Module');
const StudentProgress = require('../models/StudentProgress');
const Quiz = require('../models/Quiz');
const StudyMaterial = require('../models/StudyMaterial');

/**
 * Render Study Room Page (PDF + Timer together)
 */
exports.getStudyRoom = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const Module = require('../models/Module');
    const Course = require('../models/Course');

    const mod = await Module.findById(moduleId);
    if (!mod) return res.status(404).render('error', { message: 'Module not found' });

    const course = await Course.findById(mod.courseId);
    if (!course) return res.status(404).render('error', { message: 'Course not found' });
    const materials = await StudyMaterial.find({ courseId: course._id, isPublished: true }).populate('moduleId').sort({ createdAt: -1 });

    // Get the PDF URL from the first topic or module pdfUrl
    const pdfUrl = (mod.topics && mod.topics.length > 0 && mod.topics[0].pdfUrl) ? mod.topics[0].pdfUrl : (mod.pdfUrl || null);

    // Check for active session
    const activeSession = await StudySession.findOne({
      userId: req.session.userId,
      status: { $in: ['in-progress', 'paused', 'break'] }
    }).populate('courseId moduleId');

    const testDuration = req.query.duration ? parseInt(req.query.duration, 10) : null;

    let progress = null;
    if (req.session.userId) {
      progress = await StudentProgress.findOne({
        userId: req.session.userId,
        courseId: course._id
      });
    }

    res.render('study/room', {
      pageTitle: `${mod.title} - Study Room`,
      currentPath: '/study/room',
      mod,
      course,
      pdfUrl,
      activeSession,
      testDuration,
      progress,
      materials
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Render Study Timer Page
 */
exports.getTimerPage = async (req, res, next) => {
  try {
    const { course: queryCourse, module: queryModule } = req.query;

    const courses = await Course.find().sort({ order: 1 });
    const modules = await Module.find().sort({ courseId: 1, moduleNumber: 1 });

    // Check if the user has an existing ongoing session
    const activeSession = await StudySession.findOne({
      userId: req.session.userId,
      status: { $in: ['in-progress', 'paused', 'break'] }
    }).populate('courseId moduleId');

    res.render('study/timer', {
      pageTitle: 'Study Timer - FocusLearn',
      currentPath: '/study/timer',
      courses,
      modules,
      selectedCourseId: queryCourse || '',
      selectedModuleId: queryModule || '',
      activeSession
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Start a new Study Session
 */
exports.postStartSession = async (req, res, next) => {
  try {
    const { courseId, moduleId, plannedDurationMinutes } = req.body;

    if (!courseId || !moduleId || !plannedDurationMinutes) {
      return res.status(400).json({ success: false, message: 'Missing required session parameters.' });
    }

    // Cancel any previous incomplete sessions
    await StudySession.updateMany(
      { userId: req.session.userId, status: { $in: ['in-progress', 'paused', 'break'] } },
      { $set: { status: 'cancelled', endTime: new Date() } }
    );

    const session = new StudySession({
      userId: req.session.userId,
      courseId,
      moduleId,
      plannedDurationMinutes: parseInt(plannedDurationMinutes, 10),
      startTime: new Date(),
      status: 'in-progress'
    });

    await session.save();
    const populated = await StudySession.findById(session._id).populate('courseId moduleId');

    res.status(201).json({ success: true, session: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Pause Session
 */
exports.postPauseSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await StudySession.findOne({ _id: id, userId: req.session.userId });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found or unauthorized.' });
    }

    if (session.status !== 'in-progress') {
      return res.status(400).json({ success: false, message: 'Session is not currently active.' });
    }

    session.status = 'paused';
    session.pauseIntervals.push({
      pausedAt: new Date()
    });

    await session.save();
    const populated = await StudySession.findById(session._id).populate('courseId moduleId');
    res.json({ success: true, session: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Resume Session
 */
exports.postResumeSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await StudySession.findOne({ _id: id, userId: req.session.userId });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found or unauthorized.' });
    }

    if (session.status !== 'paused' && session.status !== 'break') {
      return res.status(400).json({ success: false, message: 'Session is not paused.' });
    }

    const now = new Date();
    // Close the last pause interval
    if (session.pauseIntervals.length > 0) {
      const lastPause = session.pauseIntervals[session.pauseIntervals.length - 1];
      if (!lastPause.resumedAt) {
        lastPause.resumedAt = now;
        const diffSeconds = Math.max(0, Math.floor((now.getTime() - new Date(lastPause.pausedAt).getTime()) / 1000));
        lastPause.durationSeconds = diffSeconds;
        session.totalPausedSeconds = (session.totalPausedSeconds || 0) + diffSeconds;
      }
    }

    session.status = 'in-progress';
    await session.save();
    const populated = await StudySession.findById(session._id).populate('courseId moduleId');
    res.json({ success: true, session: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Take Break (5m)
 */
exports.postBreakSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await StudySession.findOne({ _id: id, userId: req.session.userId });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found or unauthorized.' });
    }

    session.status = 'break';
    session.pauseIntervals.push({
      pausedAt: new Date()
    });

    await session.save();
    const populated = await StudySession.findById(session._id).populate('courseId moduleId');
    res.json({ success: true, session: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Extend Session (+5m)
 */
exports.postExtendSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { minutes } = req.body;
    const extension = parseInt(minutes, 10) || 5;

    const session = await StudySession.findOne({ _id: id, userId: req.session.userId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found or unauthorized.' });
    }

    session.extendedMinutes = (session.extendedMinutes || 0) + extension;
    await session.save();
    const populated = await StudySession.findById(session._id).populate('courseId moduleId');
    res.json({ success: true, session: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Complete Study Session
 */
exports.postCompleteSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await StudySession.findOne({ _id: id, userId: req.session.userId });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found or unauthorized.' });
    }

    const now = new Date();
    session.endTime = now;

    // If currently paused, close out the open pause interval
    if (session.status === 'paused' || session.status === 'break') {
      if (session.pauseIntervals.length > 0) {
        const lastPause = session.pauseIntervals[session.pauseIntervals.length - 1];
        if (!lastPause.resumedAt) {
          lastPause.resumedAt = now;
          const diffSeconds = Math.max(0, Math.floor((now.getTime() - new Date(lastPause.pausedAt).getTime()) / 1000));
          lastPause.durationSeconds = diffSeconds;
          session.totalPausedSeconds = (session.totalPausedSeconds || 0) + diffSeconds;
        }
      }
    }

    // Authoritative server-side study duration calculation
    const totalElapsedSeconds = Math.max(0, Math.floor((now.getTime() - new Date(session.startTime).getTime()) / 1000));
    const actualStudySeconds = Math.max(0, totalElapsedSeconds - (session.totalPausedSeconds || 0));

    session.actualDurationSeconds = actualStudySeconds;
    session.status = 'completed';
    session.completed = true;
    await session.save();

    // Persist to StudentProgress
    await StudentProgress.findOneAndUpdate(
      { userId: req.session.userId, courseId: session.courseId },
      {
        $inc: { totalStudyTimeSeconds: actualStudySeconds }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      message: 'Study session completed successfully!',
      session
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Cancel Session by ID
 */
exports.postCancelSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    await StudySession.findOneAndUpdate(
      { _id: id, userId: req.session.userId },
      { $set: { status: 'cancelled', endTime: new Date() } }
    );
    res.json({ success: true, message: 'Session cancelled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Cancel Any Active Session for User
 */
exports.postCancelActiveSession = async (req, res, next) => {
  try {
    await StudySession.updateMany(
      { userId: req.session.userId, status: { $in: ['in-progress', 'paused', 'break'] } },
      { $set: { status: 'cancelled', endTime: new Date() } }
    );
    res.json({ success: true, message: 'Active sessions cancelled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Complete Single Module
 */
exports.postCompleteModule = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const userId = req.session.userId;

    const mod = await Module.findById(moduleId);
    if (!mod) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const course = await Course.findById(mod.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const allModules = await Module.find({ courseId: course._id });
    const totalModulesCount = allModules.length || 1;

    let progress = await StudentProgress.findOne({ userId, courseId: course._id });
    if (!progress) {
      progress = new StudentProgress({
        userId,
        courseId: course._id,
        completedModules: [],
        totalStudyTimeSeconds: 0
      });
    }

    const now = new Date();
    const existingIndex = progress.completedModules.findIndex(
      m => m.moduleId.toString() === mod._id.toString()
    );

    if (existingIndex === -1) {
      progress.completedModules.push({
        moduleId: mod._id,
        completedAt: now,
        bestQuizScore: 100
      });
    } else {
      progress.completedModules[existingIndex].completedAt = now;
    }

    // Calculate completion percentage based on modules completed
    const completedCount = progress.completedModules.length;
    const percentage = Math.min(100, Math.round((completedCount / totalModulesCount) * 100));
    progress.completionPercentage = percentage;

    if (completedCount >= totalModulesCount) {
      progress.isCourseCompleted = true;
      progress.completedAt = now;
    } else {
      progress.isCourseCompleted = false;
    }

    // Close any active study session for this user/module
    const activeSession = await StudySession.findOne({
      userId,
      moduleId: mod._id,
      status: { $in: ['in-progress', 'paused', 'break'] }
    });

    if (activeSession) {
      activeSession.endTime = now;
      const totalElapsedSeconds = Math.max(0, Math.floor((now.getTime() - new Date(activeSession.startTime).getTime()) / 1000));
      const actualStudySeconds = Math.max(0, totalElapsedSeconds - (activeSession.totalPausedSeconds || 0));
      activeSession.actualDurationSeconds = actualStudySeconds;
      activeSession.status = 'completed';
      activeSession.completed = true;
      await activeSession.save();

      progress.totalStudyTimeSeconds = (progress.totalStudyTimeSeconds || 0) + actualStudySeconds;
    }

    await progress.save();

    res.json({
      success: true,
      message: `Module "${mod.title}" completed successfully!`,
      isModuleCompleted: true,
      isCourseCompleted: progress.isCourseCompleted,
      completionPercentage: progress.completionPercentage,
      completedModulesCount: progress.completedModules.length,
      totalModulesCount,
      courseSlug: course.slug
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Complete Entire Course
 */
exports.postCompleteCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.session.userId;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const modules = await Module.find({ courseId: course._id });

    let progress = await StudentProgress.findOne({ userId, courseId: course._id });
    if (!progress) {
      progress = new StudentProgress({
        userId,
        courseId: course._id,
        completedModules: [],
        totalStudyTimeSeconds: 0
      });
    }

    // Mark all modules of this course as completed
    const now = new Date();
    modules.forEach(mod => {
      const exists = progress.completedModules.some(
        m => m.moduleId.toString() === mod._id.toString()
      );
      if (!exists) {
        progress.completedModules.push({
          moduleId: mod._id,
          completedAt: now,
          bestQuizScore: 100
        });
      }
    });

    progress.isCourseCompleted = true;
    progress.completionPercentage = 100;
    progress.completedAt = now;

    // Close any active study session for this user/course
    const activeSession = await StudySession.findOne({
      userId,
      courseId: course._id,
      status: { $in: ['in-progress', 'paused', 'break'] }
    });

    if (activeSession) {
      activeSession.endTime = now;
      const totalElapsedSeconds = Math.max(0, Math.floor((now.getTime() - new Date(activeSession.startTime).getTime()) / 1000));
      const actualStudySeconds = Math.max(0, totalElapsedSeconds - (activeSession.totalPausedSeconds || 0));
      activeSession.actualDurationSeconds = actualStudySeconds;
      activeSession.status = 'completed';
      activeSession.completed = true;
      await activeSession.save();

      progress.totalStudyTimeSeconds = (progress.totalStudyTimeSeconds || 0) + actualStudySeconds;
    }

    await progress.save();

    res.json({
      success: true,
      message: `Course "${course.title}" completed successfully!`,
      isCourseCompleted: true,
      courseSlug: course.slug
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Complete the current study session and send the student to this module's quiz.
// The endpoint is used by both the Complete button and the countdown reaching zero.
exports.postOpenModuleQuiz = async (req, res) => {
  try {
    const moduleDoc = await Module.findById(req.params.moduleId);
    if (!moduleDoc) return res.status(404).json({ success: false, message: 'Topic not found.' });
    const quiz = await Quiz.findOne({ moduleId: moduleDoc._id });
    if (!quiz) return res.status(404).json({ success: false, message: 'The quiz for this topic has not been added by the admin yet.' });

    const activeSession = await StudySession.findOne({
      userId: req.session.userId,
      moduleId: moduleDoc._id,
      status: { $in: ['in-progress', 'paused', 'break'] }
    });
    if (activeSession) {
      const now = new Date();
      const elapsed = Math.max(0, Math.floor((now - new Date(activeSession.startTime)) / 1000));
      activeSession.endTime = now;
      activeSession.actualDurationSeconds = Math.max(0, elapsed - (activeSession.totalPausedSeconds || 0));
      activeSession.status = 'completed';
      activeSession.completed = true;
      await activeSession.save();
      await StudentProgress.findOneAndUpdate(
        { userId: req.session.userId, courseId: moduleDoc.courseId },
        { $inc: { totalStudyTimeSeconds: activeSession.actualDurationSeconds } },
        { upsert: true, setDefaultsOnInsert: true }
      );
    }
    return res.json({ success: true, redirectUrl: `/quizzes/${moduleDoc._id}` });
  } catch (err) {
    console.error('Open quiz error:', err);
    return res.status(500).json({ success: false, message: 'Unable to open the quiz. Please try again.' });
  }
};
