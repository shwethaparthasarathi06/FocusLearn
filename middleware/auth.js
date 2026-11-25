const User = require('../models/User');

/**
 * Attach logged-in user to request and response
 */
const attachUser = async (req, res, next) => {
  res.locals.currentUser = null;
  res.locals.isAuthenticated = false;

  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).select('-passwordHash');

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
  if (req.user || (req.session && req.session.userId)) {
    return next();
  }

  if (req.xhr || req.originalUrl?.startsWith('/api') || req.baseUrl?.startsWith('/api') || req.headers.accept?.includes('json')) {
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
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  if (req.xhr || req.originalUrl?.startsWith('/api') || req.baseUrl?.startsWith('/api') || req.headers.accept?.includes('json')) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Admin privileges required.'
    });
  }

  if (!req.user && !(req.session && req.session.userId)) {
    return res.redirect('/auth/login');
  }

  if (req.session) {
    if (!req.session.flash) {
      req.session.flash = { success: [], error: [] };
    }
    req.session.flash.error = ['Access denied. Admin only.'];
  }

  return res.status(403).send('Access denied. Admin only.');
};

/**
 * Redirect logged-in users away from login/register
 */
const ensureGuest = (req, res, next) => {
  if (req.user || (req.session && req.session.userId)) {
    if (req.user && req.user.role === 'admin') {
      return res.redirect('/admin');
    }
    return res.redirect('/dashboard');
  }

  next();
};

module.exports = {
  attachUser,
  ensureAuthenticated,
  ensureAdmin,
  ensureGuest
};
