// Navigation Module - simplified
// Three views: fruit-hub (home), appInterface (age checker), colour-scanner-view

function showHub() {
    document.getElementById('fruit-hub').classList.remove('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    document.getElementById('colour-scanner-view').classList.add('hidden');
}

function openAgeChecker() {
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.remove('hidden');
    document.getElementById('colour-scanner-view').classList.add('hidden');
    setTimeout(() => document.getElementById('codeIn').focus(), 100);
}

function openColourScanner() {
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    document.getElementById('colour-scanner-view').classList.remove('hidden');
    if (typeof ColourScanner !== 'undefined') {
        ColourScanner.init();
        ColourScanner.setScanMode('single');
    }
}

function toggleMenu() {
    document.getElementById('menu-drawer').classList.toggle('open');
    document.getElementById('menu-overlay').classList.toggle('open');
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('pulpTheme', isLight ? 'light' : 'dark');
    document.getElementById('themeText').innerText = isLight ? 'Light Mode' : 'Dark Mode';
}

function loadTheme() {
    const savedTheme = localStorage.getItem('pulpTheme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        const el = document.getElementById('themeText');
        if (el) el.innerText = 'Light Mode';
    }
}
