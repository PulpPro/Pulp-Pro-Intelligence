// Navigation Module
// Handles navigation between different hubs in the app

let activeFruit = null;
let activeBrand = null;

// All view IDs in one place for easy management
const allViews = [
    'fruit-hub',
    'middle-hub',
    'brand-hub',
    'appInterface',
    'defect-hub',
    'defect-scanner-view'
];

function hideAllViews() {
    allViews.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
}

// Show fruit hub
function showHub() {
    hideAllViews();
    document.getElementById('fruit-hub').classList.remove('hidden');
}

// Open middle hub for fruit selection
function openMiddleHub(fruit) {
    activeFruit = fruit;
    const fruitNames = { banana: 'Banana', mango: 'Mango', avocado: 'Avocado' };
    document.getElementById('middleHubTitle').innerText = fruitNames[fruit] + ' Menu';
    hideAllViews();
    document.getElementById('middle-hub').classList.remove('hidden');
}

// Open brands hub
function openBrands(fruit) {
    activeFruit = fruit;
    const fruitNames = { banana: 'Banana', mango: 'Mango', avocado: 'Avocado' };
    document.getElementById('brandHubTitle').innerText = 'Select ' + fruitNames[fruit] + ' Brand';
    hideAllViews();
    document.getElementById('brand-hub').classList.remove('hidden');
    renderBrands(fruit);
}

// Select brand and show calculator
function selectBrand(brand) {
    activeBrand = brand;
    document.getElementById('brandName').innerText = brand;
    hideAllViews();
    document.getElementById('appInterface').classList.remove('hidden');
}

// Open defect detector hub
function openDefectDetector() {
    hideAllViews();
    document.getElementById('defect-hub').classList.remove('hidden');
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
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        document.getElementById('themeText').innerText = 'Light Mode';
    }
}
