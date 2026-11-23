const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Course = require('../models/Course');
const StudyMaterial = require('../models/StudyMaterial');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const {
  isValidYouTubeUrl,
  getYouTubeEmbedUrl,
  parseMaterialUpload,
  isValidMaterialExtension
} = require('../utils/materialHelper');

const makeSlug = (value) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const validUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

// Helper to safely extract options for question index
function extractQuestionOptions(body, i) {
  if (body['options_' + i] && Array.isArray(body['options_' + i])) {
    return body['options_' + i].map(v => String(v || '').trim());
  }
  if (body.options && body.options[i]) {
    const item = body.options[i];
    const arr = Array.isArray(item) ? item : Object.values(item);
    return arr.map(v => String(v || '').trim());
  }
  return [];
}

// =========================================================================
// 1. ADMIN DASHBOARD
// =========================================================================
exports.dashboard = async (req, res, next) => {
  try {
    const [subjectCount, moduleCount, quizCount, materialCount, studentCount] = await Promise.all([
      Course.countDocuments(),
      Module.countDocuments(),
      Quiz.countDocuments(),
      StudyMaterial.countDocuments(),
      User.countDocuments({ role: 'student' })
    ]);

    res.render('admin/dashboard', {
      pageTitle: 'Admin Dashboard - FocusLearn',
      subjectCount,
      moduleCount,
      quizCount,
      materialCount,
      studentCount
    });
  } catch (err) {
    next(err);
  }
};

// =========================================================================
// 2. SUBJECT / COURSE MANAGEMENT
// =========================================================================
exports.subjects = async (req, res, next) => {
  try {
    const selectedCourseId = req.query.courseId || '';
    const searchQuery = (req.query.search || '').trim();
    const selectedCategory = req.query.category || '';

    // Robust filter with MongoDB
    const filter = {};
    if (selectedCourseId) {
      if (mongoose.Types.ObjectId.isValid(selectedCourseId)) {
        filter._id = selectedCourseId;
      } else {
        // Safe empty filter when invalid course ID passed
        filter._id = new mongoose.Types.ObjectId();
      }
    }
    if (selectedCategory) {
      filter.category = selectedCategory;
    }
    if (searchQuery) {
      filter.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { code: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    const [allCourses, courses, moduleCounts] = await Promise.all([
      Course.find().sort({ order: 1, title: 1 }),
      Course.find(filter).sort({ order: 1, title: 1 }),
      Module.aggregate([
        { $group: { _id: '$courseId', count: { $sum: 1 } } }
      ])
    ]);

    const countMap = {};
    moduleCounts.forEach(m => { countMap[m._id.toString()] = m.count; });
    courses.forEach(c => {
      c.actualModuleCount = countMap[c._id.toString()] || 0;
    });
    allCourses.forEach(c => {
      c.actualModuleCount = countMap[c._id.toString()] || 0;
    });

    // Extract unique categories for category filter
    const categories = Array.from(new Set(allCourses.map(c => c.category).filter(Boolean)));

    res.render('admin/subjects', {
      pageTitle: 'Manage Courses & Subjects',
      allCourses,
      courses,
      categories,
      selectedCourseId,
      searchQuery,
      selectedCategory,
      message: req.query.message || '',
      error: req.query.error || ''
    });
  } catch (err) {
    next(err);
  }
};

exports.createSubject = async (req, res, next) => {
  try {
    const { title, code, description, image, durationHours, order, category } = req.body;

    if (!title || !code || !description || !image) {
      return res.redirect('/admin/subjects?error=' +
        encodeURIComponent('Please fill in title, code, description, and image URL.'));
    }

    const slug = makeSlug(title);

    await Course.create({
      title: title.trim(),
      code: code.trim().toUpperCase(),
      slug,
      description: description.trim(),
      image: image.trim(),
      durationHours: Number(durationHours) || 3,
      order: Number(order) || 1,
      category: category ? category.trim() : 'Master of Computer Applications',
      lessonCount: 0
    });

    res.redirect('/admin/subjects?message=' +
      encodeURIComponent('Course / Subject added successfully.'));
  } catch (err) {
    if (err.code === 11000) {
      return res.redirect('/admin/subjects?error=' +
        encodeURIComponent('Subject code or title already exists.'));
    }
    next(err);
  }
};

exports.editSubjectPage = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).send('Course not found.');
    }

    res.render('admin/edit-subject', {
      pageTitle: `Edit Subject: ${course.title}`,
      course,
      error: req.query.error || ''
    });
  } catch (err) {
    next(err);
  }
};

exports.updateSubject = async (req, res, next) => {
  try {
    const { title, code, description, image, durationHours, order, category } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).send('Subject not found.');
    }

    course.title = title.trim();
    course.code = code.trim().toUpperCase();
    course.slug = makeSlug(title);
    course.description = description.trim();
    course.image = image.trim();
    course.durationHours = Number(durationHours) || course.durationHours;
    course.order = Number(order) || 1;
    if (category) course.category = category.trim();

    await course.save();

    res.redirect('/admin/subjects?message=' +
      encodeURIComponent('Course updated successfully.'));
  } catch (err) {
    if (err.code === 11000) {
      return res.redirect(`/admin/subjects/${req.params.id}/edit?error=` +
        encodeURIComponent('Subject code or title already exists.'));
    }
    next(err);
  }
};

exports.deleteSubject = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).send('Subject not found.');
    }

    // Cascade delete modules, quizzes, quiz attempts, and materials
    await Module.deleteMany({ courseId: course._id });
    await Quiz.deleteMany({ courseId: course._id });
    await QuizAttempt.deleteMany({ courseId: course._id });
    await StudyMaterial.deleteMany({ courseId: course._id });

    res.redirect('/admin/subjects?message=' +
      encodeURIComponent('Course and all its modules, quizzes, and materials deleted.'));
  } catch (err) {
    next(err);
  }
};

// =========================================================================
// 3. TOPIC & MODULE MANAGEMENT
// =========================================================================
exports.modules = async (req, res, next) => {
  try {
    const selectedCourseId = req.query.courseId || '';
    const filter = selectedCourseId ? { courseId: selectedCourseId } : {};

    const [courses, modules, quizzes] = await Promise.all([
      Course.find().sort({ order: 1, title: 1 }),
      Module.find(filter).populate('courseId').sort({ courseId: 1, moduleNumber: 1 }),
      Quiz.find({}, 'moduleId title questions')
    ]);

    const quizMap = {};
    quizzes.forEach(q => {
      quizMap[q.moduleId.toString()] = {
        _id: q._id,
        title: q.title,
        questionCount: q.questions ? q.questions.length : 0
      };
    });

    res.render('admin/modules', {
      pageTitle: 'Manage Topics & Learning Modules',
      courses,
      modules,
      quizMap,
      selectedCourseId,
      message: req.query.message || '',
      error: req.query.error || ''
    });
  } catch (err) {
    next(err);
  }
};


exports.createModule = async (req, res, next) => {
  try {
    const {
      courseId,
      moduleNumber,
      title,
      summary,
      estimatedMinutes,
      materialType,
      pdfUrl,
      pptUrl,
      videoUrl,
      keyConcepts,
      content
    } = req.body;

    if (!courseId || !title || !summary) {
      return res.redirect(
        '/admin/modules?error=' +
        encodeURIComponent('Course, Topic Title, and Summary are required.')
      );
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.redirect(
        '/admin/modules?error=' +
        encodeURIComponent('Selected Course not found.')
      );
    }

    const mCount = await Module.countDocuments({
      courseId: course._id
    });

    const mNum = Number(moduleNumber) > 0
      ? Number(moduleNumber)
      : mCount + 1;

    const concepts = keyConcepts
      ? keyConcepts.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const estMinutes = Number(estimatedMinutes) > 0
      ? Number(estimatedMinutes)
      : 35;

    const selectedType = materialType || 'None';

    if (!['PDF', 'PPT', 'Video', 'None'].includes(selectedType)) {
      return res.redirect(
        '/admin/modules?error=' +
        encodeURIComponent('Invalid material type.')
      );
    }

    const cleanPdf = pdfUrl ? pdfUrl.trim() : '';
    const cleanPpt = pptUrl ? pptUrl.trim() : '';
    const cleanVideo = videoUrl ? videoUrl.trim() : '';

    if (selectedType === 'Video') {
      if (!cleanVideo || !isValidYouTubeUrl(cleanVideo)) {
        return res.redirect(
          '/admin/modules?error=' +
          encodeURIComponent('Please enter a valid YouTube video URL.')
        );
      }
    }

    if (selectedType === 'PDF' && !cleanPdf) {
      return res.redirect(
        '/admin/modules?error=' +
        encodeURIComponent('Please enter a PDF URL or path.')
      );
    }

    if (selectedType === 'PPT' && !cleanPpt) {
      return res.redirect(
        '/admin/modules?error=' +
        encodeURIComponent('Please enter a PPT/PPTX URL or path.')
      );
    }

    const newModule = await Module.create({
      courseId: course._id,
      moduleNumber: mNum,
      title: title.trim(),
      slug: makeSlug(title),
      summary: summary.trim(),
      estimatedMinutes: estMinutes,
      materialType: selectedType,
      pdfUrl: cleanPdf,
      pptUrl: cleanPpt,
      videoUrl: cleanVideo,
      keyConcepts: concepts,
      content: content ? content.trim() : summary.trim(),
      order: mNum,
      topics: [{
        topicNumber: 1,
        title: title.trim(),
        estimatedMinutes: estMinutes,
        pdfUrl: cleanPdf
      }]
    });

    // Recalculate course module count and duration
    const allMods = await Module.find({
      courseId: course._id
    });

    course.lessonCount = allMods.length;

    const totalMins = allMods.reduce(
      (sum, m) => sum + (m.estimatedMinutes || 0),
      0
    );

    course.durationHours = +(totalMins / 60).toFixed(1);

    await course.save();

    res.redirect(
      '/admin/modules?courseId=' + course._id +
      '&message=' +
      encodeURIComponent(
        `Topic "${newModule.title}" created successfully for ${course.code}.`
      )
    );

  } catch (err) {
    if (err.code === 11000) {
      return res.redirect(
        '/admin/modules?error=' +
        encodeURIComponent(
          'A module with this number or title already exists in this course.'
        )
      );
    }

    next(err);
  }
};

exports.editModulePage = async (req, res, next) => {
  try {
    const moduleDoc = await Module.findById(req.params.id).populate('courseId');
    if (!moduleDoc) {
      return res.status(404).send('Topic / Module not found.');
    }

    const courses = await Course.find().sort({ order: 1, title: 1 });

    res.render('admin/edit-module', {
      pageTitle: `Edit Topic: ${moduleDoc.title}`,
      moduleDoc,
      courses,
      error: req.query.error || ''
    });
  } catch (err) {
    next(err);
  }
};


exports.updateModule = async (req, res, next) => {
  try {
    const {
      moduleNumber,
      title,
      summary,
      estimatedMinutes,
      materialType,
      pdfUrl,
      pptUrl,
      videoUrl,
      keyConcepts,
      content
    } = req.body;

    const moduleDoc = await Module.findById(req.params.id);

    if (!moduleDoc) {
      return res.status(404).send('Topic / Module not found.');
    }

    if (moduleNumber) {
      moduleDoc.moduleNumber = Number(moduleNumber);
    }

    if (title) {
      moduleDoc.title = title.trim();
      moduleDoc.slug = makeSlug(title);
    }

    if (summary !== undefined) {
      moduleDoc.summary = summary.trim();
    }

    if (estimatedMinutes) {
      moduleDoc.estimatedMinutes = Number(estimatedMinutes);
    }

    const selectedType = materialType || 'None';

    if (!['PDF', 'PPT', 'Video', 'None'].includes(selectedType)) {
      return res.redirect(
        `/admin/modules/${req.params.id}/edit?error=` +
        encodeURIComponent('Invalid material type.')
      );
    }

    const cleanPdf = pdfUrl !== undefined
      ? pdfUrl.trim()
      : (moduleDoc.pdfUrl || '');

    const cleanPpt = pptUrl !== undefined
      ? pptUrl.trim()
      : (moduleDoc.pptUrl || '');

    const cleanVideo = videoUrl !== undefined
      ? videoUrl.trim()
      : (moduleDoc.videoUrl || '');

    if (selectedType === 'Video') {
      if (!cleanVideo || !isValidYouTubeUrl(cleanVideo)) {
        return res.redirect(
          `/admin/modules/${req.params.id}/edit?error=` +
          encodeURIComponent('Please enter a valid YouTube video URL.')
        );
      }
    }

    if (selectedType === 'PDF' && !cleanPdf) {
      return res.redirect(
        `/admin/modules/${req.params.id}/edit?error=` +
        encodeURIComponent('Please enter a PDF URL or path.')
      );
    }

    if (selectedType === 'PPT' && !cleanPpt) {
      return res.redirect(
        `/admin/modules/${req.params.id}/edit?error=` +
        encodeURIComponent('Please enter a PPT/PPTX URL or path.')
      );
    }

    moduleDoc.materialType = selectedType;
    moduleDoc.pdfUrl = cleanPdf;
    moduleDoc.pptUrl = cleanPpt;
    moduleDoc.videoUrl = cleanVideo;

    if (keyConcepts !== undefined) {
      moduleDoc.keyConcepts = keyConcepts
        ? keyConcepts.split(',').map(s => s.trim()).filter(Boolean)
        : [];
    }

    if (content !== undefined) {
      moduleDoc.content = content.trim();
    }

    if (moduleDoc.topics && moduleDoc.topics.length > 0) {
      moduleDoc.topics[0].title = moduleDoc.title;
      moduleDoc.topics[0].estimatedMinutes = moduleDoc.estimatedMinutes;
      moduleDoc.topics[0].pdfUrl = cleanPdf;
    }

    await moduleDoc.save();

    // Recalculate course duration
    const allMods = await Module.find({
      courseId: moduleDoc.courseId
    });

    const totalMins = allMods.reduce(
      (sum, m) => sum + (m.estimatedMinutes || 0),
      0
    );

    await Course.findByIdAndUpdate(moduleDoc.courseId, {
      lessonCount: allMods.length,
      durationHours: +(totalMins / 60).toFixed(1)
    });

    res.redirect(
      '/admin/modules?courseId=' + moduleDoc.courseId +
      '&message=' +
      encodeURIComponent('Topic updated successfully.')
    );

  } catch (err) {
    next(err);
  }
};


exports.deleteModule = async (req, res, next) => {
  try {
    const moduleDoc = await Module.findByIdAndDelete(req.params.id);
    if (!moduleDoc) {
      return res.status(404).send('Topic / Module not found.');
    }

    // Clean up associated Quiz and QuizAttempts
    await Quiz.deleteMany({ moduleId: moduleDoc._id });
    await QuizAttempt.deleteMany({ moduleId: moduleDoc._id });
    await StudyMaterial.deleteMany({ moduleId: moduleDoc._id });

    // Recalculate course lesson count and duration
    const allMods = await Module.find({ courseId: moduleDoc.courseId });
    const totalMins = allMods.reduce((sum, m) => sum + (m.estimatedMinutes || 0), 0);
    await Course.findByIdAndUpdate(moduleDoc.courseId, {
      lessonCount: allMods.length,
      durationHours: +(totalMins / 60).toFixed(1)
    });

    res.redirect('/admin/modules?courseId=' + moduleDoc.courseId + '&message=' +
      encodeURIComponent('Topic and its associated quizzes were deleted.'));
  } catch (err) {
    next(err);
  }
};

// =========================================================================
// 4. QUIZ MANAGEMENT
// =========================================================================
exports.quizzes = async (req, res, next) => {
  try {
    const selectedCourseId = req.query.courseId || '';
    const selectedQuizType = req.query.quizType || '';
    const targetModuleId = req.query.moduleId || '';

    const filter = {};
    if (selectedCourseId && mongoose.Types.ObjectId.isValid(selectedCourseId)) {
      filter.courseId = selectedCourseId;
    }
    if (selectedQuizType) {
      filter.quizType = selectedQuizType;
    }
    if (targetModuleId && mongoose.Types.ObjectId.isValid(targetModuleId)) {
      filter.moduleId = targetModuleId;
    }

    const [quizzes, courses, modules] = await Promise.all([
      Quiz.find(filter).populate('courseId moduleId').sort({ updatedAt: -1 }),
      Course.find().sort({ order: 1, title: 1 }),
      Module.find().populate('courseId').sort({ courseId: 1, moduleNumber: 1 })
    ]);

    res.render('admin/quizzes', {
      pageTitle: 'Manage Topic Quizzes',
      quizzes,
      courses,
      modules,
      targetModuleId,
      selectedCourseId,
      selectedQuizType,
      message: req.query.message || '',
      error: req.query.error || ''
    });
  } catch (err) {
    next(err);
  }
};

exports.saveQuiz = async (req, res, next) => {
  try {
    const { moduleId, title, passingScore, quizType = 'regular' } = req.body;
    const finalQuizType = (quizType === 'redo') ? 'redo' : 'regular';
    const moduleDoc = await Module.findById(moduleId);

    if (!moduleDoc) {
      return res.redirect('/admin/quizzes?error=' +
        encodeURIComponent('Please select a valid topic / module.'));
    }

    let texts = req.body.questionText;
    if (!Array.isArray(texts)) texts = texts ? [texts] : [];

    let explanations = req.body.explanation;
    if (!Array.isArray(explanations)) explanations = explanations ? [explanations] : [];

    let corrects = req.body.correctOptionIndex;
    if (!Array.isArray(corrects)) corrects = corrects !== undefined ? [corrects] : [];

    if (texts.length !== 10) {
      return res.redirect('/admin/quizzes?error=' +
        encodeURIComponent(`A quiz must contain exactly 10 questions. Received ${texts.length}.`));
    }

    const questions = [];

    for (let i = 0; i < 10; i++) {
      const qText = String(texts[i] || '').trim();
      const choices = extractQuestionOptions(req.body, i);
      const cIdx = Number(corrects[i]);
      const exp = String(explanations[i] || '').trim();

      if (!qText) {
        throw new Error(`Question ${i + 1} text cannot be empty.`);
      }
      if (choices.length !== 4 || choices.some(c => !c)) {
        throw new Error(`Question ${i + 1} must have all 4 options filled.`);
      }
      if (![0, 1, 2, 3].includes(cIdx)) {
        throw new Error(`Question ${i + 1} must have a valid correct option (1-4).`);
      }

      questions.push({
        questionText: qText,
        options: choices,
        correctOptionIndex: cIdx,
        explanation: exp || 'Review the module notes and key concepts to master this question.'
      });
    }

    const defaultSuffix = finalQuizType === 'redo' ? 'Redo Assessment' : 'Assessment';
    const quizTitle = title?.trim() || `${moduleDoc.title} ${defaultSuffix}`;
    const pScore = Math.min(10, Math.max(0, Number(passingScore) || 6));

    await Quiz.findOneAndUpdate(
      { moduleId: moduleDoc._id, quizType: finalQuizType },
      {
        courseId: moduleDoc.courseId,
        moduleId: moduleDoc._id,
        quizType: finalQuizType,
        title: quizTitle,
        passingScore: pScore,
        totalQuestions: 10,
        questions
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    const typeDesc = finalQuizType === 'redo' ? 'Redo Quiz' : 'Original Quiz';
    res.redirect('/admin/quizzes?message=' +
      encodeURIComponent(`${typeDesc} for "${moduleDoc.title}" saved successfully!`));
  } catch (err) {
    res.redirect('/admin/quizzes?error=' + encodeURIComponent(err.message || 'Unable to save quiz.'));
  }
};

exports.editQuizPage = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('courseId moduleId');
    if (!quiz) {
      return res.status(404).send('Quiz not found.');
    }

    res.render('admin/edit-quiz', {
      pageTitle: `Edit Quiz: ${quiz.title}`,
      quiz,
      error: req.query.error || ''
    });
  } catch (err) {
    next(err);
  }
};

exports.updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).send('Quiz not found.');
    }

    const { title, passingScore } = req.body;

    let texts = req.body.questionText;
    if (!Array.isArray(texts)) texts = texts ? [texts] : [];

    let explanations = req.body.explanation;
    if (!Array.isArray(explanations)) explanations = explanations ? [explanations] : [];

    let corrects = req.body.correctOptionIndex;
    if (!Array.isArray(corrects)) corrects = corrects !== undefined ? [corrects] : [];

    if (texts.length !== 10) {
      return res.redirect(`/admin/quizzes/${quiz._id}/edit?error=` +
        encodeURIComponent(`A quiz must contain exactly 10 questions. Received ${texts.length}.`));
    }

    const questions = [];

    for (let i = 0; i < 10; i++) {
      const qText = String(texts[i] || '').trim();
      const choices = extractQuestionOptions(req.body, i);
      const cIdx = Number(corrects[i]);
      const exp = String(explanations[i] || '').trim();

      if (!qText) throw new Error(`Question ${i + 1} text cannot be empty.`);
      if (choices.length !== 4 || choices.some(c => !c)) {
        throw new Error(`Question ${i + 1} must have all 4 options filled.`);
      }
      if (![0, 1, 2, 3].includes(cIdx)) {
        throw new Error(`Question ${i + 1} must have a valid correct option.`);
      }

      questions.push({
        questionText: qText,
        options: choices,
        correctOptionIndex: cIdx,
        explanation: exp || 'Review the module notes and key concepts.'
      });
    }

    quiz.title = title ? title.trim() : quiz.title;
    quiz.passingScore = Math.min(10, Math.max(0, Number(passingScore) || 6));
    if (req.body.quizType) {
      quiz.quizType = (req.body.quizType === 'redo') ? 'redo' : 'regular';
    }
    quiz.questions = questions;

    await quiz.save();

    res.redirect('/admin/quizzes?message=' +
      encodeURIComponent('Quiz updated successfully.'));
  } catch (err) {
    res.redirect(`/admin/quizzes/${req.params.id}/edit?error=` + encodeURIComponent(err.message || 'Error updating quiz.'));
  }
};

exports.deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (quiz) {
      await QuizAttempt.deleteMany({ quizId: quiz._id });
    }

    res.redirect('/admin/quizzes?message=' + encodeURIComponent('Quiz deleted successfully.'));
  } catch (err) {
    next(err);
  }
};

exports.quizResults = async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find()
      .populate('userId quizId courseId moduleId')
      .sort({ createdAt: -1 })
      .limit(500);

    res.render('admin/quiz-results', {
      pageTitle: 'Student Quiz Results - FocusLearn Admin',
      attempts
    });
  } catch (err) {
    next(err);
  }
};

// =========================================================================
// 5. STUDY MATERIAL MANAGEMENT (PDF, PPT/PPTX, YouTube Videos)
// =========================================================================
exports.materials = async (req, res, next) => {
  try {
    const selectedCourseId = req.query.courseId || '';
    const selectedType = req.query.materialType || '';

    const filter = {};
    if (selectedCourseId && mongoose.Types.ObjectId.isValid(selectedCourseId)) {
      filter.courseId = selectedCourseId;
    }
    if (selectedType) {
      filter.materialType = selectedType;
    }

    const [materials, courses, modules] = await Promise.all([
      StudyMaterial.find(filter).populate('courseId moduleId').sort({ createdAt: -1 }),
      Course.find().sort({ order: 1, title: 1 }),
      Module.find().populate('courseId').sort({ courseId: 1, moduleNumber: 1 })
    ]);

    res.render('admin/materials', {
      pageTitle: 'Manage Study Materials',
      materials,
      courses,
      modules,
      selectedCourseId,
      selectedType,
      message: req.query.message || '',
      error: req.query.error || ''
    });
  } catch (err) {
    next(err);
  }
};

exports.createMaterial = async (req, res, next) => {
  try {
    let body = req.body;
    let uploadedFile = null;

    const contentType = req.headers['content-type'] || '';
    const isMultipart = contentType.includes('multipart/form-data');
    if (isMultipart) {
      try {
        const parsed = await parseMaterialUpload(req);
        body = parsed.fields;
        uploadedFile = parsed.file;
      } catch (parseErr) {
        console.error('Multipart parse error:', parseErr);
        return res.redirect('/admin/materials?error=' + encodeURIComponent('File upload failed: ' + (parseErr.message || 'Parse error')));
      }
    }

    const {
      title, description, courseId, moduleId, topicNumber, materialType,
      materialUrl, content
    } = body;

    if (!title || !title.trim()) {
      return res.redirect('/admin/materials?error=' + encodeURIComponent('Material title is required.'));
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.redirect('/admin/materials?error=' + encodeURIComponent('Please select a valid subject/course.'));
    }

    if (!['PDF', 'PPT', 'Video', 'Link', 'Text'].includes(materialType)) {
      return res.redirect('/admin/materials?error=' + encodeURIComponent('Invalid material type. Allowed: PDF, PPT, Video, Link, Text.'));
    }

    let finalUrl = materialUrl ? materialUrl.trim() : '';
    let finalEmbedUrl = '';
    let fileName = '';
    let fileSize = 0;

    // Handle file upload (PDF or PPT/PPTX) — only process if a file was actually uploaded
    if (uploadedFile && uploadedFile.size > 0) {
      const originalName = uploadedFile.originalFilename || uploadedFile.name || uploadedFile.newFilename || 'material';
      const ext = path.extname(originalName).toLowerCase();

      if (materialType === 'PDF' && ext !== '.pdf') {
        return res.redirect('/admin/materials?error=' + encodeURIComponent('For PDF material, please upload a valid .pdf file.'));
      }
      if (materialType === 'PPT' && ext !== '.ppt' && ext !== '.pptx') {
        return res.redirect('/admin/materials?error=' + encodeURIComponent('For PPT material, please upload a valid .ppt or .pptx presentation file.'));
      }

      // Only allow file uploads for PDF and PPT types
      if (materialType !== 'PDF' && materialType !== 'PPT') {
        // Ignore uploaded file for Video/Link/Text types
        uploadedFile = null;
      } else {
        const safeBase = originalName.replace(/[^a-zA-Z0-9_.-]/g, '_');
        const targetFileName = Date.now() + '_' + safeBase;
        const targetPath = path.join(__dirname, '..', 'public', 'materials', targetFileName);

        const uploadedPath = uploadedFile.filepath || uploadedFile.path;
        if (uploadedPath && fs.existsSync(uploadedPath)) {
          fs.renameSync(uploadedPath, targetPath);
          finalUrl = '/materials/' + targetFileName;
          fileName = originalName;
          fileSize = uploadedFile.size;
        }
      }
    }

    // Material type specific validations
    if (materialType === 'Text') {
      if (!content || !content.trim()) {
        return res.redirect('/admin/materials?error=' + encodeURIComponent('Please enter written notes content.'));
      }
    } else if (materialType === 'Video') {
      if (!finalUrl) {
        return res.redirect('/admin/materials?error=' + encodeURIComponent('Please provide a valid YouTube video URL.'));
      }
      if (!isValidYouTubeUrl(finalUrl)) {
        return res.redirect('/admin/materials?error=' + encodeURIComponent('Invalid YouTube URL. Please paste a valid YouTube video URL (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...).'));
      }
      finalEmbedUrl = getYouTubeEmbedUrl(finalUrl) || '';
    } else if (materialType === 'PPT') {
      if (!finalUrl) {
        return res.redirect('/admin/materials?error=' + encodeURIComponent('Please upload a PPT/PPTX file or provide a presentation URL/path.'));
      }
      // Accept: uploaded file path (/materials/...), any http URL, or path with .ppt/.pptx
      const isLocal = finalUrl.startsWith('/materials/');
      const isWebUrl = validUrl(finalUrl);
      const hasPptExt = /\.(ppt|pptx)$/i.test(finalUrl);
      if (!isLocal && !isWebUrl && !hasPptExt) {
        return res.redirect('/admin/materials?error=' + encodeURIComponent('PPT must be an uploaded file, a valid web URL, or a path ending in .ppt/.pptx.'));
      }
    } else if (materialType === 'PDF') {
      if (!finalUrl) {
        return res.redirect('/admin/materials?error=' + encodeURIComponent('Please upload a PDF file or provide a valid PDF URL/path.'));
      }
      const isLocal = finalUrl.startsWith('/materials/');
      const isWebUrl = validUrl(finalUrl);
      const hasPdfExt = /\.pdf$/i.test(finalUrl);
      if (!isLocal && !isWebUrl && !hasPdfExt) {
        return res.redirect('/admin/materials?error=' + encodeURIComponent('PDF must be an uploaded file, a valid http/https URL, or a path ending in .pdf.'));
      }
    } else if (materialType === 'Link') {
      if (!finalUrl || !validUrl(finalUrl)) {
        return res.redirect('/admin/materials?error=' + encodeURIComponent('Please enter a valid external link (http/https).'));
      }
    }

    if (moduleId) {
      const selectedModule = await Module.findOne({ _id: moduleId, courseId });
      if (!selectedModule) {
        return res.redirect('/admin/materials?error=' + encodeURIComponent('The selected topic does not belong to that course.'));
      }
    }

    await StudyMaterial.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      courseId,
      moduleId: moduleId || null,
      topicNumber: topicNumber ? Number(topicNumber) : null,
      materialType,
      materialUrl: materialType === 'Text' ? '' : finalUrl,
      embedUrl: finalEmbedUrl,
      fileName,
      fileSize,
      content: materialType === 'Text' ? content.trim() : '',
      isPublished: true
    });

    res.redirect('/admin/materials?message=' +
      encodeURIComponent(`Study material (${materialType}) added successfully.`));
  } catch (err) {
    console.error('Create material error:', err);
    res.redirect('/admin/materials?error=' + encodeURIComponent(err.message || 'Error creating material.'));
  }
};

exports.editMaterialPage = async (req, res, next) => {
  try {
    const [material, courses, modules] = await Promise.all([
      StudyMaterial.findById(req.params.id),
      Course.find().sort({ order: 1 }),
      Module.find().sort({ moduleNumber: 1 })
    ]);

    if (!material) {
      return res.status(404).send('Material not found.');
    }

    res.render('admin/edit-material', {
      pageTitle: 'Edit Study Material',
      material,
      courses,
      modules,
      error: req.query.error || ''
    });
  } catch (err) {
    next(err);
  }
};

exports.updateMaterial = async (req, res, next) => {
  try {
    let body = req.body;
    let uploadedFile = null;

    const contentType = req.headers['content-type'] || '';
    const isMultipart = contentType.includes('multipart/form-data');
    if (isMultipart) {
      try {
        const parsed = await parseMaterialUpload(req);
        body = parsed.fields;
        uploadedFile = parsed.file;
      } catch (parseErr) {
        console.error('Multipart parse error (update):', parseErr);
        return res.redirect(`/admin/materials/${req.params.id}/edit?error=` + encodeURIComponent('File upload failed: ' + (parseErr.message || 'Parse error')));
      }
    }

    const {
      title, description, courseId, moduleId, topicNumber, materialType,
      materialUrl, content
    } = body;

    const [material, course] = await Promise.all([
      StudyMaterial.findById(req.params.id),
      Course.findById(courseId)
    ]);

    if (!material) {
      return res.status(404).send('Material not found.');
    }

    if (!course) {
      return res.redirect(`/admin/materials/${req.params.id}/edit?error=` +
        encodeURIComponent('Please select a valid subject.'));
    }

    if (!['PDF', 'PPT', 'Video', 'Link', 'Text'].includes(materialType)) {
      return res.redirect(`/admin/materials/${req.params.id}/edit?error=` +
        encodeURIComponent('Invalid material type.'));
    }

    let finalUrl = materialUrl ? materialUrl.trim() : material.materialUrl;
    let finalEmbedUrl = material.embedUrl || '';

    if (uploadedFile && uploadedFile.size > 0) {
      const originalName = uploadedFile.originalFilename || uploadedFile.name || uploadedFile.newFilename || 'material';
      const ext = path.extname(originalName).toLowerCase();

      if (materialType === 'PDF' && ext !== '.pdf') {
        return res.redirect(`/admin/materials/${req.params.id}/edit?error=` + encodeURIComponent('Please upload a valid .pdf file.'));
      }
      if (materialType === 'PPT' && ext !== '.ppt' && ext !== '.pptx') {
        return res.redirect(`/admin/materials/${req.params.id}/edit?error=` + encodeURIComponent('Please upload a valid .ppt or .pptx presentation file.'));
      }

      if (materialType === 'PDF' || materialType === 'PPT') {
        const safeBase = originalName.replace(/[^a-zA-Z0-9_.-]/g, '_');
        const targetFileName = Date.now() + '_' + safeBase;
        const targetPath = path.join(__dirname, '..', 'public', 'materials', targetFileName);

        const uploadedPath = uploadedFile.filepath || uploadedFile.path;
        if (uploadedPath && fs.existsSync(uploadedPath)) {
          fs.renameSync(uploadedPath, targetPath);
          finalUrl = '/materials/' + targetFileName;
          material.fileName = originalName;
          material.fileSize = uploadedFile.size;
        }
      }
    }

    if (materialType === 'Text') {
      if (!content || !content.trim()) {
        return res.redirect(`/admin/materials/${req.params.id}/edit?error=` + encodeURIComponent('Please enter the written material.'));
      }
    } else if (materialType === 'Video') {
      if (!finalUrl || !isValidYouTubeUrl(finalUrl)) {
        return res.redirect(`/admin/materials/${req.params.id}/edit?error=` + encodeURIComponent('Please enter a valid YouTube video URL.'));
      }
      finalEmbedUrl = getYouTubeEmbedUrl(finalUrl) || '';
    }

    if (moduleId) {
      const selectedModule = await Module.findOne({ _id: moduleId, courseId });
      if (!selectedModule) return res.redirect(`/admin/materials/${req.params.id}/edit?error=` + encodeURIComponent('The selected topic does not belong to that course.'));
    }

    material.title = title ? title.trim() : material.title;
    material.description = description ? description.trim() : '';
    material.courseId = courseId;
    material.moduleId = moduleId || null;
    material.topicNumber = topicNumber ? Number(topicNumber) : null;
    material.materialType = materialType;
    material.materialUrl = materialType === 'Text' ? '' : finalUrl;
    material.embedUrl = finalEmbedUrl;
    material.content = materialType === 'Text' ? content.trim() : '';

    await material.save();

    res.redirect('/admin/materials?message=' +
      encodeURIComponent('Study material updated successfully.'));
  } catch (err) {
    console.error('Update material error:', err);
    res.redirect(`/admin/materials/${req.params.id}/edit?error=` + encodeURIComponent(err.message || 'Error updating material.'));
  }
};

exports.deleteMaterial = async (req, res, next) => {
  try {
    await StudyMaterial.findByIdAndDelete(req.params.id);
    res.redirect('/admin/materials?message=' + encodeURIComponent('Study material deleted.'));
  } catch (err) {
    next(err);
  }
};

exports.toggleMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).send('Material not found.');
    }

    material.isPublished = !material.isPublished;
    await material.save();

    res.redirect('/admin/materials?message=' + encodeURIComponent('Material visibility updated.'));
  } catch (err) {
    next(err);
  }
};
