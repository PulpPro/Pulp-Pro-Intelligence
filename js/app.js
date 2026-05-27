// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .catch(err => console.log('SW failed', err));
    });
}

// Listen for messages from SW
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (!event.data) return;

        if (event.data.type === 'OPEN_REMINDERS') {
            const reminderId = event.data.reminderId || null;
            if (typeof showReminderSheet === 'function') {
                showReminderSheet(reminderId);
            }
        }

        if (event.data.type === 'REMINDER_UPDATED') {
            // Notification action (Done/Snooze) was taken — sync from KV to localStorage
            const isAdmin = localStorage.getItem('pulpProAdmin') === 'true';
            const userCode = localStorage.getItem('pulpProAccessCode') || (isAdmin ? 'admin' : null);
            if (!userCode) return;
            fetch('https://pulppro-access.pulpprobrain.workers.dev/reminders-get', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userCode, secret: 'pulpro2024' })
            })
            .then(r => r.json())
            .then(data => {
                if (data.reminders) {
                    localStorage.setItem('pulpai_reminders', JSON.stringify(data.reminders));
                    if (typeof renderReminderTilePreview === 'function') renderReminderTilePreview();
                    if (typeof renderRemindersList === 'function') {
                        const view = document.getElementById('reminders-view');
                        if (view && !view.classList.contains('hidden')) renderRemindersList();
                    }
                }
            })
            .catch(() => {});
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

    // ?open=reminders is handled by navigation.js checkAccess() which runs first
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
