// Global State
let activeFruit = null;
let activeBrand = null;

// Helper — hide all views including dynamically created ones
function hideAllViews() {
    document.querySelectorAll('.nav-view').forEach(el => el.classList.add('hidden'));
}

// Show Home Hub
function showHub() {
    document.querySelectorAll('.nav-view').forEach(el => el.classList.add('hidden'));
    document.getElementById('fruit-hub').classList.remove('hidden');
    renderFavorites();
}

// Open Middle Hub
function openMiddleHub(fruit) {
    activeFruit = fruit;
    const fruitNames = { banana:'Banana', mango:'Mango', avocado:'Avocado' };
    const name = fruitNames[fruit] || fruit;
    document.getElementById('middleHubTitle').innerText = name + ' ' + t('menu');
    document.getElementById('brandsBtn').innerText = name + ' ' + t('brands');
    hideAllViews();
    document.getElementById('middle-hub').classList.remove('hidden');
}

// Open Brand Hub
function openBrands(fruit) {
    activeFruit = fruit;
    const fruitNames = { banana:'Banana', mango:'Mango', avocado:'Avocado' };
    document.getElementById('brandHubTitle').innerText = t('selectBrand') + ' — ' + (fruitNames[fruit] || fruit);
    hideAllViews();
    document.getElementById('brand-hub').classList.remove('hidden');
    renderBrands(fruit);
}

// Select Brand — open calculator
function selectBrand(brand) {
    activeBrand = brand;
    document.getElementById('brandName').innerText = brand;
    document.getElementById('commodityLabel').innerText = (activeFruit || 'fruit').toUpperCase() + ' ' + t('bananaAgeChecker');
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

// Open Defect Detector directly from favorites
function openDefectDetectorDirect(fruit, type) {
    window.defectActiveFruit = fruit;
    window.defectActiveType = type;
    hideAllViews();
    document.getElementById('defect-scan-view').classList.remove('hidden');
    const fruitNames = { banana:'Banana', mango:'Mango', avocado:'Avocado' };
    const typeLabel = type === 'external' ? t('external') : t('internal');
    document.getElementById('defectScanTitle').innerText = fruitNames[fruit] + ' — ' + typeLabel;
    updateDefectFavoriteUI();
    DefectDetector.selectType(type);
}

// Open Colour Scanner
function openColourScanner() {
    hideAllViews();
    document.getElementById('colour-scanner-view').classList.remove('hidden');
    updateColourFavoriteUI();
    ColourScanner.init();
    ColourScanner.setScanMode('single');
}

// Open News
function openNews() {
    hideAllViews();
    document.getElementById('news-view').classList.remove('hidden');
    NewsManager.init();
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
    document.getElementById('themeText').innerText = isLight ? t('lightMode') : t('darkMode');
    localStorage.setItem('pulpTheme', isLight ? 'light' : 'dark');
}
