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
    document.getElementById('defect-hub').classList.add('hidden');
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
    document.getElementById('defect-hub').classList.add('hidden');
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
    document.getElementById('defect-hub').classList.add('hidden');
    
    renderBrands(fruit);
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
}

// Open defect detector hub
function openDefectDetector() {
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    document.getElementById('defect-hub').classList.remove('hidden');
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
    document.getElementById('defect-hub').classList.add('hidden');
    document.getElementById('defect-scanner-view').classList.remove('hidden');
}

// Back from defect scanner to defect hub
function backToDefectHub() {
    document.getElementById('defect-scanner-view').classList.add('hidden');
    document.getElementById('defect-hub').classList.remove('hidden');
}

// Back from defect hub to main fruit hub
function backToFruitHub() {
    document.getElementById('defect-hub').classList.add('hidden');
    document.getElementById('fruit-hub').classList.remove('hidden');
}

// Toggle menu drawer
function toggleMenu() {
    document.getElementById('menu-drawer').classList.toggle('hidden');
    document.getElementById('menu-overlay').classList.toggle('hidden');
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
    const savedTheme = localStorage.getItem('pulpTheme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        const themeText = document.getElementById('themeText');
        if (themeText) themeText.innerText = 'Light Mode';
    }
}
