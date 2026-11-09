const User = require('../models/User');

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
 * Handle Login Form Submission
 */
exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash('error', 'Please provide both email and password.');
      return res.status(400).render('auth/login', {
        pageTitle: 'Student Login - FocusLearn',
        currentPath: '/auth/login',
        email: email || ''
      });
    }

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

    const returnUrl = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    res.redirect(returnUrl);
  } catch (err) {
    next(err);
  }
};

/**
 * Render Registration Page
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
 * Handle Registration Form Submission
 */
exports.postRegister = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Basic Validation
    if (!name || !email || !password || !confirmPassword) {
      req.flash('error', 'All fields are required.');
      return res.status(400).render('auth/register', {
        pageTitle: 'Student Registration - FocusLearn',
        currentPath: '/auth/register',
        name: name || '',
        email: email || ''
      });
    }

    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters long.');
      return res.status(400).render('auth/register', {
        pageTitle: 'Student Registration - FocusLearn',
        currentPath: '/auth/register',
        name,
        email
      });
    }

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
      req.flash('error', 'An account with this email address already exists. Please log in.');
      return res.status(400).render('auth/register', {
        pageTitle: 'Student Registration - FocusLearn',
        currentPath: '/auth/register',
        name,
        email: normalizedEmail
      });
    }

    // Create user
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: password
    });

    await newUser.save();

    // Auto-login after registration
    req.session.userId = newUser._id;
    req.flash('success', `Account created successfully! Welcome to FocusLearn, ${newUser.name}.`);
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
};

/**
 * Handle Logout
 */
exports.postLogout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/auth/login');
  });
};
