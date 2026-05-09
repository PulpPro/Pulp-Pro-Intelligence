// Navigation Module
// Handles navigation between different hubs in the app

let activeFruit = null;
let activeBrand = null;

// Show fruit hub
function showHub() {
    document.getElementById('fruit-hub').classList.remove('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    const defHub = document.getElementById('defect-hub');
    if (defHub) defHub.classList.add('hidden');
}

// Open middle hub for fruit selection
function openMiddleHub(fruit) {
    activeFruit = fruit;
    const fruitNames = {
        'banana': 'Banana',
        'mango': 'Mango',
        'avocado': 'Avocado'
    };
    document.getElementById('middleHubTitle').innerText = fruitNames[fruit] + ' Menu';
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.remove('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    const defHub = document.getElementById('defect-hub');
    if (defHub) defHub.classList.add('hidden');
}

// Open brands hub
function openBrands(fruit) {
    activeFruit = fruit;
    const fruitNames = {
        'banana': 'Banana',
        'mango': 'Mango',
        'avocado': 'Avocado'
    };
    document.getElementById('brandHubTitle').innerText = 'Select ' + fruitNames[fruit] + ' Brand';
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.remove('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    const defHub = document.getElementById('defect-hub');
    if (defHub) defHub.classList.add('hidden');
    renderBrands(fruit);
}

// Select brand and show calculator
function selectBrand(brand) {
    activeBrand = brand;
    document.getElementById('brandName').innerText = brand;
    // Fix: set commodityLabel correctly — no duplication
    const fruitLabels = { 'banana': 'BANANA', 'mango': 'MANGO', 'avocado': 'AVOCADO' };
    const fruitLabel = fruitLabels[activeFruit] || '';
    document.getElementById('commodityLabel').innerText = fruitLabel + ' AGE CHECKER';
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.remove('hidden');
    const defHub = document.getElementById('defect-hub');
    if (defHub) defHub.classList.add('hidden');
}

// openCalc — called from brands.js
function openCalc(brand) {
    selectBrand(brand);
}

// Open defect detector
function openDefectDetector() {
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    const defHub = document.getElementById('defect-hub');
    if (defHub) defHub.classList.remove('hidden');
}

// Open colour scanner
function openColourScanner() {
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    const defHub = document.getElementById('defect-hub');
    if (defHub) defHub.classList.add('hidden');
    document.getElementById('colour-scanner-view').classList.remove('hidden');
    if (typeof ColourScanner !== 'undefined') {
        ColourScanner.init();
        ColourScanner.setScanMode('single');
    }
}

// Open news
function openNews() {
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    const defHub = document.getElementById('defect-hub');
    if (defHub) defHub.classList.add('hidden');
    document.getElementById('colour-scanner-view').classList.add('hidden');
    document.getElementById('news-view').classList.remove('hidden');
    if (typeof NewsManager !== 'undefined') NewsManager.init();
}

// Toggle menu drawer
function toggleMenu() {
    document.getElementById('menu-drawer').classList.toggle('hidden');
    document.getElementById('menu-overlay').classList.toggle('hidden');
}

// Toggle theme
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('pulpTheme', isLight ? 'light' : 'dark');
    document.getElementById('themeText').innerText = isLight ? 'Light Mode' : 'Dark Mode';
}

// Toggle language
function toggleLanguage() {}

// Send feedback
function sendFeedback() {
    const theme = document.body.classList.contains('light-theme') ? 'Light' : 'Dark';
    const subject = encodeURIComponent("Pulp Pro App Feedback");
    const body = encodeURIComponent(`Hi Team,\n\nFeedback:\n\n[Your feedback here]\n\n---\nTheme: ${theme}\nPlatform: ${navigator.platform}`);
    window.location.href = `mailto:ar.varma@hotmail.com?subject=${subject}&body=${body}`;
}
