// Global State
let scanHistory = JSON.parse(localStorage.getItem('pulpProHistory')) || [];
let favorites = JSON.parse(localStorage.getItem('pulpProFavorites')) || [];
let activeFruit = '';
let activeBrand = '';

// App Init
window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('pulpTheme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        document.getElementById('themeText').innerText = 'Light Mode';
    }
    renderHistory();
    renderFavorites();
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 2600);
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

// Favorites Menu Dropdown
function toggleMenuFavs() {
    const list = document.getElementById('menu-fav-list');
    const icon = document.getElementById('favChevron');
    list.classList.toggle('show');
    icon.classList.toggle('bi-chevron-up');
    icon.classList.toggle('bi-chevron-down');
}

// Send Feedback
function sendFeedback() {
    const theme = document.body.classList.contains('light-theme') ? 'Light' : 'Dark';
    const historyCount = scanHistory.length;
    const subject = encodeURIComponent("Pulp Pro App Feedback");
    const body = encodeURIComponent(`Hi Team,\n\nI have some feedback for Pulp Pro:\n\n[Your feedback here]\n\n---\nApp Stats for Debugging:\nTheme: ${theme}\nLogged Scans: ${historyCount}\nPlatform: ${navigator.platform}`);
    window.location.href = `mailto:ar.varma@hotmail.com?subject=${subject}&body=${body}`;
}
