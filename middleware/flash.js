/**
 * Simple session-based flash messaging middleware
 */
module.exports = function flashMiddleware(req, res, next) {
  if (!req.session.flash) {
    req.session.flash = { success: [], error: [], info: [] };
  }

  // Flash helper method
  req.flash = function (type, message) {
    if (!req.session.flash[type]) {
      req.session.flash[type] = [];
    }
    req.session.flash[type].push(message);

    // Also push to current request view locals for immediate renders
    if (res.locals.messages) {
      if (!res.locals.messages[type]) {
        res.locals.messages[type] = [];
      }
      res.locals.messages[type].push(message);
    }
  };

  // Expose messages to views and then clear them
  res.locals.messages = {
    success: req.session.flash.success || [],
    error: req.session.flash.error || [],
    info: req.session.flash.info || []
  };

  // Reset flash on session for next request
  req.session.flash = { success: [], error: [], info: [] };

  next();
};
