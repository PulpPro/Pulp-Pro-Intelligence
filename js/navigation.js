// Global State
let activeFruit = null;
let activeBrand = null;

// Helper — hide all views
function hideAllViews() {
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('defect-hub').classList.add('hidden');
    document.getElementById('defect-type-view').classList.add('hidden');
    document.getElementById('defect-scan-view').classList.add('hidden');
    document.getElementById('defect-report-view').classList.add('hidden');
    document.getElementById('colour-scanner-view').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
}

// Show Home Hub
function showHub() {
    hideAllViews();
    document.getElementById('fruit-hub').classList.remove('hidden');
    renderFavorites();
}

// Open Middle Hub
function openMiddleHub(fruit) {
    activeFruit = fruit;
    const fruitNames = { banana:'Banana', mango:'Mango', avocado:'Avocado' };
    const name = fruitNames[fruit] || fruit;
    document.getElementById('middleHubTitle').innerText = name + ' Menu';
    document.getElementById('brandsBtn').innerText = name + ' Brands';
    hideAllViews();
    document.getElementById('middle-hub').classList.remove('hidden');
}

// Open Brand Hub
function openBrands(fruit) {
    activeFruit = fruit;
    const fruitNames = { banana:'Banana', mango:'Mango', avocado:'Avocado' };
    document.getElementById('brandHubTitle').innerText = 'Select ' + (fruitNames[fruit] || fruit) + ' Brand';
    hideAllViews();
    document.getElementById('brand-hub').classList.remove('hidden');
    renderBrands(fruit);
}

// Select Brand — open calculator
function selectBrand(brand) {
    activeBrand = brand;
    document.getElementById('brandName').innerText = brand;
    document.getElementById('commodityLabel').innerText = (activeFruit || 'fruit').toUpperCase() + ' AGE CHECKER';
    document.getElementById('codeIn').value = '';
    document.getElementById('resBox').classList.add('hidden');
    hideAllViews();
    document.getElementById('appInterface').classList.remove('hidden');
    updateFavoriteUI();
    renderHistory();
    setTimeout(() => document.getElementById('codeIn').focus(), 100);
}

// Open Defect Detector Hub
function openDefectDetector() {
    hideAllViews();
    document.getElementById('defect-hub').classList.remove('hidden');
}

// Open Colour Scanner — camera only starts here
function openColourScanner() {
    hideAllViews();
    document.getElementById('colour-scanner-view').classList.remove('hidden');
    ColourScanner.init();
    ColourScanner.setScanMode('single');
}

// Toggle Menu Drawer
function toggleMenu() {
    document.getElementById('menu-drawer').classList.toggle('open');
    document.getElementById('menu-overlay').classList.toggle('open');
}

// Toggle Theme
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    document.getElementById('themeText').innerText = isLight ? 'Light Mode' : 'Dark Mode';
    localStorage.setItem('pulpTheme', isLight ? 'light' : 'dark');
}
