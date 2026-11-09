const User = require('../models/User');

/**
 * Middleware: Attach current logged-in user to res.locals and req.user
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
        // Stale session
        delete req.session.userId;
      }
    } catch (err) {
      console.error('Error attaching user to session:', err);
    }
  }
  next();
};

/**
 * Middleware: Require user to be logged in
 */
const ensureAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.status(401).json({ success: false, message: 'Please log in to continue.' });
  }
  req.session.returnTo = req.originalUrl;
  if (!req.session.flash) req.session.flash = {};
  req.session.flash.error = ['Please log in to access this page.'];
  return res.redirect('/auth/login');
};

/**
 * Middleware: Redirect already logged-in users away from login/register
 */
const ensureGuest = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  next();
};

module.exports = {
  attachUser,
  ensureAuthenticated,
  ensureGuest
};
