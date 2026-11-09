/**
 * FocusLearn Client App Scripts
 * Initializes dynamic UI components without requiring inline styles in HTML
 */
document.addEventListener('DOMContentLoaded', () => {
    // Dynamically apply progress widths from data-progress attribute
    const progressBars = document.querySelectorAll('[data-progress]');
    progressBars.forEach(el => {
        const val = parseFloat(el.getAttribute('data-progress')) || 0;
        el.style.width = Math.min(Math.max(val, 0), 100) + '%';
    });
});
