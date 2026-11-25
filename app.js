require('dotenv').config({ quiet: true });
const express = require('express');
const path = require('path');
const ejs = require('ejs');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { connectDB } = require('./config/db');
const { attachUser } = require('./middleware/auth');
const flashMiddleware = require('./middleware/flash');
const { notFoundHandler, serverErrorHandler } = require('./middleware/errorHandler');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const studyRoutes = require('./routes/studyRoutes');
const quizRoutes = require('./routes/quizRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const progressRoutes = require('./routes/progressRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentApiRoutes = require('./routes/studentApiRoutes');

// Models
const Course = require('./models/Course');
const Module = require('./models/Module');
const StudyMaterial = require('./models/StudyMaterial');
const { seedDatabase } = require('./scripts/seed');

const app = express();

/**
 * Bootstrap and configure server instance
 */
async function startServer() {
  try {
    // 1. Connect to Database (Persistent or In-Memory Dev Fallback)
    const dbInfo = await connectDB();

    // 2. Seed initial curriculum only if database has no courses yet
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      console.log('[Bootstrap] Empty database detected — seeding initial curriculum...');
      await seedDatabase();
    }

    // 3. View Engine Setup (.html extension with EJS template engine)
    app.engine('html', ejs.renderFile);
    app.set('view engine', 'html');
    app.set('views', path.join(__dirname, 'views'));

    // 4. Body Parsers
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // Method Override Middleware for HTML forms using ?_method=PUT / ?_method=DELETE
    app.use((req, res, next) => {
      if (req.query && req.query._method) {
        req.method = req.query._method.toUpperCase();
      } else if (req.body && req.body._method) {
        req.method = req.body._method.toUpperCase();
        delete req.body._method;
      }
      next();
    });

    // 5. Static Files Serving (Serves /materials direct & subfolders, plus all /public assets)
    app.use('/materials', express.static(path.join(__dirname, 'public/materials')));
    app.use(express.static(path.join(__dirname, 'public')));

    // 6. Express Session Configuration
    const sessionConfig = {
      secret: process.env.SESSION_SECRET || 'focuslearn_super_secure_session_secret_wad_2026_key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 Days
      }
    };

    // Use MongoStore for persistent session management when MongoDB client is available
    if (dbInfo && dbInfo.client) {
      sessionConfig.store = MongoStore.create({
        client: dbInfo.client,
        collectionName: 'sessions',
        touchAfter: 24 * 3600 // Lazy update interval in seconds
      });
    }

    app.use(session(sessionConfig));

    // 7. Flash Messages Middleware
    app.use(flashMiddleware);

    // 8. Global Context & Auth Attachment
    app.use(attachUser);

    // 9. Global View Locals Middleware
    app.use((req, res, next) => {
      res.locals.currentPath = req.path;
      next();
    });

    // 10. Core Application Routes

    // Home Page
    app.get('/', async (req, res, next) => {
      try {
        const courses = await Course.find().sort({ order: 1 }).lean();
        const publishedMaterials = await StudyMaterial.find({ isPublished: true }).sort({ createdAt: -1 });
        const materialMap = {};
        publishedMaterials.forEach(material => {
          const key = material.courseId.toString();
          if (!materialMap[key]) materialMap[key] = [];
          materialMap[key].push(material);
        });
        courses.forEach(course => { course.publishedMaterials = materialMap[course._id.toString()] || []; });
        res.render('home', {
          pageTitle: 'FocusLearn - Smart Learning Platform',
          currentPath: '/',
          courses
        });
      } catch (error) {
        next(error);
      }
    });

    app.use('/auth', authRoutes);
    app.use('/courses', courseRoutes);
    app.use('/lessons', lessonRoutes);
    app.use('/study', studyRoutes);
    app.use('/quizzes', quizRoutes);
    app.use('/dashboard', dashboardRoutes);
    app.use('/progress', progressRoutes);
    app.use('/admin', adminRoutes);
    app.use('/api/student', studentApiRoutes);

    // 11. Centralized Error Handlers
    app.use(notFoundHandler);
    app.use(serverErrorHandler);

    // 12. Bind HTTP Listener
    const PORT = process.env.PORT || 3000;
    const serverInstance = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(` FocusLearn Server is actively running on PORT: ${PORT}`);
      console.log(` Direct Browser URL: http://localhost:${PORT}`);
      console.log('====================================================');
    });

    return serverInstance;
  } catch (error) {
    console.error('Failed to start application server:', error);
    process.exit(1);
  }
}

// Automatically start if called directly as entry point
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
