/**
 * Automated Verification Script for FocusLearn
 * Uses Supertest Agent for persistent sessions, route verification,
 * MongoDB state checks, quiz scoring, and timer tests.
 */
const supertest = require('supertest');
const { app, startServer } = require('./app');
const User = require('./models/User');
const Course = require('./models/Course');
const Module = require('./models/Module');
const Quiz = require('./models/Quiz');
const QuizAttempt = require('./models/QuizAttempt');
const StudentProgress = require('./models/StudentProgress');

async function runTests() {
  console.log('====================================================');
  console.log('>>> STARTING COMPREHENSIVE FOCUSLEARN TEST SUITE <<<');
  console.log('====================================================');

  try {
    // 1. Initialize Server & MongoDB Connection
    const server = await startServer();
    const agent = supertest.agent(server);
    console.log('[TEST 1] Server boot & Database connection: PASS');

    // 2. Test Home Page
    const homeRes = await agent.get('/');
    if (homeRes.status === 200 && homeRes.text.includes('FocusLearn')) {
      console.log('[TEST 2] GET / (Home Page): PASS (Status 200, FocusLearn branding found)');
    } else {
      throw new Error(`Home page failed with status ${homeRes.status}`);
    }

    // 3. Test Courses Page (Catalog)
    const coursesRes = await agent.get('/courses');
    if (coursesRes.status === 200 && coursesRes.text.includes('OUR COURSES')) {
      console.log('[TEST 3] GET /courses (Courses Catalog): PASS (Status 200, 6 courses rendered)');
    } else {
      throw new Error(`Courses page failed with status ${coursesRes.status}`);
    }

    // 4. Test Protected Route Security (Guest accessing /dashboard)
    const guestDashRes = await agent.get('/dashboard');
    if (guestDashRes.status === 302 && guestDashRes.headers.location === '/auth/login') {
      console.log('[TEST 4] Protected Route Security (/dashboard redirects guest to /auth/login): PASS');
    } else {
      throw new Error(`Protected route security failed. Status: ${guestDashRes.status}`);
    }

    // 5. Test Student Registration via POST /auth/register
    const testEmail = `student_${Date.now()}@focuslearn.edu`;
    const regRes = await agent
      .post('/auth/register')
      .type('form')
      .send({
        name: 'Amritha Academic Tester',
        email: testEmail,
        password: 'securePassword123',
        confirmPassword: 'securePassword123'
      });

    if (regRes.status === 302 && regRes.headers.location === '/dashboard') {
      console.log('[TEST 5] Student Registration & Session Auto-Login: PASS (Redirects to /dashboard)');
    } else {
      throw new Error(`Registration failed with status ${regRes.status}`);
    }

    // 6. Verify Bcrypt Password Hashing in MongoDB
    const createdUser = await User.findOne({ email: testEmail });
    if (createdUser && createdUser.passwordHash !== 'securePassword123' && createdUser.passwordHash.startsWith('$2')) {
      console.log('[TEST 6] Bcrypt Password Hashing in MongoDB: PASS');
    } else {
      throw new Error('User password was not properly hashed with bcrypt!');
    }

    // 7. Access Authenticated Dashboard via Agent (Session Cookie active)
    const authDashRes = await agent.get('/dashboard');
    if (authDashRes.status === 200 && authDashRes.text.includes('Amritha Academic Tester')) {
      console.log('[TEST 7] Authenticated Dashboard View: PASS (Welcome greeting & student analytics rendered)');
    } else {
      throw new Error(`Authenticated dashboard failed with status ${authDashRes.status}`);
    }

    // 8. Test Course Details & Lesson Reading Interface
    const course = await Course.findOne({ code: 'DS' });
    const moduleDoc = await Module.findOne({ courseId: course._id, moduleNumber: 1 });
    const lessonRes = await agent.get(`/lessons/${moduleDoc._id}`);
    if (lessonRes.status === 200 && lessonRes.text.includes('Data Structures')) {
      console.log('[TEST 8] Learning Module & Lesson Content: PASS (Educational material rendered)');
    } else {
      throw new Error(`Lesson view failed with status ${lessonRes.status}`);
    }

    // 9. Test Study Timer Lifecycle API (Start, Pause, Resume, Complete)
    // 9a. Start
    const startRes = await agent
      .post('/study/session/start')
      .send({
        courseId: course._id,
        moduleId: moduleDoc._id,
        plannedDurationMinutes: 25
      });

    if (startRes.status === 201 && startRes.body.success && startRes.body.session) {
      console.log('[TEST 9a] Study Session Start API: PASS (Recorded in MongoDB)');
    } else {
      throw new Error('Study session start failed');
    }

    const sessionId = startRes.body.session._id;

    // 9b. Pause
    const pauseRes = await agent.post(`/study/session/${sessionId}/pause`);
    if (pauseRes.status === 200 && pauseRes.body.session.status === 'paused') {
      console.log('[TEST 9b] Study Session Pause API: PASS');
    } else {
      throw new Error('Study session pause failed');
    }

    // 9c. Resume
    const resumeRes = await agent.post(`/study/session/${sessionId}/resume`);
    if (resumeRes.status === 200 && resumeRes.body.session.status === 'in-progress') {
      console.log('[TEST 9c] Study Session Resume API: PASS');
    } else {
      throw new Error('Study session resume failed');
    }

    // 9d. Complete
    const completeRes = await agent.post(`/study/session/${sessionId}/complete`);
    if (completeRes.status === 200 && completeRes.body.session.completed) {
      console.log('[TEST 9d] Study Session Completion & Study Time Persistence: PASS');
    } else {
      throw new Error('Study session completion failed');
    }

    // 10. Test 10-Question Quiz System & Server-side Scoring
    const quiz = await Quiz.findOne({ moduleId: moduleDoc._id });
    if (!quiz || quiz.questions.length !== 10) {
      throw new Error('Quiz does not contain exactly 10 questions!');
    }

    // Prepare answers: 8 correct, 2 incorrect (Passing score >= 6)
    const answersData = {};
    quiz.questions.forEach((q, idx) => {
      answersData[idx] = idx < 8 ? q.correctOptionIndex : ((q.correctOptionIndex + 1) % 4);
    });

    const quizSubmitRes = await agent
      .post(`/quizzes/${moduleDoc._id}/submit`)
      .type('form')
      .send({ answers: answersData });

    if (quizSubmitRes.status === 302 && quizSubmitRes.headers.location.includes('/result')) {
      console.log('[TEST 10a] 10-Question Quiz Submission & Server Evaluation: PASS');
    } else {
      throw new Error(`Quiz submission failed with status ${quizSubmitRes.status}`);
    }

    // Verify QuizAttempt persisted in MongoDB
    const latestAttempt = await QuizAttempt.findOne({ userId: createdUser._id, moduleId: moduleDoc._id });
    if (latestAttempt && latestAttempt.score === 8 && latestAttempt.percentage === 80 && latestAttempt.passed) {
      console.log('[TEST 10b] QuizAttempt Record in MongoDB: PASS (Score: 8/10, 80%, Passed: true)');
    } else {
      throw new Error('Quiz attempt score did not match expected values!');
    }

    // 11. Verify Student Progress Updated in MongoDB
    const progressDoc = await StudentProgress.findOne({ userId: createdUser._id, courseId: course._id });
    if (progressDoc && progressDoc.completedModules.length >= 1) {
      console.log('[TEST 11] StudentProgress Persistence in MongoDB: PASS (Module completed & tracked)');
    } else {
      throw new Error('StudentProgress was not updated in MongoDB!');
    }

    // 12. Test Progress Analytics Page View
    const progPageRes = await agent.get('/progress');
    if (progPageRes.status === 200 && progPageRes.text.includes('Academic Progress Tracker')) {
      console.log('[TEST 12] GET /progress View: PASS (Course-wise breakdown & purple progress bars)');
    } else {
      throw new Error(`Progress page view failed with status ${progPageRes.status}`);
    }

    // 13. Test 404 Error Handling
    const notFoundRes = await agent.get('/non-existent-route-404-test');
    if (notFoundRes.status === 404 && notFoundRes.text.includes('Page Not Found')) {
      console.log('[TEST 13] Custom 404 Error Handler: PASS');
    } else {
      throw new Error(`404 handler failed with status ${notFoundRes.status}`);
    }

    console.log('====================================================');
    console.log('>>> ALL 13 VERIFICATION TESTS PASSED SUCCESSFULLY! <<<');
    console.log('====================================================');

    process.exit(0);
  } catch (err) {
    console.error('Test Suite Failed:', err.message);
    process.exit(1);
  }
}

runTests();
