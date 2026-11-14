# FocusLearn — Smart Learning Platform (WAD Academic Project)

FocusLearn is a full-stack Web Application Development (WAD) project engineered with **Node.js, Express.js, EJS, MongoDB, and Mongoose**. It combines structured academic curriculum modules with an interactive **Study Timer** and a **10-Question Mastery Quiz System** with real-time server-side grading and persistent student progress analytics.

---

## 1. Important Note: 5 vs. 6 Course Discrepancy Resolution

* **Initial State:** The academic abstract mentioned 5 courses, whereas the website displayed 6 course cards:
  1. Applied Mathematics (`AMCS`)
  2. Data Structures (`DS`)
  3. Software Engineering (`SE`)
  4. Operating System (`OS`)
  5. DBMS (`DBMS`)
  6. Web Application and Development (`WAD`)
* **Resolution in FocusLearn:** All **6 courses** and their respective custom card graphics (`AMCS.png`, `DS.png`, `SE.png`, `OS.png`, `DBMS.png`, `WAD.png`) are preserved and dynamically seeded into MongoDB. If your faculty requires strictly 5 courses, any course can be removed or disabled in `scripts/seed.js` without altering database schema.

---

## 2. Technology Stack

* **Frontend:** HTML5, CSS3 (Custom Responsive CSS + Bootstrap 5.3.3 utilities), Vanilla JavaScript (no frontend frameworks).
* **Backend:** Node.js (v18+) & Express.js.
* **View Engine:** HTML5 Views with EJS rendering engine (all views use `.html` extension with modular partials `header.html`, `sidebar.html`, `footer.html`, `flash.html`).
* **Styling Separation:** 100% of styling is centralized in `.css` external stylesheets with zero inline styles (`style="..."` attributes) across all HTML views.
* **Database & ODM:** MongoDB with Mongoose.
* **Session Management:** `express-session` backed persistently by `connect-mongo`.
* **Security & Auth:** `bcryptjs` password hashing, `helmet` HTTP security headers, parameterized Mongoose queries, sanitized server evaluations.
* **Dual Database Mode:** Auto-detects local MongoDB / MongoDB Atlas; automatically falls back to an embedded in-memory MongoDB in development so the project runs out-of-the-box on any grading computer without requiring pre-installed MongoDB services.

---

## 3. Project Architecture (MVC)

```text
focuslearn/
├── config/
│   └── db.js                 # Database connection & in-memory dev fallback
├── controllers/
│   ├── authController.js      # Student registration, login, logout
│   ├── courseController.js    # Course catalog and course detail views
│   ├── dashboardController.js # Aggregated student study analytics
│   ├── lessonController.js    # Learning module reading interface
│   ├── progressController.js  # Course-by-course completion tracker
│   ├── quizController.js      # 10-Question quiz delivery and server scoring
│   └── studyController.js     # Study timer session lifecycle API
├── middleware/
│   ├── auth.js               # ensureAuthenticated, ensureGuest, attachUser
│   ├── errorHandler.js       # Centralized 404 and 500 error handlers
│   └── flash.js              # Session-based alert flash messaging
├── models/
│   ├── Course.js             # Course schema (code, title, duration, lessons)
│   ├── Module.js             # Learning module schema & curriculum content
│   ├── Quiz.js               # 10-Question quiz schema with answers & explanations
│   ├── QuizAttempt.js        # Student quiz submissions and scores
│   ├── StudentProgress.js    # Persistent module completion & study hours
│   ├── StudySession.js       # Timestamp-tracked focus timer sessions
│   └── User.js               # Student user schema with bcrypt hashing
├── public/
│   ├── css/
│   │   └── style.css         # Original dark sidebar & purple-gradient design
│   ├── images/               # AMCS.png, DS.png, SE.png, OS.png, DBMS.png, WAD.png
│   └── js/
│       └── studyTimer.js     # Client timer interface with server sync
├── routes/
│   ├── authRoutes.js
│   ├── courseRoutes.js
│   ├── dashboardRoutes.js
│   ├── lessonRoutes.js
│   ├── progressRoutes.js
│   ├── quizRoutes.js
│   └── studyRoutes.js
├── scripts/
│   └── seed.js               # Idempotent database seed for courses and 10-Q quizzes
├── views/
│   ├── auth/                 # login.html, register.html
│   ├── courses/              # index.html, details.html
│   ├── dashboard/            # index.html
│   ├── errors/               # 404.html, 500.html
│   ├── lessons/              # show.html
│   ├── partials/             # header.html, sidebar.html, footer.html, flash.html
│   ├── progress/             # index.html
│   ├── quizzes/              # show.html, result.html, review.html
│   ├── study/                # timer.html
│   └── home.html             # Landing overview page
├── .env.example
├── app.js                    # Express bootstrap & route mounting
├── package.json
├── test-suite.js             # Automated 13-point end-to-end verification test
└── README.md
```

---

## 4. Installation & Setup Instructions

### Step 1: Clone or Navigate to the Project
```bash
cd "C:\Users\Amritha\Downloads\WAD project"
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Configuration
Copy `.env.example` to `.env`:
```bash
# Windows PowerShell:
Copy-Item .env.example .env
```
Default `.env` configuration:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/focuslearn
SESSION_SECRET=focuslearn_super_secure_session_secret_wad_2026_key
```
> **Note:** If you have MongoDB installed locally, FocusLearn connects to `127.0.0.1:27017`. If MongoDB is not running, FocusLearn automatically spins up an in-memory MongoDB instance so the app runs smoothly with zero setup!

### Step 4: Seed Course and Quiz Content
Populate the database with the 6 courses, comprehensive learning modules, and 10-question quizzes:
```bash
npm run seed
```

### Step 5: Start the Application
For production/standard mode:
```bash
npm start
```
For automatic restart during development:
```bash
npm run dev
```

Open your browser at: **[http://localhost:3000](http://localhost:3000)**

### Step 6: Admin Portal & Content Management
FocusLearn includes a full administration control suite allowing instructors and administrators to create new courses, author learning modules/topics, build 10-question mastery quizzes, and manage study materials:
* **Admin Login Route:** `http://localhost:3000/auth/login`
* **Default Admin Email:** `admin@gmail.com`
* **Default Admin Password:** `Admin@12345`
* **Admin Dashboard:** `http://localhost:3000/admin`
* **Manage Courses:** `http://localhost:3000/admin/subjects`
* **Manage Topics / Modules:** `http://localhost:3000/admin/modules`
* **Manage 10-Question Quizzes:** `http://localhost:3000/admin/quizzes`
* **Manage Study Materials:** `http://localhost:3000/admin/materials`
* **Create/Promote Admin Account:** `node scripts/createAdmin.js`

---

## 5. Running Automated Verification Tests

FocusLearn includes an automated 13-point test suite checking server boot, database seeding, session authentication, bcrypt hashing, study timer APIs, 10-question quiz scoring, and MongoDB progress persistence:

```bash
npm test
```

Expected output:
```text
====================================================
>>> STARTING COMPREHENSIVE FOCUSLEARN TEST SUITE <<<
====================================================
[TEST 1] Server boot & Database connection: PASS
[TEST 2] GET / (Home Page): PASS (Status 200, FocusLearn branding found)
[TEST 3] GET /courses (Courses Catalog): PASS (Status 200, 6 courses rendered)
[TEST 4] Protected Route Security (/dashboard redirects guest to /auth/login): PASS
[TEST 5] Student Registration & Session Auto-Login: PASS (Redirects to /dashboard)
[TEST 6] Bcrypt Password Hashing in MongoDB: PASS
[TEST 7] Authenticated Dashboard View: PASS (Welcome greeting & student analytics rendered)
[TEST 8] Learning Module & Lesson Content: PASS (Educational material rendered)
[TEST 9a] Study Session Start API: PASS (Recorded in MongoDB)
[TEST 9b] Study Session Pause API: PASS
[TEST 9c] Study Session Resume API: PASS
[TEST 9d] Study Session Completion & Study Time Persistence: PASS
[TEST 10a] 10-Question Quiz Submission & Server Evaluation: PASS
[TEST 10b] QuizAttempt Record in MongoDB: PASS (Score: 8/10, 80%, Passed: true)
[TEST 11] StudentProgress Persistence in MongoDB: PASS (Module completed & tracked)
[TEST 12] GET /progress View: PASS (Course-wise breakdown & purple progress bars)
[TEST 13] Custom 404 Error Handler: PASS
====================================================
>>> ALL 13 VERIFICATION TESTS PASSED SUCCESSFULLY! <<<
====================================================
```

---

## 6. Key Application Features

### 1. Study Timer & Attention Tracking
* **Preset & Custom Durations:** Select 15m, 25m (Pomodoro), 45m, 60m, or any custom interval up to 180m.
* **Full Session Controls:** Start, Pause, Resume, 5-minute Break, and Extend (+5m) options.
* **Server-side Authoritative Timestamps:** Inactive tabs and refreshes do not drift timer accuracy. Actual elapsed time is calculated using MongoDB timestamps (`startTime`, `pauseIntervals`, `totalPausedSeconds`).
* **Academic Attention Notice:** Explains the physical limitation of browser attention measurement and pairs study sessions directly with mandatory comprehension quizzes.

### 2. 10-Question Quiz Assessment System
* **Curriculum Alignment:** Exactly 10 multiple-choice questions per module with 4 options each.
* **Server-side Security:** Correct answers are **never sent to the browser** during the attempt, preventing client-side inspection tampering.
* **6/10 Passing Benchmark:** Consistent passing mark of 60%.
* **Immediate Feedback & Review:** Full question review displaying student choice, correct answer, and detailed conceptual explanations.
* **Revision System:** Failing students receive encouragement and a revision timer launcher to revisit the lesson before retrying.

### 3. Student Dashboard & Progress Analytics
* **Real-time MongoDB Aggregations:** Displays courses started, courses completed, total study hours, quizzes taken, and average score.
* **Recent Activity Tables:** View the last 5 study sessions and quiz outcomes.
* **Visual Purple Progress Bars:** Course-by-course completion percentages update dynamically when quizzes are passed.

---

## 7. Complete Application Route Map

| Method | Route | Description | Protection |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Home landing page with platform overview | Public |
| `GET` | `/courses` | Catalog of all 6 courses with progress bars | Public |
| `GET` | `/courses/:slug` | Course details and interactive module list | Public |
| `GET` | `/lessons/:id` | Educational reading module and takeaways | Public |
| `GET` | `/auth/login` | Student login page | Guest only |
| `POST` | `/auth/login` | Authenticate student and create session | Guest only |
| `GET` | `/auth/register` | Student registration page | Guest only |
| `POST` | `/auth/register` | Validate and create hashed student account | Guest only |
| `POST` | `/auth/logout` | Destroy session and clear cookie | Authenticated |
| `GET` | `/dashboard` | Student analytics, stats, recent activities | Authenticated |
| `GET` | `/progress` | Course-by-course progress and quiz benchmarks | Authenticated |
| `GET` | `/study/timer` | Interactive study timer page | Authenticated |
| `POST` | `/study/session/start` | Start study session on MongoDB | Authenticated |
| `POST` | `/study/session/:id/pause` | Pause session and record interval | Authenticated |
| `POST` | `/study/session/:id/resume` | Resume session and calculate paused seconds | Authenticated |
| `POST` | `/study/session/:id/break` | Take a 5-minute break | Authenticated |
| `POST` | `/study/session/:id/extend` | Extend session duration | Authenticated |
| `POST` | `/study/session/:id/complete`| Complete session and save study time | Authenticated |
| `POST` | `/study/session/:id/cancel` | Cancel session | Authenticated |
| `GET` | `/quizzes/:moduleId` | 10-Question quiz attempt interface | Authenticated |
| `POST` | `/quizzes/:moduleId/submit` | Grade quiz on server and update progress | Authenticated |
| `GET` | `/quizzes/attempt/:id/result`| Quiz score result and revision prompt | Authenticated |
| `GET` | `/quizzes/attempt/:id/review`| Question-by-question review & explanations| Authenticated |

---

## 8. Academic Project Demonstration Checklist

Follow this sequence when presenting FocusLearn to your faculty or evaluator:

1. **Brand & Design Continuity:**
   * Open `http://localhost:3000`. Show the original dark sidebar, FocusLearn logo, and purple palette.
   * Navigate to `http://localhost:3000/courses`. Show all 6 original course cards (`AMCS`, `DS`, `SE`, `OS`, `DBMS`, `WAD`) loaded dynamically from MongoDB.
2. **Student Authentication & Security:**
   * Click **Register** in the sidebar. Register a new student account.
   * Demonstrate validation (e.g. matching password check, duplicate email prevention).
   * Note that passwords in MongoDB are hashed using `bcryptjs` with salt rounds.
3. **Course Exploration & Lesson Reading:**
   * Select **Web Application and Development**.
   * Open **Module 1: Full-Stack Architecture & Express/Node Fundamentals**.
   * Show the structured educational content, key concepts, and navigation links.
4. **Interactive Study Timer:**
   * Click **Launch Study Timer**. Select the course and module.
   * Choose **25 Mins (Pomodoro)** or custom time and click **Start Focused Study**.
   * Demonstrate **Pause**, **Resume**, **Take 5m Break**, and **Extend (+5m)**.
   * Click **Finish Early**. Note the completion modal and click **Attempt 10-Question Quiz Now**.
5. **10-Question Quiz & Server Grading:**
   * Answer the 10 questions. Show the live answered counter.
   * Submit the quiz. Note that evaluation is computed strictly on the Express server.
   * Demonstrate the **Scorecard Result**:
     * If $\ge$ 6/10: Green "Assessment Passed!" badge and module completion.
     * If $<$ 6/10: Encouraging revision prompt with a time selector to reopen the module.
   * Click **Review Correct & Incorrect Answers** to show question explanations.
6. **Dashboard & Academic Progress:**
   * Navigate to **DASHBOARD**. Show real-time statistics (Courses started, logged focus hours, quizzes attempted, average score, and recent activity history).
   * Navigate to **PROGRESS**. Show the course progress breakdown and the purple progress bar advancement.
7. **Protected Route Verification:**
   * Click **LOGOUT**.
   * Attempt to open `/dashboard` directly in the address bar. Show that FocusLearn securely redirects unauthenticated requests back to `/auth/login`.

---

## 9. Common Troubleshooting

* **Port 3000 in use:** Change `PORT=3001` in your `.env` file.
* **MongoDB connection warning:** If local MongoDB is not running, FocusLearn automatically activates its embedded in-memory MongoDB fallback. No action is required.
* **Database Reset:** Run `npm run seed` to re-seed curriculum courses and quizzes at any time without creating duplicates.

## Updated Learning Materials and Topic Quiz Workflow

- Admins can manage published/unpublished study materials from `/admin/materials` and associate a resource with a course and optional module/topic number.
- Published resources are linked from the home page and course catalogue, and are displayed in the course, lesson, study-room, quiz, and quiz-result views.
- Admins can create or replace a quiz for each module from `/admin/quizzes`. The form enforces 10 questions, four options per question, and one correct option. Correct answers are evaluated on the server and are not sent to the student quiz page.
- Students can open the quiz using **Complete Module** or automatically when the study countdown reaches zero. A module is recorded as completed after the student passes its quiz.
- Admins can review attempts, student names, scores, percentages, and pass status at `/admin/quiz-results`.
- Study duration is read from the module's `estimatedMinutes` value (and the existing optional `duration` query override), rather than being fixed in the quiz workflow.

### Running the updated project on Windows

1. Extract the ZIP and open the `FocusLearn` folder in VS Code.
2. Create a local `.env` file using `.env.example` as a template. Set your own `MONGODB_URI` and `SESSION_SECRET` values.
3. Open a terminal in the project folder and run `npm.cmd install`.
4. Start MongoDB, then run `npm.cmd run dev`.
5. Open `http://localhost:3000`. Sign in with your existing admin account and use the Admin Dashboard links for materials, quizzes, and results.
