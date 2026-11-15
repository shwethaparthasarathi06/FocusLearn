const User = require('../models/User');

/**
 * Initialize flash storage after session regeneration
 */
const initializeFlash = (req) => {
  req.session.flash = {
    success: [],
    error: []
  };
};

/**
 * Render Login Page
 */
exports.getLogin = (req, res) => {
  res.render('auth/login', {
    pageTitle: 'Student Login - FocusLearn',
    currentPath: '/auth/login',
    email: ''
  });
};

/**
 * Handle Student / User Login
 */
exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      req.flash('error', 'Please provide both email and password.');
      return res.status(400).render('auth/login', {
        pageTitle: 'Student Login - FocusLearn',
        currentPath: '/auth/login',
        email: email || ''
      });
    }

    // Find user
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      req.flash('error', 'Invalid email or password.');
      return res.status(401).render('auth/login', {
        pageTitle: 'Student Login - FocusLearn',
        currentPath: '/auth/login',
        email: normalizedEmail
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash('error', 'Invalid email or password.');
      return res.status(401).render('auth/login', {
        pageTitle: 'Student Login - FocusLearn',
        currentPath: '/auth/login',
        email: normalizedEmail
      });
    }

    // Set user session
    req.session.userId = user._id;
    req.flash('success', `Welcome back, ${user.name}!`);

    // Redirect according to role
    if (user.role === 'admin') {
      return res.redirect('/admin');
    }

    const returnUrl = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    return res.redirect(returnUrl);
  } catch (err) {
    next(err);
  }
};

/**
 * Render Register Page
 */
exports.getRegister = (req, res) => {
  res.render('auth/register', {
    pageTitle: 'Student Registration - FocusLearn',
    currentPath: '/auth/register',
    name: '',
    email: ''
  });
};

/**
 * Handle Student Registration
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      req.flash('error', 'All fields are required.');
      return res.status(400).render('auth/register', {
        pageTitle: 'Student Registration - FocusLearn',
        currentPath: '/auth/register',
        name: name || '',
        email: email || ''
      });
    }

    // Validate password length
    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters long.');
      return res.status(400).render('auth/register', {
        pageTitle: 'Student Registration - FocusLearn',
        currentPath: '/auth/register',
        name,
        email
      });
    }

    // Check passwords match
    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match.');
      return res.status(400).render('auth/register', {
        pageTitle: 'Student Registration - FocusLearn',
        currentPath: '/auth/register',
        name,
        email
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate email
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      req.flash('error', 'An account with that email already exists.');
      return res.status(400).render('auth/register', {
        pageTitle: 'Student Registration - FocusLearn',
        currentPath: '/auth/register',
        name,
        email: normalizedEmail
      });
    }

    // Create user (pre-save hook will hash passwordHash)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: password,
      role: 'student'
    });

    // Auto-login registered student
    req.session.userId = user._id;
    req.flash('success', `Account created successfully! Welcome to FocusLearn, ${user.name}!`);
    return res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
};

/**
 * Handle Student Logout
 */
exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
};
