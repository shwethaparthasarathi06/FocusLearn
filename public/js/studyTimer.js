document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const setupSection = document.getElementById('timer-setup-section');
    const activeSection = document.getElementById('timer-active-section');
    const completedSection = document.getElementById('timer-completed-section');

    const courseSelect = document.getElementById('course-select');
    const moduleSelect = document.getElementById('module-select');

    const btnStart = document.getElementById('btn-start-session');
    const btnPause = document.getElementById('btn-pause');
    const btnResume = document.getElementById('btn-resume');
    const btnBreak = document.getElementById('btn-break');
    const btnExtend = document.getElementById('btn-extend');
    const btnCompleteEarly = document.getElementById('btn-complete-early');
    const btnCancel = document.getElementById('btn-cancel');

    const timerDisplay = document.getElementById('timer-display');
    const timerCircle = document.getElementById('timer-circle-widget');
    const timerStatusBadge = document.getElementById('timer-status-badge');
    const sessionCourseTitle = document.getElementById('session-course-title');
    const sessionModuleTitle = document.getElementById('session-module-title');
    const btnAttemptQuiz = document.getElementById('btn-attempt-quiz');
    const btnNewSession = document.getElementById('btn-new-session');

    let currentSession = typeof INITIAL_SESSION !== 'undefined' ? INITIAL_SESSION : null;
    let timerInterval = null;

    // Filter modules based on course selection
    function filterModules() {
        const selectedCourseId = courseSelect.value;
        const options = moduleSelect.querySelectorAll('option');

        let firstMatch = '';
        options.forEach(opt => {
            if (!opt.value) return; // Keep placeholder
            const courseId = opt.getAttribute('data-course');
            if (!selectedCourseId || courseId === selectedCourseId) {
                opt.style.display = 'block';
                if (!firstMatch) firstMatch = opt.value;
            } else {
                opt.style.display = 'none';
            }
        });

        if (firstMatch && (!moduleSelect.value || moduleSelect.selectedOptions[0].style.display === 'none')) {
            moduleSelect.value = firstMatch;
        }
    }

    if (courseSelect) {
        courseSelect.addEventListener('change', filterModules);
        filterModules();
    }


    // Format seconds into MM:SS
    function formatTime(totalSeconds) {
        if (totalSeconds < 0) totalSeconds = 0;
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Calculate remaining seconds based on server timestamps
    function getRemainingSeconds(session) {
        if (!session) return 0;
        const plannedTotalSeconds = (session.plannedDurationMinutes + (session.extendedMinutes || 0)) * 60;
        const startTime = new Date(session.startTime).getTime();
        const now = Date.now();

        let pausedSeconds = session.totalPausedSeconds || 0;
        if (session.status === 'paused' || session.status === 'break') {
            // Find current ongoing pause
            if (session.pauseIntervals && session.pauseIntervals.length > 0) {
                const lastPause = session.pauseIntervals[session.pauseIntervals.length - 1];
                if (!lastPause.resumedAt) {
                    pausedSeconds += Math.floor((now - new Date(lastPause.pausedAt).getTime()) / 1000);
                }
            }
        }

        const elapsedSeconds = Math.max(0, Math.floor((now - startTime) / 1000) - pausedSeconds);
        return Math.max(0, plannedTotalSeconds - elapsedSeconds);
    }

    // Update UI display
    function updateTimerUI() {
        if (!currentSession) return;

        const remaining = getRemainingSeconds(currentSession);
        timerDisplay.textContent = formatTime(remaining);

        if (currentSession.status === 'in-progress') {
            btnPause.style.display = 'inline-block';
            btnResume.style.display = 'none';
            btnBreak.style.display = 'inline-block';
            timerStatusBadge.className = 'timer-status-badge status-active';
            timerStatusBadge.innerHTML = '<i class="bi bi-record-circle me-1"></i> Focus Mode Active';
            timerCircle.style.borderColor = '#ecebff';
            timerCircle.style.borderTopColor = 'var(--primary-purple)';
        } else if (currentSession.status === 'paused') {
            btnPause.style.display = 'none';
            btnResume.style.display = 'inline-block';
            btnBreak.style.display = 'none';
            timerStatusBadge.className = 'timer-status-badge status-paused';
            timerStatusBadge.innerHTML = '<i class="bi bi-pause-circle me-1"></i> Session Paused';
            timerCircle.style.borderColor = '#fff3cd';
            timerCircle.style.borderTopColor = '#ffc107';
        } else if (currentSession.status === 'break') {
            btnPause.style.display = 'none';
            btnResume.style.display = 'inline-block';
            btnBreak.style.display = 'none';
            timerStatusBadge.className = 'timer-status-badge status-break';
            timerStatusBadge.innerHTML = '<i class="bi bi-cup-hot me-1"></i> On Break';
            timerCircle.style.borderColor = '#e0f2fe';
            timerCircle.style.borderTopColor = '#0284c7';
        }

        // If time reached 0, trigger automatic completion
        if (remaining <= 0 && currentSession.status === 'in-progress') {
            completeSession();
        }
    }

    function startTick() {
        if (timerInterval) clearInterval(timerInterval);
        updateTimerUI();
        timerInterval = setInterval(updateTimerUI, 1000);
    }

    // Start New Session
    if (btnStart) {
        btnStart.addEventListener('click', async () => {
            const courseId = courseSelect.value;
            const moduleId = moduleSelect.value;
            const selectedModuleOption = moduleSelect.options[moduleSelect.selectedIndex];
            const duration = parseInt(selectedModuleOption.getAttribute('data-mins'), 10) || 25;

            if (!courseId || !moduleId) {
                alert('Please select both a course and a module before starting.');
                return;
            }

            try {
                btnStart.disabled = true;
                btnStart.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Starting...';

                const response = await fetch('/study/session/start', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        courseId,
                        moduleId,
                        plannedDurationMinutes: duration
                    })
                });

                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'Failed to start session');
                }

                currentSession = data.session;
                sessionCourseTitle.textContent = currentSession.courseId ? currentSession.courseId.title : 'Course';
                sessionModuleTitle.textContent = currentSession.moduleId ? currentSession.moduleId.title : 'Module';

                setupSection.style.display = 'none';
                activeSection.style.display = 'block';
                completedSection.style.display = 'none';

                startTick();
            } catch (err) {
                alert(err.message);
            } finally {
                btnStart.disabled = false;
                btnStart.innerHTML = '<i class="bi bi-play-circle-fill me-2"></i> Start Focused Study';
            }
        });
    }

    // Pause Session
    if (btnPause) {
        btnPause.addEventListener('click', async () => {
            if (!currentSession) return;
            try {
                const response = await fetch(`/study/session/${currentSession._id}/pause`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await response.json();
                if (data.success) {
                    currentSession = data.session;
                    updateTimerUI();
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    // Resume Session
    if (btnResume) {
        btnResume.addEventListener('click', async () => {
            if (!currentSession) return;
            try {
                const response = await fetch(`/study/session/${currentSession._id}/resume`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await response.json();
                if (data.success) {
                    currentSession = data.session;
                    updateTimerUI();
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    // Break (5 min)
    if (btnBreak) {
        btnBreak.addEventListener('click', async () => {
            if (!currentSession) return;
            try {
                const response = await fetch(`/study/session/${currentSession._id}/break`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await response.json();
                if (data.success) {
                    currentSession = data.session;
                    updateTimerUI();
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    // Extend Session (+5 min)
    if (btnExtend) {
        btnExtend.addEventListener('click', async () => {
            if (!currentSession) return;
            try {
                const response = await fetch(`/study/session/${currentSession._id}/extend`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ minutes: 5 })
                });
                const data = await response.json();
                if (data.success) {
                    currentSession = data.session;
                    updateTimerUI();
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    // Complete Session
    async function completeSession() {
        if (!currentSession) return;
        if (timerInterval) clearInterval(timerInterval);

        try {
            const response = await fetch(`/study/session/${currentSession._id}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data.success) {
                const moduleId = currentSession.moduleId ? (currentSession.moduleId._id || currentSession.moduleId) : '';
                btnAttemptQuiz.href = `/quizzes/${moduleId}`;

                activeSection.style.display = 'none';
                setupSection.style.display = 'none';
                completedSection.style.display = 'block';
                currentSession = null;
            }
        } catch (err) {
            console.error(err);
        }
    }

    if (btnCompleteEarly) {
        btnCompleteEarly.addEventListener('click', () => {
            if (confirm('Are you ready to complete this study session and move to the knowledge quiz?')) {
                completeSession();
            }
        });
    }

    // Cancel Session
    if (btnCancel) {
        btnCancel.addEventListener('click', async () => {
            if (!confirm('Are you sure you want to cancel this study session? Unfinished time will not be recorded.')) {
                return;
            }
            if (timerInterval) clearInterval(timerInterval);
            try {
                await fetch(`/study/session/${currentSession._id}/cancel`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (e) {
                console.error(e);
            }
            currentSession = null;
            activeSection.style.display = 'none';
            completedSection.style.display = 'none';
            setupSection.style.display = 'block';
        });
    }

    if (btnNewSession) {
        btnNewSession.addEventListener('click', () => {
            completedSection.style.display = 'none';
            setupSection.style.display = 'block';
        });
    }

    // If an existing session was restored from page load
    if (currentSession && (currentSession.status === 'in-progress' || currentSession.status === 'paused' || currentSession.status === 'break')) {
        setupSection.style.display = 'none';
        activeSection.style.display = 'block';
        completedSection.style.display = 'none';
        startTick();
    }
});
