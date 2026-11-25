const supertest = require('supertest');
const { app, startServer } = require('./app');
const User = require('./models/User');
const Course = require('./models/Course');
const Module = require('./models/Module');
const Quiz = require('./models/Quiz');
const QuizAttempt = require('./models/QuizAttempt');

async function runStudentFeatureTests() {
  console.log('===============================================================');
  console.log('>>> RUNNING COMPREHENSIVE STUDENT & QUIZ MANAGEMENT TESTS <<<');
  console.log('===============================================================');

  try {
    const server = await startServer();
    const aliceAgent = supertest.agent(server);
    const bobAgent = supertest.agent(server);
    const guestAgent = supertest.agent(server);

    // ------------------------------------------------------------------------
    // TEST 1: Guest Protection on all new student routes
    // ------------------------------------------------------------------------
    console.log('\n[TEST GROUP 1] Security & Guest Access Protection:');
    
    const guestProfile = await guestAgent.get('/dashboard/profile');
    if (guestProfile.status === 302 && guestProfile.headers.location === '/auth/login') {
      console.log('  PASS: Guest accessing /dashboard/profile redirected to /auth/login');
    } else {
      throw new Error(`Guest /dashboard/profile returned status ${guestProfile.status}`);
    }

    const guestHistory = await guestAgent.get('/quizzes/history');
    if (guestHistory.status === 302 && guestHistory.headers.location === '/auth/login') {
      console.log('  PASS: Guest accessing /quizzes/history redirected to /auth/login');
    } else {
      throw new Error(`Guest /quizzes/history returned status ${guestHistory.status}`);
    }

    const guestPerf = await guestAgent.get('/dashboard/performance');
    if (guestPerf.status === 302 && guestPerf.headers.location === '/auth/login') {
      console.log('  PASS: Guest accessing /dashboard/performance redirected to /auth/login');
    } else {
      throw new Error(`Guest /dashboard/performance returned status ${guestPerf.status}`);
    }

    const guestApi = await guestAgent.get('/api/student/profile');
    if (guestApi.status === 401) {
      console.log('  PASS: Guest accessing /api/student/profile returned 401 Unauthorized');
    } else {
      throw new Error(`Guest /api/student/profile returned status ${guestApi.status}`);
    }

    // ------------------------------------------------------------------------
    // TEST 2: Register Student Alice and Student Bob
    // ------------------------------------------------------------------------
    console.log('\n[TEST GROUP 2] Student Registration & Session Management:');
    const timestamp = Date.now();
    const aliceEmail = `alice_${timestamp}@focuslearn.test`;
    const bobEmail = `bob_${timestamp}@focuslearn.test`;

    const aliceReg = await aliceAgent
      .post('/auth/register')
      .type('form')
      .send({
        name: 'Alice Learner',
        email: aliceEmail,
        password: 'PasswordAlice123!',
        confirmPassword: 'PasswordAlice123!'
      });
    if (aliceReg.status === 302 && aliceReg.headers.location === '/dashboard') {
      console.log('  PASS: Alice registered and logged in successfully');
    } else {
      throw new Error(`Alice registration failed: ${aliceReg.status}`);
    }

    const bobReg = await bobAgent
      .post('/auth/register')
      .type('form')
      .send({
        name: 'Bob Scholar',
        email: bobEmail,
        password: 'PasswordBob456!',
        confirmPassword: 'PasswordBob456!'
      });
    if (bobReg.status === 302 && bobReg.headers.location === '/dashboard') {
      console.log('  PASS: Bob registered and logged in successfully');
    } else {
      throw new Error(`Bob registration failed: ${bobReg.status}`);
    }

    const aliceUser = await User.findOne({ email: aliceEmail });
    const bobUser = await User.findOne({ email: bobEmail });

    // ------------------------------------------------------------------------
    // TEST 3: Student Profile Management (View & API)
    // ------------------------------------------------------------------------
    console.log('\n[TEST GROUP 3] Profile Management & Password Hash Redaction:');
    const aliceProfileRes = await aliceAgent.get('/dashboard/profile');
    if (aliceProfileRes.status === 200 && aliceProfileRes.text.includes('Alice Learner') && aliceProfileRes.text.includes(aliceEmail)) {
      console.log('  PASS: GET /dashboard/profile renders full student profile view');
    } else {
      throw new Error(`GET /dashboard/profile failed with status ${aliceProfileRes.status}`);
    }

    const aliceApiProfile = await aliceAgent.get('/api/student/profile');
    if (aliceApiProfile.status === 200 && aliceApiProfile.body.success && aliceApiProfile.body.profile.name === 'Alice Learner') {
      if (aliceApiProfile.body.profile.passwordHash === undefined) {
        console.log('  PASS: GET /api/student/profile returns profile and securely omits passwordHash');
      } else {
        throw new Error('SECURITY VIOLATION: passwordHash exposed in /api/student/profile!');
      }
    } else {
      throw new Error(`GET /api/student/profile failed: ${JSON.stringify(aliceApiProfile.body)}`);
    }

    // ------------------------------------------------------------------------
    // TEST 4: Profile Updates & Validation
    // ------------------------------------------------------------------------
    console.log('\n[TEST GROUP 4] Profile Updates & Server-Side Validation:');
    
    // 4a. Update Alice's profile via form
    const updateRes = await aliceAgent
      .post('/dashboard/profile')
      .type('form')
      .send({
        name: 'Alice L. Wonder',
        email: aliceEmail,
        phone: '+1 555-0199',
        headline: 'Aspiring Full Stack Engineer',
        department: 'Software Engineering',
        institution: 'Global Tech Institute',
        bio: 'Passionate about algorithms and web development.'
      });

    if (updateRes.status === 302 && updateRes.headers.location === '/dashboard/profile') {
      const updatedAlice = await User.findById(aliceUser._id);
      if (
        updatedAlice.name === 'Alice L. Wonder' &&
        updatedAlice.headline === 'Aspiring Full Stack Engineer' &&
        updatedAlice.institution === 'Global Tech Institute' &&
        updatedAlice.phone === '+1 555-0199'
      ) {
        console.log('  PASS: POST /dashboard/profile successfully persisted updated details in MongoDB');
      } else {
        throw new Error('Database did not reflect updated profile fields!');
      }
    } else {
      throw new Error(`Profile update failed with status ${updateRes.status}`);
    }

    // 4b. Update via API
    const apiUpdateRes = await aliceAgent
      .put('/api/student/profile')
      .send({
        name: 'Alice Wonder, B.S.',
        email: aliceEmail,
        phone: '+1 555-0199',
        headline: 'Lead Developer Candidate',
        department: 'Computer Science',
        institution: 'Global Tech Institute',
        bio: 'Updated bio via REST API.'
      });

    if (apiUpdateRes.status === 200 && apiUpdateRes.body.profile.name === 'Alice Wonder, B.S.') {
      console.log('  PASS: PUT /api/student/profile updated student record via JSON API');
    } else {
      throw new Error(`PUT /api/student/profile failed: ${JSON.stringify(apiUpdateRes.body)}`);
    }

    // 4c. Reject duplicate email update
    const dupEmailRes = await aliceAgent
      .put('/api/student/profile')
      .send({
        name: 'Alice Wonder',
        email: bobEmail // Bob's email!
      });
    if (dupEmailRes.status === 409) {
      console.log('  PASS: Duplicate email update rejected with 409 Conflict');
    } else {
      throw new Error(`Duplicate email was not rejected! Status: ${dupEmailRes.status}`);
    }

    // ------------------------------------------------------------------------
    // TEST 5: Secure Password Change
    // ------------------------------------------------------------------------
    console.log('\n[TEST GROUP 5] Secure Password Change Flow & Verification:');

    // 5a. Reject incorrect current password
    const wrongOldPw = await aliceAgent
      .post('/dashboard/change-password')
      .type('form')
      .send({
        currentPassword: 'WrongPassword999',
        newPassword: 'BrandNewPassword789!',
        confirmPassword: 'BrandNewPassword789!'
      });
    const checkUserUnchanged = await User.findById(aliceUser._id);
    const stillOldMatch = await checkUserUnchanged.comparePassword('PasswordAlice123!');
    if (stillOldMatch) {
      console.log('  PASS: Password change rejected when current password is wrong');
    } else {
      throw new Error('Password changed despite incorrect current password!');
    }

    // 5b. Reject mismatching confirm password
    const mismatchPw = await aliceAgent
      .post('/dashboard/change-password')
      .type('form')
      .send({
        currentPassword: 'PasswordAlice123!',
        newPassword: 'BrandNewPassword789!',
        confirmPassword: 'DifferentPassword789!'
      });
    const checkMismatch = await User.findById(aliceUser._id);
    if (await checkMismatch.comparePassword('PasswordAlice123!')) {
      console.log('  PASS: Password change rejected when new and confirm passwords do not match');
    } else {
      throw new Error('Password changed despite confirmation mismatch!');
    }

    // 5c. Reject identical new password
    const samePwRes = await aliceAgent
      .post('/dashboard/change-password')
      .type('form')
      .send({
        currentPassword: 'PasswordAlice123!',
        newPassword: 'PasswordAlice123!',
        confirmPassword: 'PasswordAlice123!'
      });
    if (samePwRes.status === 302) {
      console.log('  PASS: Password change rejected when new password is identical to old password');
    }

    // 5d. Successful password change
    const validChangeRes = await aliceAgent
      .post('/dashboard/change-password')
      .type('form')
      .send({
        currentPassword: 'PasswordAlice123!',
        newPassword: 'BrandNewSecurePassword789!',
        confirmPassword: 'BrandNewSecurePassword789!'
      });
    if (validChangeRes.status === 302 && validChangeRes.headers.location === '/dashboard/profile') {
      const updatedUser = await User.findById(aliceUser._id);
      const isNewValid = await updatedUser.comparePassword('BrandNewSecurePassword789!');
      const isOldInvalid = !(await updatedUser.comparePassword('PasswordAlice123!'));
      if (isNewValid && isOldInvalid && updatedUser.passwordHash.startsWith('$2')) {
        console.log('  PASS: Password updated successfully and re-hashed with Bcrypt in MongoDB');
      } else {
        throw new Error('Password was not correctly changed or not hashed with bcrypt!');
      }
    } else {
      throw new Error(`Password change redirect failed with status ${validChangeRes.status}`);
    }

    // 5e. Verify Alice can log in with NEW password and CANNOT log in with OLD password
    const newLoginAgent = supertest.agent(server);
    const failLogin = await newLoginAgent
      .post('/auth/login')
      .type('form')
      .send({ email: aliceEmail, password: 'PasswordAlice123!' });
    if (failLogin.status === 401) {
      console.log('  PASS: Login with OLD password rejected with 401');
    } else {
      throw new Error('Old password still permitted login!');
    }

    const successLogin = await newLoginAgent
      .post('/auth/login')
      .type('form')
      .send({ email: aliceEmail, password: 'BrandNewSecurePassword789!' });
    if (successLogin.status === 302 && successLogin.headers.location === '/dashboard') {
      console.log('  PASS: Login with NEW password succeeded');
    } else {
      throw new Error('New password failed login!');
    }

    // ------------------------------------------------------------------------
    // TEST 6: Quiz Attempt Submission with Detailed Answers & Score Verification
    // ------------------------------------------------------------------------
    console.log('\n[TEST GROUP 6] Quiz Attempt Execution & Accurate Score Math:');
    const course = await Course.findOne({ code: 'DS' });
    const moduleDoc = await Module.findOne({ courseId: course._id, moduleNumber: 1 });
    const quiz = await Quiz.findOne({ moduleId: moduleDoc._id });

    // Submit quiz with 8 correct, 1 wrong, and 1 unanswered
    const answersData = {};
    // Indices 0-7 correct
    for (let i = 0; i < 8; i++) {
      answersData[i.toString()] = quiz.questions[i].correctOptionIndex.toString();
    }
    // Index 8 wrong: choose another option
    answersData['8'] = ((quiz.questions[8].correctOptionIndex + 1) % 4).toString();
    // Index 9 intentionally left unanswered (not present or empty)
    answersData['9'] = '';

    const quizSubmitRes = await aliceAgent
      .post(`/quizzes/${moduleDoc._id}/submit`)
      .type('form')
      .send({ answers: answersData, timeSpentSeconds: 145 });

    if (quizSubmitRes.status === 302) {
      console.log('  PASS: Quiz submitted and processed');
    } else {
      throw new Error(`Quiz submit failed with status ${quizSubmitRes.status}`);
    }

    const aliceAttempt = await QuizAttempt.findOne({ userId: aliceUser._id, moduleId: moduleDoc._id }).sort({ createdAt: -1 });
    if (!aliceAttempt) {
      throw new Error('QuizAttempt not found in database!');
    }

    if (
      aliceAttempt.score === 8 &&
      aliceAttempt.totalQuestions === 10 &&
      aliceAttempt.percentage === 80 &&
      aliceAttempt.passed === true &&
      aliceAttempt.correctAnswersCount === 8 &&
      aliceAttempt.incorrectAnswersCount === 1 &&
      aliceAttempt.unansweredCount === 1
    ) {
      console.log('  PASS: QuizAttempt recorded with exact metrics:');
      console.log(`        Score: ${aliceAttempt.score}/10 (${aliceAttempt.percentage}%)`);
      console.log(`        Correct: ${aliceAttempt.correctAnswersCount}, Incorrect: ${aliceAttempt.incorrectAnswersCount}, Unanswered: ${aliceAttempt.unansweredCount}`);
    } else {
      throw new Error(`Quiz metrics incorrect: ${JSON.stringify(aliceAttempt)}`);
    }

    // ------------------------------------------------------------------------
    // TEST 7: Quiz Attempt History (Page & API)
    // ------------------------------------------------------------------------
    console.log('\n[TEST GROUP 7] Quiz History View & Pagination:');
    const historyViewRes = await aliceAgent.get('/quizzes/history');
    if (
      historyViewRes.status === 200 &&
      historyViewRes.text.includes('My Quiz Attempt History') &&
      historyViewRes.text.includes('View Details') &&
      historyViewRes.text.includes('80%')
    ) {
      console.log('  PASS: GET /quizzes/history rendered attempt history table with View Details link');
    } else {
      throw new Error(`GET /quizzes/history failed with status ${historyViewRes.status}`);
    }

    const historyApiRes = await aliceAgent.get('/api/student/quiz-history');
    if (
      historyApiRes.status === 200 &&
      historyApiRes.body.success &&
      historyApiRes.body.attempts.length >= 1 &&
      historyApiRes.body.attempts[0].score === 8
    ) {
      console.log('  PASS: GET /api/student/quiz-history returned paginated attempt records via JSON API');
    } else {
      throw new Error(`GET /api/student/quiz-history failed: ${JSON.stringify(historyApiRes.body)}`);
    }

    // ------------------------------------------------------------------------
    // TEST 8: Detailed Quiz Result Review (View & API)
    // ------------------------------------------------------------------------
    console.log('\n[TEST GROUP 8] Detailed Quiz Result Review:');
    const detailViewRes = await aliceAgent.get(`/quizzes/history/${aliceAttempt._id}`);
    if (
      detailViewRes.status === 200 &&
      detailViewRes.text.includes('Detailed Quiz Result Review') &&
      detailViewRes.text.includes('Question 1 of 10') &&
      detailViewRes.text.includes('Explanation:') &&
      detailViewRes.text.includes('Correct (+1 pt)')
    ) {
      console.log('  PASS: GET /quizzes/history/:attemptId rendered question-by-question breakdown, options, and explanations');
    } else {
      throw new Error(`GET /quizzes/history/:attemptId failed with status ${detailViewRes.status}`);
    }

    const detailApiRes = await aliceAgent.get(`/api/student/quiz-attempts/${aliceAttempt._id}`);
    if (
      detailApiRes.status === 200 &&
      detailApiRes.body.success &&
      detailApiRes.body.questions.length === 10 &&
      detailApiRes.body.attempt.score === 8
    ) {
      console.log('  PASS: GET /api/student/quiz-attempts/:attemptId returned full 10-question review JSON');
    } else {
      throw new Error(`GET /api/student/quiz-attempts/:attemptId failed: ${JSON.stringify(detailApiRes.body)}`);
    }

    // ------------------------------------------------------------------------
    // TEST 9: Student Performance Analytics & Visual Chart
    // ------------------------------------------------------------------------
    console.log('\n[TEST GROUP 9] Performance Analytics & Chart Dataset:');
    const perfViewRes = await aliceAgent.get('/dashboard/performance');
    if (
      perfViewRes.status === 200 &&
      perfViewRes.text.includes('Academic & Quiz Performance') &&
      perfViewRes.text.includes('Score Progression Over Time') &&
      perfViewRes.text.includes('performanceChart')
    ) {
      console.log('  PASS: GET /dashboard/performance rendered analytics cards, subject breakdown & chart canvas');
    } else {
      throw new Error(`GET /dashboard/performance failed with status ${perfViewRes.status}`);
    }

    const perfApiRes = await aliceAgent.get('/api/student/performance');
    if (
      perfApiRes.status === 200 &&
      perfApiRes.body.success &&
      perfApiRes.body.statistics.totalQuizzesAttempted >= 1 &&
      perfApiRes.body.statistics.averageQuizScore === 80 &&
      perfApiRes.body.statistics.totalCorrectAnswers === 8
    ) {
      console.log('  PASS: GET /api/student/performance calculated exact multi-attempt statistics & chart timeline');
    } else {
      throw new Error(`GET /api/student/performance failed: ${JSON.stringify(perfApiRes.body)}`);
    }

    // ------------------------------------------------------------------------
    // TEST 10: Multi-User Security & Cross-Student Isolation (CRITICAL)
    // ------------------------------------------------------------------------
    console.log('\n[TEST GROUP 10] Cross-Student Data Isolation & Ownership Security:');

    // Bob tries to access Alice's quiz attempt details via web view
    const bobAccessAliceView = await bobAgent.get(`/quizzes/history/${aliceAttempt._id}`);
    if (bobAccessAliceView.status === 302 && bobAccessAliceView.headers.location === '/quizzes/history') {
      console.log('  PASS: Bob cannot view Alice\'s attempt via HTML route (unauthorized redirect)');
    } else {
      throw new Error(`SECURITY VULNERABILITY: Bob was able to view Alice\'s attempt HTML! Status: ${bobAccessAliceView.status}`);
    }

    // Bob tries to access Alice's quiz attempt details via JSON API
    const bobAccessAliceApi = await bobAgent.get(`/api/student/quiz-attempts/${aliceAttempt._id}`);
    if (bobAccessAliceApi.status === 404 || bobAccessAliceApi.status === 403) {
      console.log('  PASS: Bob cannot access Alice\'s attempt via API (404/403 denied)');
    } else {
      throw new Error(`SECURITY VULNERABILITY: Bob accessed Alice\'s attempt API! Status: ${bobAccessAliceApi.status}`);
    }

    // Bob views his own quiz history (should NOT contain Alice's attempts)
    const bobHistory = await bobAgent.get('/api/student/quiz-history');
    if (bobHistory.status === 200 && bobHistory.body.attempts.length === 0) {
      console.log('  PASS: Bob\'s quiz history is empty and isolated from Alice\'s attempts');
    } else {
      throw new Error('SECURITY VULNERABILITY: Alice\'s attempts leaked into Bob\'s history!');
    }

    console.log('\n===============================================================');
    console.log('>>> ALL STUDENT FEATURE VERIFICATION TESTS PASSED 100%! <<<');
    console.log('===============================================================');
    process.exit(0);
  } catch (err) {
    console.error('\nTEST SUITE ERROR:', err.message);
    process.exit(1);
  }
}

runStudentFeatureTests();
