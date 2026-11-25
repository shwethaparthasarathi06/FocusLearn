const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { validateStudentEmail, HTML5_STUDENT_EMAIL_PATTERN } = require('../utils/emailValidator');

/**
 * Render Login Page with Student and Admin tabs
 */
exports.getLogin = (req, res) => {
  const activeRole = req.query.role === 'admin' ? 'admin' : 'student';
  res.render('auth/login', {
    pageTitle: activeRole === 'admin' ? 'Admin Login - FocusLearn' : 'Student Login - FocusLearn',
    currentPath: '/auth/login',
    email: req.query.email || '',
    activeRole,
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    studentEmailPattern: HTML5_STUDENT_EMAIL_PATTERN
  });
};

/**
 * Handle Student and Admin Login Form Submission
 */
exports.postLogin = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const selectedRole = role === 'admin' ? 'admin' : 'student';
    const normalizedEmail = (email || '').trim().toLowerCase();

    // 1. Basic input validation
    if (!normalizedEmail || !password) {
      req.flash('error', 'Please provide both email and password.');
      return res.status(400).render('auth/login', {
        pageTitle: selectedRole === 'admin' ? 'Admin Login - FocusLearn' : 'Student Login - FocusLearn',
        currentPath: '/auth/login',
        email: normalizedEmail,
        activeRole: selectedRole,
        googleClientId: process.env.GOOGLE_CLIENT_ID || '',
        studentEmailPattern: HTML5_STUDENT_EMAIL_PATTERN
      });
    }

    // 2. Role-specific validation
    if (selectedRole === 'student') {
      const emailValidation = validateStudentEmail(normalizedEmail);
      if (!emailValidation.isValid) {
        req.flash('error', emailValidation.message);
        return res.status(400).render('auth/login', {
          pageTitle: 'Student Login - FocusLearn',
          currentPath: '/auth/login',
          email: normalizedEmail,
          activeRole: 'student',
          googleClientId: process.env.GOOGLE_CLIENT_ID || '',
          studentEmailPattern: HTML5_STUDENT_EMAIL_PATTERN
        });
      }
    }

    // 3. User lookup
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const errorMsg = selectedRole === 'admin' ? 'Invalid admin email or password.' : 'Invalid email or password.';
      req.flash('error', errorMsg);
      return res.status(401).render('auth/login', {
        pageTitle: selectedRole === 'admin' ? 'Admin Login - FocusLearn' : 'Student Login - FocusLearn',
        currentPath: '/auth/login',
        email: normalizedEmail,
        activeRole: selectedRole,
        googleClientId: process.env.GOOGLE_CLIENT_ID || '',
        studentEmailPattern: HTML5_STUDENT_EMAIL_PATTERN
      });
    }

    // 4. Role mismatch check (Prevent students from logging in via Admin portal, and vice versa)
    if (user.role !== selectedRole) {
      let mismatchMsg = 'Invalid email or password.';
      if (selectedRole === 'admin' && user.role !== 'admin') {
        mismatchMsg = 'Access denied. This account does not possess administrator privileges.';
      } else if (selectedRole === 'student' && user.role === 'admin') {
        mismatchMsg = 'Administrator accounts must sign in using the Admin Login option.';
      }

      req.flash('error', mismatchMsg);
      return res.status(403).render('auth/login', {
        pageTitle: selectedRole === 'admin' ? 'Admin Login - FocusLearn' : 'Student Login - FocusLearn',
        currentPath: '/auth/login',
        email: normalizedEmail,
        activeRole: selectedRole,
        googleClientId: process.env.GOOGLE_CLIENT_ID || '',
        studentEmailPattern: HTML5_STUDENT_EMAIL_PATTERN
      });
    }

    // 5. Password verification
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const errorMsg = selectedRole === 'admin' ? 'Invalid admin email or password.' : 'Invalid email or password.';
      req.flash('error', errorMsg);
      return res.status(401).render('auth/login', {
        pageTitle: selectedRole === 'admin' ? 'Admin Login - FocusLearn' : 'Student Login - FocusLearn',
        currentPath: '/auth/login',
        email: normalizedEmail,
        activeRole: selectedRole,
        googleClientId: process.env.GOOGLE_CLIENT_ID || '',
        studentEmailPattern: HTML5_STUDENT_EMAIL_PATTERN
      });
    }

    // 6. Establish authenticated session
      req.session.userId = user._id;
      // Update last login date for both admin and student
      user.lastLoginDate = new Date();
      user.lastLoginAt = user.lastLoginDate;
      await user.save();

    if (user.role === 'admin') {
      req.flash('success', `Welcome to the Admin Portal, ${user.name}!`);
      return res.redirect('/admin');
    }

    req.flash('success', `Welcome back, ${user.name}!`);
    const returnUrl = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    return res.redirect(returnUrl);
  } catch (err) {
    next(err);
  }
};

/**
 * Render Student Registration Page
 */
exports.getRegister = (req, res) => {
  res.render('auth/register', {
    pageTitle: 'Student Registration - FocusLearn',
    currentPath: '/auth/register',
    name: '',
    email: '',
    studentEmailPattern: HTML5_STUDENT_EMAIL_PATTERN
  });
};

/**
 * Handle Student Registration with Strict College ID Validation
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();

    // 1. Validate required fields
    if (!name || !normalizedEmail || !password || !confirmPassword) {
      req.flash('error', 'All fields are required.');
      return res.status(400).render('auth/register', {
        pageTitle: 'Student Registration - FocusLearn',
        currentPath: '/auth/register',
        name: name || '',
        email: normalizedEmail,
        studentEmailPattern: HTML5_STUDENT_EMAIL_PATTERN
      });
    }

    // 2. Validate password length
    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters long.');
      return res.status(400).render('auth/register', {
        pageTitle: 'Student Registration - FocusLearn',
        currentPath: '/auth/register',
        name: name.trim(),
        email: normalizedEmail,
        studentEmailPattern: HTML5_STUDENT_EMAIL_PATTERN
      });
    }

    // 3. Confirm password matching
    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match.');
      return res.status(400).render('auth/register', {
        pageTitle: 'Student Registration - FocusLearn',
        currentPath: '/auth/register',
        name: name.trim(),
        email: normalizedEmail,
        studentEmailPattern: HTML5_STUDENT_EMAIL_PATTERN
      });
    }

    // 4. Strict PSG Tech Student Email Validation
    const emailValidation = validateStudentEmail(normalizedEmail);
    if (!emailValidation.isValid) {
      req.flash('error', emailValidation.message);
      return res.status(400).render('auth/register', {
        pageTitle: 'Student Registration - FocusLearn',
        currentPath: '/auth/register',
        name: name.trim(),
        email: normalizedEmail,
        studentEmailPattern: HTML5_STUDENT_EMAIL_PATTERN
      });
    }

    // 5. Prevent duplicate accounts
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      req.flash('error', 'An account with this college email address already exists. Please sign in.');
      return res.status(400).render('auth/register', {
        pageTitle: 'Student Registration - FocusLearn',
        currentPath: '/auth/register',
        name: name.trim(),
        email: normalizedEmail,
        studentEmailPattern: HTML5_STUDENT_EMAIL_PATTERN
      });
    }

    // 6. Create student record
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: password,
      role: 'student'
    });

    // 7. Registration-First: Redirect to Student Login with success message
    req.flash('success', 'Registration successful! Please sign in with your email and password, or use Google Sign-In with this account.');
    return res.redirect('/auth/login');
  } catch (err) {
    next(err);
  }
};

/**
 * Handle Official Google Sign-In Authentication (Google Identity Services)
 */
exports.googleAuth = async (req, res, next) => {
  try {
    const credential = req.body.credential || req.body.idToken;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token credential is required.'
      });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      console.error('[Google Auth] GOOGLE_CLIENT_ID environment variable is missing.');
      return res.status(500).json({
        success: false,
        message: 'Google Sign-In is temporarily unavailable due to server configuration.'
      });
    }

    // Verify Google ID token using official Google OAuth2 Client
    const client = new OAuth2Client(googleClientId);
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: googleClientId
      });
    } catch (verifyErr) {
      console.error('[Google Auth] Token verification failed:', verifyErr.message);
      return res.status(401).json({
        success: false,
        message: 'Google authentication failed: The provided Google ID token is invalid or expired.'
      });
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract a verified email address from the Google profile.'
      });
    }

    const verifiedEmail = payload.email.trim().toLowerCase();

    // Check email verification status from Google
    if (!payload.email_verified) {
      return res.status(403).json({
        success: false,
        message: 'Google email address is not verified.'
      });
    }

    // Strict validation against authorized PSG Tech MCA batches (26mx101–130, 26mx201–230, 26mx301–360)
    const emailValidation = validateStudentEmail(verifiedEmail);
    if (!emailValidation.isValid) {
      console.warn(`[Google Auth] Rejected unauthorized email: ${verifiedEmail}`);
      return res.status(403).json({
        success: false,
        message: emailValidation.message
      });
    }

    // Find existing registered student
    let user = await User.findOne({ email: verifiedEmail });

    // Registration-First: Never auto-register an unregistered student via Google
    if (!user) {
      console.warn(`[Google Auth] Unregistered Google email attempted sign-in: ${verifiedEmail}`);
      return res.status(403).json({
        success: false,
        notRegistered: true,
        message: 'You are not registered with FocusLearn. Please register first to access your account.',
        registerUrl: '/auth/register'
      });
    }

    // Reject if account belongs to non-student role via Google student login
    if (user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Administrative accounts must sign in using the Admin Login portal.'
      });
    }

    // Update Google ID and Avatar if newly authenticated via Google
    let shouldSave = false;
    if (!user.googleId && payload.sub) {
      user.googleId = payload.sub;
      shouldSave = true;
    }
    if (payload.picture && !user.avatarUrl) {
      user.avatarUrl = payload.picture;
      shouldSave = true;
    }
    if (shouldSave) {
      await user.save();
    }

    // Establish student session
      req.session.userId = user._id;
      // Update last login date for both admin and student
      user.lastLoginDate = new Date();
      user.lastLoginAt = user.lastLoginDate;
      await user.save();
    req.flash('success', `Welcome back, ${user.name}!`);

    return res.json({
      success: true,
      redirectUrl: '/dashboard',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('[Google Auth Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during Google authentication. Please try again.'
    });
  }
};

/**
 * Handle Student / User Logout
 */
exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
};
