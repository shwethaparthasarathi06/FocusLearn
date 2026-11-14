const express = require('express');
const router = express.Router();

const {
  ensureAuthenticated,
  ensureAdmin
} = require('../middleware/auth');

const adminController = require('../controllers/adminController');

// All admin operations require authentication and admin role
router.use(ensureAuthenticated, ensureAdmin);

// Dashboard
router.get('/', adminController.dashboard);

// 1. Subject / Course Management
router.get('/subjects', adminController.subjects);
router.post('/subjects', adminController.createSubject);
router.get('/subjects/:id/edit', adminController.editSubjectPage);
router.put('/subjects/:id', adminController.updateSubject);
router.delete('/subjects/:id', adminController.deleteSubject);

// 2. Topic & Module Management
router.get('/modules', adminController.modules);
router.post('/modules', adminController.createModule);
router.get('/modules/:id/edit', adminController.editModulePage);
router.put('/modules/:id', adminController.updateModule);
router.delete('/modules/:id', adminController.deleteModule);

// 3. Topic Quiz Management
router.get('/quizzes', adminController.quizzes);
router.post('/quizzes', adminController.saveQuiz);
router.get('/quizzes/:id/edit', adminController.editQuizPage);
router.put('/quizzes/:id', adminController.updateQuiz);
router.delete('/quizzes/:id', adminController.deleteQuiz);
router.get('/quiz-results', adminController.quizResults);

// 4. Study Material Management
router.get('/materials', adminController.materials);
router.post('/materials', adminController.createMaterial);
router.get('/materials/:id/edit', adminController.editMaterialPage);
router.put('/materials/:id', adminController.updateMaterial);
router.delete('/materials/:id', adminController.deleteMaterial);
router.post('/materials/:id/toggle', adminController.toggleMaterial);

module.exports = router;
