// Navigation Module
// Handles navigation between different hubs in the app

let activeFruit = null;
let activeBrand = null;

// ── HISTORY API — intercept browser/device back button ────────
// Push a state every time we navigate to a new view.
// On popstate (back button), go back within the app.

function pushNav(view) {
    history.pushState({ view }, '', window.location.pathname);
}

window.addEventListener('popstate', function(e) {
    const state = e.state;
    if (!state) {
        // At the root — show hub without pushing another state
        _showHub();
        return;
    }
    switch (state.view) {
        case 'hub':          _showHub();                     break;
        case 'middle-hub':   _openMiddleHub(activeFruit);    break;
        case 'brand-hub':    _openBrands(activeFruit);       break;
        case 'defect-hub':   _openDefectDetector();          break;
        default:             _showHub();                     break;
    }
});

// ── INTERNAL functions (no history push) ─────────────────────
function _showHub() {
    document.getElementById('fruit-hub').classList.remove('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    const dd = document.getElementById('defect-detector-hub');
    if (dd) dd.classList.add('hidden');
}

function _openMiddleHub(fruit) {
    if (!fruit) return;
    const fruitNames = { banana: 'Banana', mango: 'Mango', avocado: 'Avocado' };
    document.getElementById('middleHubTitle').innerText = fruitNames[fruit] + ' Menu';
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.remove('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    const dd = document.getElementById('defect-detector-hub');
    if (dd) dd.classList.add('hidden');
}

function _openBrands(fruit) {
    if (!fruit) return;
    const fruitNames = { banana: 'Banana', mango: 'Mango', avocado: 'Avocado' };
    document.getElementById('brandHubTitle').innerText = 'Select ' + fruitNames[fruit] + ' Brand';
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.remove('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    const dd = document.getElementById('defect-detector-hub');
    if (dd) dd.classList.add('hidden');
    renderBrands(fruit);
}

function _openDefectDetector() {
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    const dd = document.getElementById('defect-detector-hub');
    if (dd) dd.classList.remove('hidden');
}

// ── PUBLIC functions (with history push) ─────────────────────
function showHub() {
    _showHub();
    pushNav('hub');
}

function openMiddleHub(fruit) {
    activeFruit = fruit;
    _openMiddleHub(fruit);
    pushNav('middle-hub');
}

function openBrands(fruit) {
    activeFruit = fruit;
    _openBrands(fruit);
    pushNav('brand-hub');
}

function selectBrand(brand) {
    activeBrand = brand;
    document.getElementById('brandName').innerText = brand;
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.remove('hidden');
    const dd = document.getElementById('defect-detector-hub');
    if (dd) dd.classList.add('hidden');
    pushNav('calculator');
}

function openDefectDetector() {
    _openDefectDetector();
    pushNav('defect-hub');
}

function openDefectScanner(fruit) {
    const fruitNames = { banana: 'Banana', mango: 'Mango', avocado: 'Avocado' };
    activeFruit = fruit;
    document.getElementById('defectScannerTitle').innerText = 'Scan ' + fruitNames[fruit] + ' for Defects';
    const dd = document.getElementById('defect-detector-hub');
    if (dd) dd.classList.add('hidden');
    const ds = document.getElementById('defect-scanner-view');
    if (ds) ds.classList.remove('hidden');
    pushNav('defect-scanner');
}

function backToDefectHub() {
    const ds = document.getElementById('defect-scanner-view');
    if (ds) ds.classList.add('hidden');
    const dd = document.getElementById('defect-detector-hub');
    if (dd) dd.classList.remove('hidden');
    pushNav('defect-hub');
}

function backToFruitHub() {
    const dd = document.getElementById('defect-detector-hub');
    if (dd) dd.classList.add('hidden');
    showHub();
}

// ── MENU DRAWER ───────────────────────────────────────────────
function toggleMenu() {
    document.getElementById('menu-drawer').classList.toggle('hidden');
    document.getElementById('menu-overlay').classList.toggle('hidden');
}

// ── THEME ─────────────────────────────────────────────────────
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const themeText = document.getElementById('themeText');
    themeText.innerText = document.body.classList.contains('light-theme') ? 'Light Mode' : 'Dark Mode';
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        const themeText = document.getElementById('themeText');
        if (themeText) themeText.innerText = 'Light Mode';
    }
}
