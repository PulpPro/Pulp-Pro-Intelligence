// Navigation Module
// Handles navigation between different hubs in the app
// Note: activeFruit, activeBrand, toggleTheme, toggleMenu, toggleMenuFavs
// are all defined in app.js — not redeclared here.

// ── BACK BUTTON SUPPORT ───────────────────────────────────────
window.addEventListener('popstate', function(e) {
    const v = e.state && e.state.view;
    if (!v || v === 'hub')      { _showHub();             return; }
    if (v === 'middle-hub')     { _openMiddleHub();        return; }
    if (v === 'defect-hub')     { _openDefectDetector();   return; }
    if (v === 'calculator')     { _showCalculator();       return; }
    _showHub();
});

// Internal — show views WITHOUT pushing history (used by popstate)
function _showHub() {
    document.getElementById('fruit-hub').classList.remove('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    const dh = document.getElementById('defect-hub');
    if (dh) dh.classList.add('hidden');
}

function _openMiddleHub() {
    if (!activeFruit) return;
    const fruitNames = { 'banana': 'Banana', 'mango': 'Mango', 'avocado': 'Avocado' };
    document.getElementById('middleHubTitle').innerText = fruitNames[activeFruit] + ' Menu';
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.remove('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    const dh = document.getElementById('defect-hub');
    if (dh) dh.classList.add('hidden');
    renderBrands(activeFruit);
}

function _openDefectDetector() {
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    const dh = document.getElementById('defect-hub');
    if (dh) dh.classList.remove('hidden');
}

function _showCalculator() {
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.remove('hidden');
    const dh = document.getElementById('defect-hub');
    if (dh) dh.classList.add('hidden');
}

// ── PUBLIC FUNCTIONS ──────────────────────────────────────────

function showHub() {
    _showHub();
    history.pushState({ view: 'hub' }, '', window.location.pathname);
}

function openMiddleHub(fruit) {
    activeFruit = fruit;
    _openMiddleHub();
    history.pushState({ view: 'middle-hub' }, '', window.location.pathname);
}

function openBrands(fruit) {
    // In this version brands are shown inside middle-hub
    openMiddleHub(fruit);
}

function selectBrand(brand) {
    activeBrand = brand;
    document.getElementById('brandName').innerText = brand;
    _showCalculator();
    history.pushState({ view: 'calculator' }, '', window.location.pathname);
}

function openDefectDetector() {
    _openDefectDetector();
    history.pushState({ view: 'defect-hub' }, '', window.location.pathname);
}

function openDefectScanner(fruit) {
    const fruitNames = { 'banana': 'Banana', 'mango': 'Mango', 'avocado': 'Avocado' };
    activeFruit = fruit;
    const titleEl = document.getElementById('defectScannerTitle');
    if (titleEl) titleEl.innerText = 'Scan ' + fruitNames[fruit] + ' for Defects';
    const dh = document.getElementById('defect-hub');
    if (dh) dh.classList.add('hidden');
    const dsv = document.getElementById('defect-scanner-view');
    if (dsv) dsv.classList.remove('hidden');
    history.pushState({ view: 'defect-scanner' }, '', window.location.pathname);
}

function backToDefectHub() {
    const dsv = document.getElementById('defect-scanner-view');
    if (dsv) dsv.classList.add('hidden');
    const dh = document.getElementById('defect-hub');
    if (dh) dh.classList.remove('hidden');
    history.pushState({ view: 'defect-hub' }, '', window.location.pathname);
}

function backToFruitHub() {
    const dh = document.getElementById('defect-hub');
    if (dh) dh.classList.add('hidden');
    document.getElementById('fruit-hub').classList.remove('hidden');
    history.pushState({ view: 'hub' }, '', window.location.pathname);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('pulpTheme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        const themeText = document.getElementById('themeText');
        if (themeText) themeText.innerText = 'Light Mode';
    }
}
