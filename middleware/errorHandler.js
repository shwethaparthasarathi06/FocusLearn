/**
 * Centralized Error Handling Middleware
 */

const notFoundHandler = (req, res, next) => {
  res.status(404).render('errors/404', {
    pageTitle: 'Page Not Found - FocusLearn',
    currentPath: req.path,
    url: req.originalUrl
  });
};

const serverErrorHandler = (err, req, res, next) => {
  console.error('[Internal Server Error]', err);

  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'An unexpected error occurred. Please try again later.' 
    : err.message || 'Internal Server Error';

  res.status(statusCode).render('errors/500', {
    pageTitle: 'Server Error - FocusLearn',
    currentPath: req.path,
    statusCode,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : null
  });
};

module.exports = {
  notFoundHandler,
  serverErrorHandler
};
