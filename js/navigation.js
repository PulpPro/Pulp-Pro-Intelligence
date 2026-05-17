// Navigation Module
let activeFruit = null;
let activeBrand = null;

function pushNav(view) {
    history.pushState({ view }, '', window.location.pathname);
}

window.addEventListener('popstate', function(e) {
    const v = e.state && e.state.view;
    if (!v || v === 'hub') { showHub(); return; }
    if (v === 'middle-hub' && activeFruit) { openMiddleHub(activeFruit); return; }
    if (v === 'brand-hub'  && activeFruit) { openBrands(activeFruit);    return; }
    if (v === 'defect-hub')                { openDefectDetector();        return; }
    showHub();
});

function showHub() {
    document.getElementById('fruit-hub').classList.remove('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    document.getElementById('defect-hub').classList.add('hidden');
}

function openMiddleHub(fruit) {
    activeFruit = fruit;
    const fruitNames = { 'banana': 'Banana', 'mango': 'Mango', 'avocado': 'Avocado' };
    document.getElementById('middleHubTitle').innerText = fruitNames[fruit] + ' Menu';
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.remove('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    document.getElementById('defect-hub').classList.add('hidden');
    pushNav('middle-hub');
}

function openBrands(fruit) {
    activeFruit = fruit;
    const fruitNames = { 'banana': 'Banana', 'mango': 'Mango', 'avocado': 'Avocado' };
    document.getElementById('brandHubTitle').innerText = 'Select ' + fruitNames[fruit] + ' Brand';
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.remove('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    document.getElementById('defect-hub').classList.add('hidden');
    renderBrands(fruit);
    pushNav('brand-hub');
}

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

function openDefectDetector() {
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    document.getElementById('defect-hub').classList.remove('hidden');
    pushNav('defect-hub');
}

function openDefectScanner(fruit) {
    const fruitNames = { 'banana': 'Banana', 'mango': 'Mango', 'avocado': 'Avocado' };
    activeFruit = fruit;
    document.getElementById('defectScannerTitle').innerText = 'Scan ' + fruitNames[fruit] + ' for Defects';
    document.getElementById('defect-hub').classList.add('hidden');
    document.getElementById('defect-scanner-view').classList.remove('hidden');
    pushNav('defect-scanner');
}

function backToDefectHub() {
    document.getElementById('defect-scanner-view').classList.add('hidden');
    document.getElementById('defect-hub').classList.remove('hidden');
    pushNav('defect-hub');
}

function backToFruitHub() {
    document.getElementById('defect-hub').classList.add('hidden');
    document.getElementById('fruit-hub').classList.remove('hidden');
    pushNav('hub');
}

function toggleMenu() {
    document.getElementById('menu-drawer').classList.toggle('open');
    document.getElementById('menu-overlay').classList.toggle('open');
}

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
