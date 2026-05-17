// Navigation Module
// Handles navigation between different hubs in the app

// ── HISTORY API — browser/device back button ──────────────────
function pushNav(view) {
    history.pushState({ view }, '', window.location.pathname);
}

window.addEventListener('popstate', function(e) {
    const state = e.state;
    if (!state) { _showHub(); return; }
    switch (state.view) {
        case 'middle-hub':  _openMiddleHub(activeFruit); break;
        case 'brand-hub':   _openBrands(activeFruit);    break;
        case 'defect-hub':  _openDefectDetector();       break;
        case 'calculator':  _showCalculator();            break;
        default:            _showHub();                  break;
    }
});

function _showHub() {
    document.getElementById('fruit-hub').classList.remove('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    document.getElementById('defect-hub').classList.add('hidden');
}
function _openMiddleHub(fruit) {
    if (!fruit) return;
    const fruitNames = { 'banana':'Banana','mango':'Mango','avocado':'Avocado' };
    document.getElementById('middleHubTitle').innerText = fruitNames[fruit] + ' Menu';
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.remove('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    document.getElementById('defect-hub').classList.add('hidden');
}
function _openBrands(fruit) {
    if (!fruit) return;
    const fruitNames = { 'banana':'Banana','mango':'Mango','avocado':'Avocado' };
    document.getElementById('brandHubTitle').innerText = 'Select ' + fruitNames[fruit] + ' Brand';
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.remove('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    document.getElementById('defect-hub').classList.add('hidden');
    renderBrands(fruit);
}
function _openDefectDetector() {
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    document.getElementById('defect-hub').classList.remove('hidden');
}
function _showCalculator() {
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.remove('hidden');
    document.getElementById('defect-hub').classList.add('hidden');
}

// ── PUBLIC FUNCTIONS ──────────────────────────────────────────

// Show fruit hub
function showHub() {
    _showHub();
    pushNav('hub');
}

// Open middle hub for fruit selection
function openMiddleHub(fruit) {
    activeFruit = fruit;
    _openMiddleHub(fruit);
    pushNav('middle-hub');
}

// Open brands hub
function openBrands(fruit) {
    activeFruit = fruit;
    _openBrands(fruit);
    pushNav('brand-hub');
}

// Select brand and show calculator
function selectBrand(brand) {
    activeBrand = brand;
    document.getElementById('brandName').innerText = brand;
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.remove('hidden');
    document.getElementById('defect-hub').classList.add('hidden');
    pushNav('calculator');
}

// Open defect detector hub
function openDefectDetector() {
    _openDefectDetector();
    pushNav('defect-hub');
}

// Open specific fruit defect scanner
function openDefectScanner(fruit) {
    const fruitNames = { 'banana':'Banana','mango':'Mango','avocado':'Avocado' };
    activeFruit = fruit;
    document.getElementById('defectScannerTitle').innerText = 'Scan ' + fruitNames[fruit] + ' for Defects';
    document.getElementById('defect-hub').classList.add('hidden');
    document.getElementById('defect-scanner-view').classList.remove('hidden');
    pushNav('defect-scanner');
}

// Back from defect scanner to defect hub
function backToDefectHub() {
    document.getElementById('defect-scanner-view').classList.add('hidden');
    document.getElementById('defect-hub').classList.remove('hidden');
    pushNav('defect-hub');
}

// Back from defect hub to main fruit hub
function backToFruitHub() {
    document.getElementById('defect-hub').classList.add('hidden');
    document.getElementById('fruit-hub').classList.remove('hidden');
    pushNav('hub');
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        const themeText = document.getElementById('themeText');
        if (themeText) themeText.innerText = 'Light Mode';
    }
}
