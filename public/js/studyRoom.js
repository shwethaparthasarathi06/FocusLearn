document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Variables & Durations
    const defaultMins = (typeof MODULE_MINS !== 'undefined' && MODULE_MINS > 0) ? MODULE_MINS : 20;
    let initialSeconds = (typeof TEST_DURATION !== 'undefined' && TEST_DURATION && TEST_DURATION > 0)
        ? parseInt(TEST_DURATION, 10)
        : (defaultMins * 60);

    let remainingSeconds = initialSeconds;
    let timerInterval = null;
    let isPaused = false;
    let warningTriggered = false;

    // Break variables
    let isOnBreak = false;
    let breakRemainingSeconds = 300; // 5 minutes = 300 seconds
    let savedStudySeconds = remainingSeconds;

    // 2. DOM Elements
    const timerDisplay = document.getElementById('timer-display');
    const timerSublabel = document.getElementById('timer-sublabel');
    const timerBox = document.getElementById('timer-box');
    const progressBar = document.getElementById('timer-progress-bar');
    const tenSecWarningCard = document.getElementById('ten-sec-warning-card');
    const floatingAlert10sec = document.getElementById('floating-alert-10sec');
    const timerCompletedCard = document.getElementById('timer-completed-card');
    const btnPause = document.getElementById('btn-pause');
    const btnResume = document.getElementById('btn-resume');
    const btnReset = document.getElementById('btn-reset');
    const btnBreak = document.getElementById('btn-break');
    const btnEndBreak = document.getElementById('btn-end-break');
    const btnAddExtra10 = document.getElementById('btn-add-extra-10');
    const startLearningWrap = document.getElementById('start-learning-wrap');
    const btnStartLearning = document.getElementById('btn-start-learning');
    const btnCancel = document.getElementById('btn-cancel');

    // 3. Helper: Format MM:SS
    function formatTime(totalSeconds) {
        if (totalSeconds < 0) totalSeconds = 0;
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // 4. Subtle Audio Tone on 10s alert
    function playWarningBeep() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(784, ctx.currentTime);
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
            osc.start();
            osc.stop(ctx.currentTime + 0.35);
        } catch (e) {
            // Audio policy exception fallback
        }
    }

    // 5. Update UI
    function render() {
        if (!timerDisplay) return;

        if (isOnBreak) {
            // Break Mode Display
            timerDisplay.textContent = formatTime(breakRemainingSeconds);
            if (timerSublabel) timerSublabel.textContent = '☕ Break Time Remaining';
            if (timerBox) {
                timerBox.classList.remove('warning-state');
                timerBox.classList.add('break-state');
            }
            const breakPct = Math.max(0, Math.min(100, (breakRemainingSeconds / 300) * 100));
            if (progressBar) {
                progressBar.style.width = breakPct + '%';
                progressBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-info';
            }
            if (tenSecWarningCard) tenSecWarningCard.classList.add('d-none');
            if (floatingAlert10sec) floatingAlert10sec.classList.add('d-none');
            return;
        }

        // Normal Study Mode Display
        timerDisplay.textContent = formatTime(remainingSeconds);
        if (timerSublabel) timerSublabel.textContent = 'Time Remaining';
        if (timerBox) timerBox.classList.remove('break-state');

        // Progress bar percentage
        const pct = Math.max(0, Math.min(100, (remainingSeconds / initialSeconds) * 100));
        if (progressBar) {
            progressBar.style.width = pct + '%';
            progressBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-primary';
        }

        // Check if 10 seconds or fewer left (and not yet expired)
        if (remainingSeconds <= 10 && remainingSeconds > 0) {
            if (tenSecWarningCard) tenSecWarningCard.classList.remove('d-none');
            if (floatingAlert10sec) floatingAlert10sec.classList.remove('d-none');
            if (timerBox) timerBox.classList.add('warning-state');

            if (!warningTriggered) {
                warningTriggered = true;
                playWarningBeep();
            }
        } else if (remainingSeconds > 10) {
            if (tenSecWarningCard) tenSecWarningCard.classList.add('d-none');
            if (floatingAlert10sec) floatingAlert10sec.classList.add('d-none');
            if (timerBox) timerBox.classList.remove('warning-state');
        }

        // Check completion (timer hits 0)
        if (remainingSeconds <= 0) {
            onTimerComplete();
        }
    }

    // 6. Handle Completion -> Close Tab Automatically
    function onTimerComplete() {
        if (timerInterval) clearInterval(timerInterval);

        if (timerDisplay) timerDisplay.textContent = '00:00';
        if (progressBar) progressBar.style.width = '0%';
        if (tenSecWarningCard) tenSecWarningCard.classList.add('d-none');
        if (floatingAlert10sec) floatingAlert10sec.classList.add('d-none');
        if (timerCompletedCard) timerCompletedCard.classList.remove('d-none');

        // Close this tab automatically
        console.log('[Timer] Complete! Attempting automatic tab close...');
        window.close();

        // Retry multiple times in case of browser timing
        setTimeout(() => { window.close(); }, 300);
        setTimeout(() => { window.close(); }, 800);
        setTimeout(() => { window.close(); }, 1500);
    }

    // 7. Tick Function
    function tick() {
        if (isPaused) return;

        if (isOnBreak) {
            breakRemainingSeconds--;
            if (breakRemainingSeconds <= 0) {
                // Break ended -> return to study timer
                endBreak();
            } else {
                render();
            }
            return;
        }

        remainingSeconds--;
        render();
    }

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        render();
        timerInterval = setInterval(tick, 1000);
    }

    // Stop & Freeze Timer upon Course Completion
    function stopTimerOnCourseCompleted() {
        if (timerInterval) clearInterval(timerInterval);
        isPaused = true;

        if (timerSublabel) {
            timerSublabel.textContent = 'Course Completed';
        }

        if (progressBar) {
            progressBar.style.width = '100%';
            progressBar.className = 'progress-bar bg-success';
        }

        if (btnPause) {
            btnPause.disabled = true;
            btnPause.classList.add('disabled');
        }
        if (btnResume) {
            btnResume.disabled = true;
            btnResume.classList.add('disabled');
        }
        if (btnReset) {
            btnReset.disabled = true;
            btnReset.classList.add('disabled');
        }
        if (btnBreak) {
            btnBreak.disabled = true;
            btnBreak.classList.add('disabled');
        }
        if (btnEndBreak) {
            btnEndBreak.disabled = true;
            btnEndBreak.classList.add('disabled');
        }
        if (btnAddExtra10) {
            btnAddExtra10.disabled = true;
            btnAddExtra10.classList.add('disabled');
        }
        if (tenSecWarningCard) {
            tenSecWarningCard.classList.add('d-none');
        }
        if (floatingAlert10sec) {
            floatingAlert10sec.classList.add('d-none');
        }

        // Show Start Learning play button in the timer box so student can redo
        if (startLearningWrap) {
            startLearningWrap.classList.remove('d-none');
        }
    }

    // Start or Redo Learning Functionality
    function startOrRedoLearning() {
        if (startLearningWrap) {
            startLearningWrap.classList.add('d-none');
        }

        remainingSeconds = initialSeconds;
        isPaused = false;
        isOnBreak = false;
        warningTriggered = false;

        // Re-enable and reset controls
        if (btnPause) {
            btnPause.disabled = false;
            btnPause.classList.remove('disabled', 'd-none');
        }
        if (btnResume) {
            btnResume.disabled = false;
            btnResume.classList.add('d-none');
            btnResume.classList.remove('disabled');
        }
        if (btnReset) {
            btnReset.disabled = false;
            btnReset.classList.remove('disabled');
        }
        if (btnBreak) {
            btnBreak.disabled = false;
            btnBreak.classList.remove('disabled', 'd-none');
        }
        if (btnEndBreak) {
            btnEndBreak.disabled = false;
            btnEndBreak.classList.add('d-none');
        }
        if (btnAddExtra10) {
            btnAddExtra10.disabled = false;
            btnAddExtra10.classList.remove('disabled');
        }

        // Re-enable complete module button for this study cycle
        if (btnCompleteCourse) {
            btnCompleteCourse.disabled = false;
            btnCompleteCourse.className = 'btn btn-outline-success w-100 fw-semibold';
            btnCompleteCourse.innerHTML = '<i class="bi bi-check-circle me-2"></i> Complete Module';
        }

        if (timerCompletedCard) {
            timerCompletedCard.classList.add('d-none');
        }

        // Background session recording for the redo run
        if (typeof COURSE_ID !== 'undefined' && typeof MODULE_ID !== 'undefined') {
            fetch('/study/session/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: COURSE_ID,
                    moduleId: MODULE_ID,
                    plannedDurationMinutes: defaultMins
                })
            }).catch(err => console.debug('Session redo start tracking skipped:', err));
        }

        startTimer();
    }

    if (btnStartLearning) {
        btnStartLearning.addEventListener('click', startOrRedoLearning);
    }

    // 8. Auto-start on tab load (or display ready-to-redo state if already completed)
    if (typeof IS_MODULE_COMPLETED !== 'undefined' && IS_MODULE_COMPLETED) {
        stopTimerOnCourseCompleted();
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(initialSeconds);
        }
    } else {
        startTimer();
    }

    // 9. Pause / Resume Controls
    if (btnPause) {
        btnPause.addEventListener('click', () => {
            isPaused = true;
            btnPause.classList.add('d-none');
            if (btnResume) btnResume.classList.remove('d-none');
        });
    }

    if (btnResume) {
        btnResume.addEventListener('click', () => {
            isPaused = false;
            btnResume.classList.add('d-none');
            if (btnPause) btnPause.classList.remove('d-none');
        });
    }

    // 10. Reset Control
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (isOnBreak) {
                endBreak();
            }
            startOrRedoLearning();
        });
    }

    // 11. 5-Min Break Functionality
    function startBreak() {
        isOnBreak = true;
        savedStudySeconds = remainingSeconds;
        breakRemainingSeconds = 300; // 5 mins
        isPaused = false;

        if (btnBreak) btnBreak.classList.add('d-none');
        if (btnEndBreak) btnEndBreak.classList.remove('d-none');
        if (btnResume) btnResume.classList.add('d-none');
        if (btnPause) btnPause.classList.remove('d-none');

        render();
    }

    function endBreak() {
        isOnBreak = false;
        remainingSeconds = savedStudySeconds;

        if (btnEndBreak) btnEndBreak.classList.add('d-none');
        if (btnBreak) btnBreak.classList.remove('d-none');
        if (timerBox) timerBox.classList.remove('break-state');

        render();
    }

    if (btnBreak) {
        btnBreak.addEventListener('click', startBreak);
    }

    if (btnEndBreak) {
        btnEndBreak.addEventListener('click', endBreak);
    }

    // 12. Add Extra 10 Mins Functionality
    if (btnAddExtra10) {
        btnAddExtra10.addEventListener('click', () => {
            const addedSeconds = 10 * 60; // 600 seconds
            initialSeconds += addedSeconds;

            if (isOnBreak) {
                savedStudySeconds += addedSeconds;
            } else {
                remainingSeconds += addedSeconds;
            }

            // If we were in warning state and now have > 10 seconds, reset warning
            if (remainingSeconds > 10) {
                warningTriggered = false;
                if (tenSecWarningCard) tenSecWarningCard.classList.add('d-none');
                if (floatingAlert10sec) floatingAlert10sec.classList.add('d-none');
                if (timerBox) timerBox.classList.remove('warning-state');
            }

            render();

            // Visual button confirmation
            const originalHtml = btnAddExtra10.innerHTML;
            btnAddExtra10.innerHTML = '<i class="bi bi-check-circle-fill me-2 text-success"></i> +10 Mins Added!';
            btnAddExtra10.classList.remove('btn-outline-primary');
            btnAddExtra10.classList.add('btn-primary', 'text-white');

            setTimeout(() => {
                btnAddExtra10.innerHTML = originalHtml;
                btnAddExtra10.classList.remove('btn-primary', 'text-white');
                btnAddExtra10.classList.add('btn-outline-primary');
            }, 1500);

            // Optional background session extend
            fetch('/study/session/extend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ minutes: 10 })
            }).catch(() => { });
        });
    }

    // 13. Background session recording (optional, non-blocking)
    if (typeof COURSE_ID !== 'undefined' && typeof MODULE_ID !== 'undefined') {
        fetch('/study/session/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                courseId: COURSE_ID,
                moduleId: MODULE_ID,
                plannedDurationMinutes: defaultMins
            })
        }).catch(err => console.debug('Session start tracking skipped:', err));
    }

    // 14. Complete Module Functionality
    const btnCompleteCourse = document.getElementById('btn-complete-course');
    const courseCompletedCard = document.getElementById('course-completed-card');
    const completedCardText = document.getElementById('completed-card-text');

    if (btnCompleteCourse) {
        btnCompleteCourse.addEventListener('click', async () => {
            if (btnCompleteCourse.disabled) return;
            const confirmed = confirm('Are you sure you want to mark this module as completed?');
            if (!confirmed) return;

            try {
                btnCompleteCourse.disabled = true;
                const originalHtml = btnCompleteCourse.innerHTML;
                btnCompleteCourse.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Completing Module...';

                const response = await fetch(`/study/module/${MODULE_ID}/complete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    btnCompleteCourse.className = 'btn btn-success text-white w-100 fw-semibold';
                    btnCompleteCourse.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> Module Completed!';
                    btnCompleteCourse.disabled = true;

                    // Immediately stop and freeze timer
                    stopTimerOnCourseCompleted();

                    if (courseCompletedCard) {
                        if (completedCardText) {
                            completedCardText.textContent = data.isCourseCompleted
                                ? 'All Modules Finished - Course Completed! 🎉'
                                : `Module Completed! 🎉 (${data.completedModulesCount}/${data.totalModulesCount} Modules Done - ${data.completionPercentage}%)`;
                        }
                        courseCompletedCard.classList.remove('d-none');
                        courseCompletedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                } else {
                    alert(data.message || 'Failed to complete module.');
                    btnCompleteCourse.disabled = false;
                    btnCompleteCourse.innerHTML = originalHtml;
                }
            } catch (err) {
                console.error('Error completing module:', err);
                alert('Network error while completing module. Please try again.');
                btnCompleteCourse.disabled = false;
                btnCompleteCourse.innerHTML = '<i class="bi bi-check-circle me-2"></i> Complete Module';
            }
        });
    }

    // 15. Cancel Session Functionality (Red Button)
    if (btnCancel) {
        btnCancel.addEventListener('click', async () => {
            const confirmed = confirm('Are you sure you want to cancel this study session?');
            if (!confirmed) return;

            if (timerInterval) clearInterval(timerInterval);
            isPaused = true;

            try {
                await fetch('/study/session/cancel-active', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ moduleId: MODULE_ID, courseId: COURSE_ID })
                });
            } catch (e) {
                console.debug('Cancel error:', e);
            }

            // Close current tab/window or navigate back to the course
            window.close();
            setTimeout(() => {
                if (typeof COURSE_SLUG !== 'undefined' && COURSE_SLUG) {
                    window.location.href = `/courses/${COURSE_SLUG}`;
                } else {
                    window.location.href = '/courses';
                }
            }, 300);
        });
    }
});

