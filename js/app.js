// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .catch(err => console.log('SW failed', err));
    });
}

// Listen for OPEN_REMINDERS postMessage from SW (app already open when notification tapped)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'OPEN_REMINDERS') {
            const reminderId = event.data.reminderId || null;
            if (typeof showReminderSheet === 'function') {
                showReminderSheet(reminderId);
            }
        }
    });
}

// Global State
let scanHistory = JSON.parse(localStorage.getItem('pulpProHistory')) || [];
let activeFruit = '';
let activeBrand = '';

// App Init
window.addEventListener('load', () => {
    renderHistory();
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 1200);

    const params = new URLSearchParams(window.location.search);

    // Restore session from notification tap URL params
    const codeParam = params.get('code');
    const adminParam = params.get('admin');
    if (adminParam === 'true' && !localStorage.getItem('pulpProAdmin') && !localStorage.getItem('pulpProAccessCode')) {
        localStorage.setItem('pulpProAdmin', 'true');
    } else if (codeParam && !localStorage.getItem('pulpProAccessCode') && !localStorage.getItem('pulpProAdmin')) {
        localStorage.setItem('pulpProAccessCode', codeParam.toUpperCase());
    }

    // Check for ?open=reminders param — show sheet as soon as app is ready
    if (params.get('open') === 'reminders') {
        const reminderId = params.get('reminderId') || null;
        // Clean URL immediately
        window.history.replaceState({}, '', window.location.pathname);
        // Show sheet after app initialises — 800ms is enough for checkAccess + render
        setTimeout(() => {
            if (typeof showReminderSheet === 'function') {
                showReminderSheet(reminderId);
            }
        }, 800);
    }
});

// Theme Toggle
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('pulpTheme', isLight ? 'light' : 'dark');
    document.getElementById('themeText').innerText = isLight ? 'Light Mode' : 'Dark Mode';
}

// Menu Toggle
function toggleMenu() {
    document.getElementById('menu-drawer').classList.toggle('open');
    document.getElementById('menu-overlay').classList.toggle('open');
}

// Send Feedback
function sendFeedback() {
    const theme = document.body.classList.contains('light-theme') ? 'Light' : 'Dark';
    const historyCount = scanHistory.length;
    const subject = encodeURIComponent("Pulp Pro App Feedback");
    const body = encodeURIComponent(`Hi Team,\n\nI have some feedback for Pulp Pro:\n\n[Your feedback here]\n\n---\nApp Stats for Debugging:\nTheme: ${theme}\nLogged Scans: ${historyCount}\nPlatform: ${navigator.platform}`);
    window.location.href = `mailto:ar.varma@hotmail.com?subject=${subject}&body=${body}`;
}

// Clear History
function clearHistory() {
    scanHistory = [];
    localStorage.removeItem('pulpProHistory');
    renderHistory();
}

// Apply Update
function applyUpdate() {
    window.location.reload(true);
}
