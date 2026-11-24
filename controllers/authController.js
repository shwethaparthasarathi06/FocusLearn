
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
        pageTitle: 'Login - FocusLearn',
        currentPath: '/auth/login',
        email: '',
        selectedRole: 'student'
    });
};

/**
 * Handle Login Form Submission
 */
exports.postLogin = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        const selectedRole = role || 'student';

        // Validate selected role
        if (!['student', 'admin'].includes(selectedRole)) {
            req.flash('error', 'Invalid login role.');

            return res.status(400).render('auth/login', {
                pageTitle: 'Login - FocusLearn',
                currentPath: '/auth/login',
                email: email || '',
                selectedRole: 'student'
            });
        }

        // Validate email and password
        if (!email || !password) {
            req.flash('error', 'Please provide both email and password.');

            return res.status(400).render('auth/login', {
                pageTitle: 'Login - FocusLearn',
                currentPath: '/auth/login',
                email: email || '',
                selectedRole
            });
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Find user in database
        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            req.flash('error', 'Invalid email or password.');

            return res.status(401).render('auth/login', {
                pageTitle: 'Login - FocusLearn',
                currentPath: '/auth/login',
                email: normalizedEmail,
                selectedRole
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            req.flash('error', 'Invalid email or password.');

            return res.status(401).render('auth/login', {
                pageTitle: 'Login - FocusLearn',
                currentPath: '/auth/login',
                email: normalizedEmail,
                selectedRole
            });
        }

        // Check selected role against database role
        if (user.role !== selectedRole) {
            req.flash(
                'error',
                `This account is not registered as a ${selectedRole}. Please select the correct role.`
            );

            return res.status(401).render('auth/login', {
                pageTitle: 'Login - FocusLearn',
                currentPath: '/auth/login',
                email: normalizedEmail,
                selectedRole
            });
        }

        // Regenerate session for security
        req.session.regenerate((err) => {
            if (err) {
                return next(err);
            }

            // Initialize new session flash storage
            initializeFlash(req);

            // Store logged-in user
            req.session.userId = user._id;

            // Welcome message
            req.flash('success', `Welcome back, ${user.name}!`);

            // Redirect according to database role
            if (user.role === 'admin') {
                return res.redirect('/admin');
            }

            return res.redirect('/dashboard');
        });

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
        const {
            name,
            email,
            password,
            confirmPassword
        } = req.body;

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

        // Validate password confirmation
        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match.');

            return res.status(400).render('auth/register', {
                pageTitle: 'Student Registration - FocusLearn',
                currentPath: '/auth/register',
                name,
                email
            });
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Check duplicate email
        const existing = await User.findOne({
            email: normalizedEmail
        });

        if (existing) {
            req.flash(
                'error',
                'An account with this email address already exists. Please log in.'
            );

            return res.status(400).render('auth/register', {
                pageTitle: 'Student Registration - FocusLearn',
                currentPath: '/auth/register',
                name,
                email: normalizedEmail
            });
        }

        // Create student account
        const newUser = new User({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash: password,
            role: 'student'
        });

        await newUser.save();

        // Regenerate session
        req.session.regenerate((err) => {
            if (err) {
                return next(err);
            }

            // Initialize new flash storage
            initializeFlash(req);

            // Store new student session
            req.session.userId = newUser._id;

            req.flash(
                'success',
                `Account created successfully! Welcome to FocusLearn, ${newUser.name}.`
            );

            return res.redirect('/dashboard');
        });

    } catch (err) {
        next(err);
    }
};

/**
 * Handle Logout
 */
exports.postLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);

            return res.status(500).send(
                'Unable to log out. Please try again.'
            );
        }

        res.clearCookie('connect.sid');

        return res.redirect('/auth/login');
    });
};
