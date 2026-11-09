require('dotenv').config();
const path = require('path');
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const morgan = require('morgan');
const methodOverride = require('method-override');

const { connectDB } = require('./config/db');
const flashMiddleware = require('./middleware/flash');
const { attachUser } = require('./middleware/auth');
const { notFoundHandler, serverErrorHandler } = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const studyRoutes = require('./routes/studyRoutes');
const quizRoutes = require('./routes/quizRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const progressRoutes = require('./routes/progressRoutes');

// Models
const Course = require('./models/Course');
const { seedDatabase } = require('./scripts/seed');

const app = express();
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // 1. Connect to Database (Persistent or In-Memory Dev Fallback)
    const dbInfo = await connectDB();

    // 2. Ensure initial curriculum is seeded if database is fresh
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      console.log('[Bootstrap] No courses detected. Automatically running initial curriculum seed...');
      await seedDatabase();
    }

    // 3. Security Headers with Helmet (configured to allow Bootstrap CDN & inline scripts)
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
            imgSrc: ["'self'", 'data:', 'blob:'],
            fontSrc: ["'self'", 'https://cdn.jsdelivr.net'],
            connectSrc: ["'self'"],
            frameSrc: ["'self'"],
            objectSrc: ["'self'"]
          }
        },
        crossOriginEmbedderPolicy: false
      })
    );

    // 4. Request Logging
    if (process.env.NODE_ENV !== 'production') {
      app.use(morgan('dev'));
    }

    // 5. Body Parsers & Method Override
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(methodOverride('_method'));

    // 6. Static Assets (CSS, Images, Client JS)
    app.use(express.static(path.join(__dirname, 'public')));

    // 7. View Engine Setup (.html extension with EJS template engine)
    app.engine('html', ejs.renderFile);
    app.set('view engine', 'html');
    app.set('views', path.join(__dirname, 'views'));

    // 8. Session Management with connect-mongo
    app.use(
      session({
        secret: process.env.SESSION_SECRET || 'focuslearn_wad_secret_fallback_2026',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
          mongoUrl: dbInfo.uri,
          collectionName: 'sessions',
          ttl: 24 * 60 * 60 // 1 day
        }),
        cookie: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 1000 * 60 * 60 * 24 // 24 hours
        }
      })
    );

    // 9. Custom Flash & User Attachment Middleware
    app.use(flashMiddleware);
    app.use(attachUser);

    // 10. Application Routes
    // Home Page
    app.get('/', async (req, res, next) => {
      try {
        const courses = await Course.find().sort({ order: 1 });
        res.render('home', {
          pageTitle: 'FocusLearn - Smart Learning Platform',
          currentPath: '/',
          courses
        });
      } catch (err) {
        next(err);
      }
    });

    app.use('/auth', authRoutes);
    app.use('/courses', courseRoutes);
    app.use('/lessons', lessonRoutes);
    app.use('/study', studyRoutes);
    app.use('/quizzes', quizRoutes);
    app.use('/dashboard', dashboardRoutes);
    app.use('/progress', progressRoutes);

    // 11. Centralized Error Handlers
    app.use(notFoundHandler);
    app.use(serverErrorHandler);

    // 12. Listen on Port
    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`FocusLearn Web Application is running!`);
      console.log(`Local Access: http://localhost:${PORT}`);
      console.log(`Environment:  ${process.env.NODE_ENV || 'development'}`);
      console.log(`Database:     ${dbInfo.isMemory ? 'In-Memory Fallback' : 'Persistent MongoDB'}`);
      console.log('====================================================');
    });

    return server;
  } catch (error) {
    console.error('Fatal: Failed to start FocusLearn server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
