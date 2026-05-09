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
    document.getElementById('defect-detector-hub').classList.add('hidden');
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
    document.getElementById('defect-detector-hub').classList.add('hidden');
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
    document.getElementById('defect-detector-hub').classList.add('hidden');
    
    renderBrands(fruit);
}

// Select brand and show calculator
function selectBrand(brand) {
    activeBrand = brand;
    document.getElementById('brandName').innerText = brand;
    const fruitLabels = { 'banana': 'BANANA', 'mango': 'MANGO', 'avocado': 'AVOCADO' };
    document.getElementById('commodityLabel').innerText = (fruitLabels[activeFruit] || '') + ' AGE CHECKER';
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.remove('hidden');
    document.getElementById('defect-detector-hub').classList.add('hidden');
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
    document.getElementById('defect-detector-hub').classList.remove('hidden');
}

// Open specific fruit defect scanner
function openDefectScanner(fruit) {
    const fruitNames = {
        'banana': 'Banana',
        'mango': 'Mango',
        'avocado': 'Avocado'
    };
    
    activeFruit = fruit;
    document.getElementById('defectScannerTitle').innerText = 'Scan ' + fruitNames[fruit] + ' for Defects';
    document.getElementById('defect-detector-hub').classList.add('hidden');
    document.getElementById('defect-scanner-view').classList.remove('hidden');
}

// Back from defect scanner to defect hub
function backToDefectHub() {
    document.getElementById('defect-scanner-view').classList.add('hidden');
    document.getElementById('defect-detector-hub').classList.remove('hidden');
}

// Back from defect hub to main fruit hub
function backToFruitHub() {
    document.getElementById('defect-detector-hub').classList.add('hidden');
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
    const themeText = document.getElementById('themeText');
    themeText.innerText = document.body.classList.contains('light-theme') ? 'Light Mode' : 'Dark Mode';
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        document.getElementById('themeText').innerText = 'Light Mode';
    }
}

// Toggle language
function toggleLanguage() {
    const langText = document.getElementById('langText');
    if (langText.innerText.includes('Nederlands')) {
        langText.innerText = '🇬🇧 English';
    } else {
        langText.innerText = '🇳🇱 Nederlands';
    }
}

// Send feedback
function sendFeedback() {
    const theme = document.body.classList.contains('light-theme') ? 'Light' : 'Dark';
    const historyCount = (JSON.parse(localStorage.getItem('pulpProHistory')) || []).length;
    const subject = encodeURIComponent("Pulp Pro App Feedback");
    const body = encodeURIComponent(`Hi Team,\n\nI have some feedback for Pulp Pro:\n\n[Your feedback here]\n\n---\nApp Stats for Debugging:\nTheme: ${theme}\nLogged Scans: ${historyCount}\nPlatform: ${navigator.platform}`);
    window.location.href = `mailto:ar.varma@hotmail.com?subject=${subject}&body=${body}`;
}
