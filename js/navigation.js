// Navigation Module
// Handles navigation between different hubs in the app

let activeFruit = null;
let activeBrand = null;

// ── HISTORY API ───────────────────────────────────────────────
window.addEventListener('popstate', function(e) {
    const v = e.state && e.state.view;
    if (!v || v === 'hub')      { _goHub();         return; }
    if (v === 'middle-hub')     { _goMiddleHub();   return; }
    if (v === 'brand-hub')      { _goBrandHub();    return; }
    if (v === 'defect-hub')     { _goDefectHub();   return; }
    if (v === 'calculator')     { _goCalculator();  return; }
    _goHub();
});

function _hide(id) { const el = document.getElementById(id); if (el) el.classList.add('hidden'); }
function _show(id) { const el = document.getElementById(id); if (el) el.classList.remove('hidden'); }

function _goHub() {
    _show('fruit-hub');
    _hide('middle-hub'); _hide('brand-hub');
    _hide('appInterface'); _hide('defect-hub');
}
function _goMiddleHub() {
    if (!activeFruit) return;
    const fruitNames = { 'banana': 'Banana', 'mango': 'Mango', 'avocado': 'Avocado' };
    document.getElementById('middleHubTitle').innerText = fruitNames[activeFruit] + ' Menu';
    _hide('fruit-hub'); _show('middle-hub');
    _hide('brand-hub'); _hide('appInterface'); _hide('defect-hub');
}
function _goBrandHub() {
    if (!activeFruit) return;
    const fruitNames = { 'banana': 'Banana', 'mango': 'Mango', 'avocado': 'Avocado' };
    const titleEl = document.getElementById('brandHubTitle');
    if (titleEl) titleEl.innerText = 'Select ' + fruitNames[activeFruit] + ' Brand';
    _hide('fruit-hub'); _hide('middle-hub');
    _show('brand-hub'); _hide('appInterface'); _hide('defect-hub');
    renderBrands(activeFruit);
}
function _goDefectHub() {
    _hide('fruit-hub'); _hide('middle-hub');
    _hide('brand-hub'); _hide('appInterface');
    _show('defect-hub');
}
function _goCalculator() {
    _hide('fruit-hub'); _hide('middle-hub');
    _hide('brand-hub'); _show('appInterface'); _hide('defect-hub');
}

// ── PUBLIC FUNCTIONS ──────────────────────────────────────────

function showHub() {
    _goHub();
    history.pushState({ view: 'hub' }, '', window.location.pathname);
}

function openMiddleHub(fruit) {
    activeFruit = fruit;
    _goMiddleHub();
    history.pushState({ view: 'middle-hub' }, '', window.location.pathname);
}

function openBrands(fruit) {
    activeFruit = fruit;
    _goBrandHub();
    history.pushState({ view: 'brand-hub' }, '', window.location.pathname);
}

function selectBrand(brand) {
    activeBrand = brand;
    document.getElementById('brandName').innerText = brand;
    _goCalculator();
    history.pushState({ view: 'calculator' }, '', window.location.pathname);
}

function openDefectDetector() {
    _goDefectHub();
    history.pushState({ view: 'defect-hub' }, '', window.location.pathname);
}

function openDefectScanner(fruit) {
    const fruitNames = { 'banana': 'Banana', 'mango': 'Mango', 'avocado': 'Avocado' };
    activeFruit = fruit;
    const titleEl = document.getElementById('defectScannerTitle');
    if (titleEl) titleEl.innerText = 'Scan ' + fruitNames[fruit] + ' for Defects';
    _hide('defect-hub');
    _show('defect-scanner-view');
    history.pushState({ view: 'defect-scanner' }, '', window.location.pathname);
}

function backToDefectHub() {
    _hide('defect-scanner-view');
    _show('defect-hub');
    history.pushState({ view: 'defect-hub' }, '', window.location.pathname);
}

function backToFruitHub() {
    _hide('defect-hub');
    _show('fruit-hub');
    history.pushState({ view: 'hub' }, '', window.location.pathname);
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
