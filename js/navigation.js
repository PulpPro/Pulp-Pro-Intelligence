// Navigation Module
// Handles navigation between different hubs in the app

let activeFruit = null;
let activeBrand = null;

const fruitNames = {
    'banana': 'Banana',
    'mango': 'Mango',
    'avocado': 'Avocado'
};

// Show fruit hub
function showHub() {
    document.getElementById('fruit-hub').classList.remove('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    const defHub = document.getElementById('defect-detector-hub');
    if (defHub) defHub.classList.add('hidden');
}

// Open middle hub for fruit selection
function openMiddleHub(fruit) {
    activeFruit = fruit;
    document.getElementById('middleHubTitle').innerText = fruitNames[fruit] + ' Menu';
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.remove('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    const defHub = document.getElementById('defect-detector-hub');
    if (defHub) defHub.classList.add('hidden');
}

// Open brands hub
function openBrands(fruit) {
    activeFruit = fruit;
    document.getElementById('brandHubTitle').innerText = 'Select ' + fruitNames[fruit] + ' Brand';
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.remove('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    const defHub = document.getElementById('defect-detector-hub');
    if (defHub) defHub.classList.add('hidden');
    renderBrands(fruit);
}

// Select brand and show calculator — fixed commodityLabel
function selectBrand(brand) {
    activeBrand = brand;
    document.getElementById('brandName').innerText = brand;
    // Set label correctly — fruit name + AGE CHECKER (no duplication)
    const fruitLabel = fruitNames[activeFruit] ? fruitNames[activeFruit].toUpperCase() : '';
    document.getElementById('commodityLabel').innerText = fruitLabel + ' AGE CHECKER';
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.remove('hidden');
    const defHub = document.getElementById('defect-detector-hub');
    if (defHub) defHub.classList.add('hidden');
}

// openCalc — called from brands.js
function openCalc(brand) {
    selectBrand(brand);
}

// Open defect detector hub
function openDefectDetector() {
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    const defHub = document.getElementById('defect-detector-hub');
    if (defHub) defHub.classList.remove('hidden');
}

// Open specific fruit defect scanner
function openDefectScanner(fruit) {
    activeFruit = fruit;
    const defScanTitle = document.getElementById('defectScannerTitle');
    if (defScanTitle) defScanTitle.innerText = 'Scan ' + fruitNames[fruit] + ' for Defects';
    const defHub = document.getElementById('defect-detector-hub');
    if (defHub) defHub.classList.add('hidden');
    const defScan = document.getElementById('defect-scanner-view');
    if (defScan) defScan.classList.remove('hidden');
}

// Back from defect scanner to defect hub
function backToDefectHub() {
    const defScan = document.getElementById('defect-scanner-view');
    if (defScan) defScan.classList.add('hidden');
    const defHub = document.getElementById('defect-detector-hub');
    if (defHub) defHub.classList.remove('hidden');
}

// Back from defect hub to main fruit hub
function backToFruitHub() {
    const defHub = document.getElementById('defect-detector-hub');
    if (defHub) defHub.classList.add('hidden');
    document.getElementById('fruit-hub').classList.remove('hidden');
}

// Toggle menu drawer
function toggleMenu() {
    document.getElementById('menu-drawer').classList.toggle('open');
    document.getElementById('menu-overlay').classList.toggle('open');
}

// Toggle theme
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('pulpTheme', isLight ? 'light' : 'dark');
    document.getElementById('themeText').innerText = isLight ? 'Light Mode' : 'Dark Mode';
}

// Open news
function openNews() {
    hideAllViews();
    document.getElementById('news-view').classList.remove('hidden');
    if (typeof NewsManager !== 'undefined') NewsManager.init();
}

// Open colour scanner
function openColourScanner() {
    hideAllViews();
    document.getElementById('colour-scanner-view').classList.remove('hidden');
    if (typeof ColourScanner !== 'undefined') ColourScanner.init();
    if (typeof ColourScanner !== 'undefined') ColourScanner.setScanMode('single');
    if (typeof ColourScanner !== 'undefined') {
        setTimeout(() => { ColourScanner.init && ColourScanner.init(); }, 100);
    }
}

// Hide all views helper
function hideAllViews() {
    const views = [
        'fruit-hub', 'middle-hub', 'brand-hub', 'appInterface',
        'news-view', 'colour-scanner-view', 'defect-hub',
        'defect-type-view', 'defect-scan-view', 'defect-info-view',
        'defect-report-view'
    ];
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
}
