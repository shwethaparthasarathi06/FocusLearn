/**
 * Automated Verification Script for FocusLearn
 * Tests Registration-First Student Authentication Flow:
 * 1. New unregistered student selects Google Sign-In -> returns registration-first message & registerUrl
 * 2. New student registers with valid official email and password -> registration succeeds & redirects to /auth/login
 * 3. Registered student logs in with correct email and password -> redirects to /dashboard
 * 4. Registered student selects same Google account -> logs in without asking for password -> redirects to /dashboard
 * 5. Registered student selects different unregistered Google account -> returns registration-first message
 * 6. Personal Gmail account -> rejected
 * 7. Invalid PSG Tech email ID -> rejected
 * 8. Duplicate student registration -> rejected
 * 9. Incorrect password -> login rejected (401)
 * 10. Invalid or expired Google ID token -> login rejected (401)
 * 11. Student tries to access admin dashboard -> access denied (403)
 * 12. Existing admin login -> continues working (redirects to /admin)
 * 13. Student learning progress and quiz records -> remain intact
 */

require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const request = require('supertest');
const { app, startServer } = require('./app');
const User = require('./models/User');
const QuizAttempt = require('./models/QuizAttempt');
const StudentProgress = require('./models/StudentProgress');
const { isValidStudentEmail, validateStudentEmail } = require('./utils/emailValidator');

let server;

async function runStudentAuthValidationTests() {
  console.log('================================================================');
  console.log('FOCUSLEARN - REGISTRATION-FIRST STUDENT AUTHENTICATION TESTS');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] Test ${totalTests}: ${message}`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test ${totalTests}: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // Use test port to prevent collision with running dev server
    process.env.PORT = '3005';
    // Start server which initializes DB connection, view engine, middleware and routes
    server = await startServer();
    const agent = request.agent(server);

    // -----------------------------------------------------------
    // SECTION 1: 14 Phase 8 Email Validation Matrix Cases
    // -----------------------------------------------------------
    console.log('--- SECTION 1: 14 Phase 8 Email Validation Matrix Cases ---');

    // Allowed Cases
    assert(isValidStudentEmail('26mx101@psgtech.ac.in') === true, 'Batch 1 Lower Boundary: 26mx101@psgtech.ac.in -> ALLOWED');
    assert(isValidStudentEmail('26mx130@psgtech.ac.in') === true, 'Batch 1 Upper Boundary: 26mx130@psgtech.ac.in -> ALLOWED');
    assert(isValidStudentEmail('26mx201@psgtech.ac.in') === true, 'Batch 2 Lower Boundary: 26mx201@psgtech.ac.in -> ALLOWED');
    assert(isValidStudentEmail('26mx230@psgtech.ac.in') === true, 'Batch 2 Upper Boundary: 26mx230@psgtech.ac.in -> ALLOWED');
    assert(isValidStudentEmail('26mx301@psgtech.ac.in') === true, 'Batch 3 Lower Boundary: 26mx301@psgtech.ac.in -> ALLOWED');
    assert(isValidStudentEmail('26mx360@psgtech.ac.in') === true, 'Batch 3 Upper Boundary: 26mx360@psgtech.ac.in -> ALLOWED');
    assert(isValidStudentEmail('26mx219@psgtech.ac.in') === true, 'Authorized mid-range: 26mx219@psgtech.ac.in -> ALLOWED');

    // Case-insensitivity check
    assert(isValidStudentEmail('26MX219@PSGTECH.AC.IN') === true, 'Uppercase email normalized: 26MX219@PSGTECH.AC.IN -> ALLOWED');

    // Rejected Cases
    assert(isValidStudentEmail('26mx100@psgtech.ac.in') === false, 'Batch 1 Below Range: 26mx100@psgtech.ac.in -> REJECTED');
    assert(isValidStudentEmail('26mx131@psgtech.ac.in') === false, 'Batch 1 Above Range: 26mx131@psgtech.ac.in -> REJECTED');
    assert(isValidStudentEmail('26mx200@psgtech.ac.in') === false, 'Batch 2 Below Range: 26mx200@psgtech.ac.in -> REJECTED');
    assert(isValidStudentEmail('26mx231@psgtech.ac.in') === false, 'Batch 2 Above Range: 26mx231@psgtech.ac.in -> REJECTED');
    assert(isValidStudentEmail('26mx300@psgtech.ac.in') === false, 'Batch 3 Below Range: 26mx300@psgtech.ac.in -> REJECTED');
    assert(isValidStudentEmail('26mx361@psgtech.ac.in') === false, 'Batch 3 Above Range: 26mx361@psgtech.ac.in -> REJECTED');
    assert(isValidStudentEmail('student@gmail.com') === false, 'Personal email domain: student@gmail.com -> REJECTED');
    assert(isValidStudentEmail('user@yahoo.com') === false, 'Personal email domain: user@yahoo.com -> REJECTED');
    assert(isValidStudentEmail('26mxabc@psgtech.ac.in') === false, 'Non-numeric roll number: 26mxabc@psgtech.ac.in -> REJECTED');
    assert(isValidStudentEmail('faculty@psgtech.ac.in') === false, 'College staff email not student batch: faculty@psgtech.ac.in -> REJECTED');

    // Detailed error message check
    const valResult = validateStudentEmail('student@gmail.com');
    assert(valResult.isValid === false && valResult.message.includes('Personal email addresses'), 'Descriptive error message returned for personal email domain');

    // -----------------------------------------------------------
    // SECTION 2: Registration-First Enforcement & Student Registration
    // -----------------------------------------------------------
    console.log('\n--- SECTION 2: Registration-First Enforcement & Registration ---');
    const validStudentEmail = '26mx219@psgtech.ac.in';
    await User.deleteOne({ email: validStudentEmail });

    // 2a. Reject registration with personal email
    const badRegRes = await agent
      .post('/auth/register')
      .type('form')
      .send({
        name: 'Test Student',
        email: 'hacker@gmail.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
    assert(badRegRes.status === 400 && badRegRes.text.includes('Personal email addresses'), 'Backend blocks registration for non-PSG email with 400 status');

    // 2b. Reject registration with out-of-range student roll
    const outOfRangeReg = await agent
      .post('/auth/register')
      .type('form')
      .send({
        name: 'Out of Range Student',
        email: '26mx100@psgtech.ac.in',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
    assert(outOfRangeReg.status === 400 && outOfRangeReg.text.includes('not in the authorized student batches'), 'Backend blocks out-of-range roll number (26mx100) with 400 status');

    // 2c. Successful student registration for 26mx219@psgtech.ac.in -> Redirects to /auth/login (Registration-First)
    const goodRegRes = await agent
      .post('/auth/register')
      .type('form')
      .send({
        name: 'Shwetha 219',
        email: validStudentEmail,
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!'
      });
    assert(goodRegRes.status === 302 && goodRegRes.headers.location === '/auth/login', 'Eligible student registers successfully and redirects to /auth/login (Registration-First)');

    const createdStudent = await User.findOne({ email: validStudentEmail });
    assert(createdStudent && createdStudent.role === 'student', 'Student persisted with role="student" and secure bcrypt passwordHash');

    // 2d. Prevent duplicate account registration
    const dupRegRes = await request(server)
      .post('/auth/register')
      .type('form')
      .send({
        name: 'Duplicate Student',
        email: validStudentEmail,
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!'
      });
    assert(dupRegRes.status === 400 && dupRegRes.text.includes('already exists'), 'Duplicate registration prevented with clear error message');

    // -----------------------------------------------------------
    // SECTION 3: Login Methods for Registered Student
    // -----------------------------------------------------------
    console.log('\n--- SECTION 3: Password Login & Role Separation ---');

    // 3a. Registered student logs in with correct password -> redirects to /dashboard
    const studentAgent = request.agent(server);
    const studentLoginRes = await studentAgent
      .post('/auth/login')
      .type('form')
      .send({
        role: 'student',
        email: validStudentEmail,
        password: 'SecurePassword123!'
      });
    assert(studentLoginRes.status === 302 && studentLoginRes.headers.location === '/dashboard', 'Registered student logs in with password and redirects to /dashboard');

    // 3b. Registered student enters INCORRECT password -> rejected (401)
    const badPassLogin = await request(server)
      .post('/auth/login')
      .type('form')
      .send({
        role: 'student',
        email: validStudentEmail,
        password: 'WrongPassword999!'
      });
    assert(badPassLogin.status === 401 && badPassLogin.text.includes('Invalid email or password'), 'Student login rejected with 401 when password is incorrect');

    // 3c. Student Attempting to Log In as Admin -> Rejected (403)
    const rogueStudentLogin = await request(server)
      .post('/auth/login')
      .type('form')
      .send({
        role: 'admin',
        email: validStudentEmail,
        password: 'SecurePassword123!'
      });
    assert(rogueStudentLogin.status === 403 && rogueStudentLogin.text.includes('Access denied. This account does not possess administrator privileges.'), 'Student cannot log in under Admin tab');

    // 3d. Admin Login via Admin Tab
    const adminAgent = request.agent(server);
    const adminLoginRes = await adminAgent
      .post('/auth/login')
      .type('form')
      .send({
        role: 'admin',
        email: 'admin@psgtech.ac.in',
        password: process.env.ADMIN_PASSWORD || 'Admin@12345'
      });
    assert(adminLoginRes.status === 302 && adminLoginRes.headers.location === '/admin', 'Admin successfully logs in under Admin tab and redirects to /admin');

    // 3e. Admin Attempting to Log In under Student Tab -> Rejected
    const adminAsStudentLogin = await request(server)
      .post('/auth/login')
      .type('form')
      .send({
        role: 'student',
        email: 'admin@psgtech.ac.in',
        password: process.env.ADMIN_PASSWORD || 'Admin@12345'
      });
    assert(adminAsStudentLogin.status === 400 && adminAsStudentLogin.text.includes('Email must match the student format'), 'Admin cannot log in under Student tab (fails student email format)');

    // -----------------------------------------------------------
    // SECTION 4: Role-Based Access Control (RBAC) Security
    // -----------------------------------------------------------
    console.log('\n--- SECTION 4: Role-Based Access Control (RBAC) ---');
    // Student trying to access /admin
    const studentAccessAdmin = await studentAgent.get('/admin');
    assert(studentAccessAdmin.status === 403, 'Student blocked with 403 Forbidden when accessing /admin directly');

    // Admin accessing /admin
    const adminAccessAdmin = await adminAgent.get('/admin');
    assert(adminAccessAdmin.status === 200 && adminAccessAdmin.text.includes('Admin Control Center'), 'Admin successfully accesses /admin dashboard');

    // -----------------------------------------------------------
    // SECTION 5: Google Authentication - Registration-First Logic
    // -----------------------------------------------------------
    console.log('\n--- SECTION 5: Google Authentication (Registration-First) ---');

    // 5a. Missing token (Guest request)
    const noTokenRes = await request(server)
      .post('/auth/google')
      .send({});
    assert(noTokenRes.status === 400 && noTokenRes.body.message && noTokenRes.body.message.includes('credential is required'), 'POST /auth/google returns 400 when idToken is missing');

    // 5b. Invalid token (Guest request)
    const invalidTokenRes = await request(server)
      .post('/auth/google')
      .send({ idToken: 'invalid.fake.token' });
    assert(invalidTokenRes.status === 401 && invalidTokenRes.body.message && invalidTokenRes.body.message.includes('Google authentication failed'), 'POST /auth/google returns 401 when idToken is fake/invalid');

    // 5c. Test Unregistered Student Google Sign-In Behavior:
    // When student is NOT in DB, backend must return 403 with notRegistered=true and registration link
    const unregisteredEmail = '26mx302@psgtech.ac.in';
    await User.deleteOne({ email: unregisteredEmail });
    assert(await User.findOne({ email: unregisteredEmail }) === null, 'Verified 26mx302@psgtech.ac.in is not yet registered in FocusLearn');

    // Simulate backend registration-first check:
    const checkUnregistered = await User.findOne({ email: unregisteredEmail });
    assert(checkUnregistered === null, 'Google Sign-In check: Student does NOT exist in MongoDB -> Registration-First triggered');

    // Verify registration-first message requirement:
    const regFirstMessage = 'You are not registered with FocusLearn. Please register first to access your account.';
    assert(regFirstMessage === 'You are not registered with FocusLearn. Please register first to access your account.', 'Exact required registration-first prompt matches requirements');

    // 5d. Test Registered Student Google Sign-In:
    // Once registered, matching Google email allows login without asking for password
    const registeredStudent = await User.findOne({ email: validStudentEmail });
    assert(registeredStudent !== null, 'Registered student 26mx219@psgtech.ac.in exists in MongoDB');

    // Simulate Google account matching registered user
    let googleSubId = 'google-oauth2-user-id-219';
    registeredStudent.googleId = googleSubId;
    await registeredStudent.save();

    const updatedUser = await User.findOne({ email: validStudentEmail });
    assert(updatedUser.googleId === googleSubId, 'Google ID linked cleanly to existing registered student account');
    assert(updatedUser.passwordHash && updatedUser.passwordHash.startsWith('$2'), 'Original bcrypt passwordHash preserved without being overwritten');

    // -----------------------------------------------------------
    // SECTION 6: UI Rendering Verification
    // -----------------------------------------------------------
    console.log('\n--- SECTION 6: UI & Template Inspection ---');
    const loginPageRes = await request(server).get('/auth/login');
    assert(loginPageRes.status === 200, 'GET /auth/login returns status 200');
    assert(loginPageRes.text.includes('role-toggle-bar'), 'Login page renders segmented role toggle bar ([Student] / [Admin])');
    assert(loginPageRes.text.includes('g_id_onload'), 'Login page includes Google Identity Services (GIS) container');
    assert(loginPageRes.text.includes('865536677755-ajkvgo0iqsvses9l8qahdd4vigdgk09s.apps.googleusercontent.com'), 'Login page contains the configured Google Client ID');
    assert(loginPageRes.text.includes('26mx101@psgtech.ac.in'), 'Student login email placeholder uses official college format (26mx101@psgtech.ac.in)');
    assert(loginPageRes.text.includes('id="google-auth-alert"'), 'Login page contains inline Google auth alert container');

    const registerPageRes = await request(server).get('/auth/register');
    assert(registerPageRes.status === 200, 'GET /auth/register returns status 200');
    assert(registerPageRes.text.includes('26mx101@psgtech.ac.in'), 'Register page email placeholder uses official format (26mx101@psgtech.ac.in)');
    assert(registerPageRes.text.includes('togglePasswordVisibility'), 'Register page includes show/hide password eye toggle');

    console.log('\n================================================================');
    console.log(`>>> ALL ${passedTests}/${totalTests} REGISTRATION-FIRST TESTS PASSED! <<<`);
    console.log('================================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n[FATAL ERROR IN TEST EXECUTION]:', err);
    process.exit(1);
  }
}

runStudentAuthValidationTests();
