
const User = require('../models/User');

/**
 * Attach logged-in user to request and response
 */
const attachUser = async (req, res, next) => {
  res.locals.currentUser = null;
  res.locals.isAuthenticated = false;

  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId)
        .select('-passwordHash');

      if (user) {
        req.user = user;

        res.locals.currentUser = user;
        res.locals.isAuthenticated = true;
      } else {
        // Remove invalid session
        delete req.session.userId;
        delete req.user;
      }

    } catch (err) {
      console.error('Error attaching user:', err);
      return next(err);
    }
  }

  next();
};


/**
 * Require user login
 */
const ensureAuthenticated = (req, res, next) => {
  if (req.user) {
    return next();
  }

  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.status(401).json({
      success: false,
      message: 'Please log in to continue.'
    });
  }

  if (req.session) {
    req.session.returnTo = req.originalUrl;

    if (!req.session.flash) {
      req.session.flash = {
        success: [],
        error: []
      };
    }

    req.session.flash.error = [
      'Please log in to access this page.'
    ];
  }

  return res.redirect('/auth/login');
};


/**
 * Allow only admin users
 */
const ensureAdmin = (req, res, next) => {
  console.log('\n========== ADMIN ACCESS CHECK ==========');

  console.log('Session User ID:', req.session?.userId);
  console.log('User Email:', req.user?.email);
  console.log('User Role:', req.user?.role);

  if (!req.user) {
    console.log('RESULT: User not authenticated');

    return res.redirect('/auth/login');
  }

  if (req.user.role !== 'admin') {
    console.log('RESULT: Access denied - Not an admin');

    return res.status(403).send(
      'Access denied. Admin only.'
    );
  }

  console.log('RESULT: Admin access granted');
  console.log('=======================================\n');

  next();
};


/**
 * Redirect logged-in users away from login/register
 */
const ensureGuest = (req, res, next) => {
  if (req.user) {
    if (req.user.role === 'admin') {
      return res.redirect('/admin');
    }

    return res.redirect('/dashboard');
  }

  next();
};


module.exports = {
  attachUser,
  ensureAuthenticated,
  ensureGuest,
  ensureAdmin
};
