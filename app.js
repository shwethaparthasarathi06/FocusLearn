
require('dotenv').config();

const express = require('express');
const path = require('path');
const ejs = require('ejs');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const morgan = require('morgan');
const methodOverride = require('method-override');

const { connectDB } = require('./config/db');
const flashMiddleware = require('./middleware/flash');
const { attachUser } = require('./middleware/auth');
const {
    notFoundHandler,
    serverErrorHandler
} = require('./middleware/errorHandler');

// Routes
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const studyRoutes = require('./routes/studyRoutes');
const quizRoutes = require('./routes/quizRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const progressRoutes = require('./routes/progressRoutes');

// Models
const Course = require('./models/Course');
const Module = require('./models/Module');
const StudyMaterial = require('./models/StudyMaterial');

const { seedDatabase } = require('./scripts/seed');

const app = express();
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // 1. Connect to MongoDB
        const dbInfo = await connectDB();

        // 2. Synchronize initial curriculum
        const courseCount = await Course.countDocuments();
        const dsCourse = await Course.findOne({ code: 'DS' });

        const dsModulesCount = dsCourse
            ? await Module.countDocuments({ courseId: dsCourse._id })
            : 0;

        const firstModule = dsCourse
            ? await Module.findOne({
                courseId: dsCourse._id,
                moduleNumber: 1
            })
            : null;

        const hasStalePdf =
            firstModule &&
            firstModule.topics &&
            firstModule.topics[0] &&
            firstModule.topics[0].pdfUrl &&
            firstModule.topics[0].pdfUrl.includes(
                '01_What_Are_Data_Structures'
            );

        if (
            courseCount === 0 ||
            dsModulesCount !== 3 ||
            (dsCourse && dsCourse.durationHours !== 2.2) ||
            hasStalePdf
        ) {
            console.log('[Bootstrap] Synchronizing curriculum...');
            await seedDatabase();
        }

        // 3. Security headers
        app.use(
            helmet({
                contentSecurityPolicy: {
                    directives: {
                        defaultSrc: ["'self'"],
                        scriptSrc: [
                            "'self'",
                            "'unsafe-inline'",
                            'https://cdn.jsdelivr.net'
                        ],
                        styleSrc: [
                            "'self'",
                            "'unsafe-inline'",
                            'https://cdn.jsdelivr.net'
                        ],
                        imgSrc: [
                            "'self'",
                            'data:',
                            'blob:'
                        ],
                        fontSrc: [
                            "'self'",
                            'https://cdn.jsdelivr.net'
                        ],
                        connectSrc: ["'self'"],
                        frameSrc: [
                            "'self'",
                            'https://www.youtube.com',
                            'https://www.youtube-nocookie.com'
                        ],
                        objectSrc: ["'self'"]
                    }
                },
                crossOriginEmbedderPolicy: false
            })
        );

        // 4. Request logging
        if (process.env.NODE_ENV !== 'production') {
            app.use(morgan('dev'));
        }

        // 5. View engine
        app.engine('html', ejs.renderFile);
        app.set('view engine', 'html');
        app.set('views', path.join(__dirname, 'views'));

        // 6. Body parsers and method override
        app.use(express.urlencoded({ extended: true }));
        app.use(express.json());
        app.use(methodOverride('_method'));

        // 7. Static files
        app.use(express.static(path.join(__dirname, 'public')));

        // 8. Session configuration
        app.use(
            session({
                secret:
                    process.env.SESSION_SECRET ||
                    'focuslearn_wad_secret_fallback_2026',
                resave: false,
                saveUninitialized: false,
                store: MongoStore.create({
                    mongoUrl: dbInfo.uri,
                    collectionName: 'sessions',
                    ttl: 24 * 60 * 60
                }),
                cookie: {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 1000 * 60 * 60 * 24
                }
            })
        );

        // 9. Flash and authentication middleware
        app.use(flashMiddleware);
        app.use(attachUser);

        // 10. Global view locals
        app.use((req, res, next) => {
            res.locals.currentPath = req.path;
            next();
        });

        // 11. Home page
        app.get('/', async (req, res, next) => {
            try {
                const courses = await Course.find()
                    .sort({ order: 1 })
                    .lean();

                const publishedMaterials = await StudyMaterial.find({
                    isPublished: true
                }).sort({ createdAt: -1 });

                const materialMap = {};

                publishedMaterials.forEach(material => {
                    const key = material.courseId.toString();

                    if (!materialMap[key]) {
                        materialMap[key] = [];
                    }

                    materialMap[key].push(material);
                });

                courses.forEach(course => {
                    course.publishedMaterials =
                        materialMap[course._id.toString()] || [];
                });

                res.render('home', {
                    pageTitle: 'FocusLearn - Smart Learning Platform',
                    currentPath: '/',
                    courses
                });
            } catch (error) {
                next(error);
            }
        });

        // 12. Application routes
        app.use('/auth', authRoutes);
        app.use('/courses', courseRoutes);
        app.use('/lessons', lessonRoutes);
        app.use('/study', studyRoutes);
        app.use('/quizzes', quizRoutes);
        app.use('/dashboard', dashboardRoutes);
        app.use('/progress', progressRoutes);
        app.use('/admin', adminRoutes);

        // 13. Error handlers
        app.use(notFoundHandler);
        app.use(serverErrorHandler);

        // 14. Start server
        const server = app.listen(PORT, () => {
            console.log('====================================================');
            console.log('FocusLearn Web Application is running!');
            console.log(`Local Access: http://localhost:${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(
                `Database: ${dbInfo.isMemory ? 'In-Memory Fallback' : 'Persistent MongoDB'}`
            );
            console.log('====================================================');
        });

        return server;

    } catch (error) {
        console.error('Fatal: Failed to start FocusLearn server:', error);
        process.exit(1);
    }
}

// Start only when executed directly
if (require.main === module) {
    startServer();
}

module.exports = {
    app,
    startServer
};
