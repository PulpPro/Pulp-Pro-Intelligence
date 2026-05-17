// Navigation Module
// Handles navigation between different hubs in the app

// ── HISTORY API: intercept browser back button ────────────────
function pushNav(view) {
    history.pushState({ view }, '', window.location.pathname);
}

window.addEventListener('popstate', function(e) {
    const v = e.state && e.state.view;
    if (!v || v === 'hub')             { showHub();                         return; }
    if (v === 'middle-hub' && activeFruit) { _rawOpenMiddleHub(activeFruit); return; }
    if (v === 'brand-hub'  && activeFruit) { _rawOpenBrands(activeFruit);    return; }
    if (v === 'defect-hub')            { _rawOpenDefectDetector();           return; }
    showHub();
});

// Raw versions (no pushState) used by popstate only
function _rawOpenMiddleHub(fruit) {
    const fruitNames = { 'banana': 'Banana', 'mango': 'Mango', 'avocado': 'Avocado' };
    document.getElementById('middleHubTitle').innerText = fruitNames[fruit] + ' Menu';
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.remove('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    document.getElementById('defect-detector-hub').classList.add('hidden');
}
function _rawOpenBrands(fruit) {
    const fruitNames = { 'banana': 'Banana', 'mango': 'Mango', 'avocado': 'Avocado' };
    document.getElementById('brandHubTitle').innerText = 'Select ' + fruitNames[fruit] + ' Brand';
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.remove('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    document.getElementById('defect-detector-hub').classList.add('hidden');
    renderBrands(fruit);
}
function _rawOpenDefectDetector() {
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    document.getElementById('defect-detector-hub').classList.remove('hidden');
}

// ── ORIGINAL FUNCTIONS (unchanged, pushNav added) ─────────────

// Show fruit hub
function showHub() {
    document.getElementById('fruit-hub').classList.remove('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    document.getElementById('defect-detector-hub').classList.add('hidden');
    pushNav('hub');
}

// Open middle hub for fruit selection
function openMiddleHub(fruit) {
    activeFruit = fruit;
    _rawOpenMiddleHub(fruit);
    pushNav('middle-hub');
}

// Open brands hub
function openBrands(fruit) {
    activeFruit = fruit;
    _rawOpenBrands(fruit);
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
    document.getElementById('defect-detector-hub').classList.add('hidden');
    pushNav('calculator');
}

// Open defect detector hub
function openDefectDetector() {
    _rawOpenDefectDetector();
    pushNav('defect-hub');
}

// Open specific fruit defect scanner
function openDefectScanner(fruit) {
    const fruitNames = { 'banana': 'Banana', 'mango': 'Mango', 'avocado': 'Avocado' };
    activeFruit = fruit;
    document.getElementById('defectScannerTitle').innerText = 'Scan ' + fruitNames[fruit] + ' for Defects';
    document.getElementById('defect-detector-hub').classList.add('hidden');
    document.getElementById('defect-scanner-view').classList.remove('hidden');
    pushNav('defect-scanner');
}

// Back from defect scanner to defect hub
function backToDefectHub() {
    document.getElementById('defect-scanner-view').classList.add('hidden');
    document.getElementById('defect-detector-hub').classList.remove('hidden');
    pushNav('defect-hub');
}

// Back from defect hub to main fruit hub
function backToFruitHub() {
    document.getElementById('defect-detector-hub').classList.add('hidden');
    document.getElementById('fruit-hub').classList.remove('hidden');
    pushNav('hub');
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('pulpTheme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        const themeText = document.getElementById('themeText');
        if (themeText) themeText.innerText = 'Light Mode';
    }
}
