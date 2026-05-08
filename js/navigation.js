// Navigation Module
let activeFruit = null;
let activeBrand = null;

const fruitNames = {
    'banana': 'Banana',
    'mango': 'Mango',
    'avocado': 'Avocado'
};

function hideAll() {
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    document.getElementById('defect-hub').classList.add('hidden');
}

// Show fruit hub
function showHub() {
    hideAll();
    document.getElementById('fruit-hub').classList.remove('hidden');
}

// Open middle hub for fruit selection
function openMiddleHub(fruit) {
    activeFruit = fruit;
    hideAll();
    document.getElementById('middleHubTitle').innerText = fruitNames[fruit] + ' Menu';
    document.getElementById('brandsBtn').innerText = fruitNames[fruit] + ' Brands';
    document.getElementById('middle-hub').classList.remove('hidden');
}

// Open brands hub
function openBrands(fruit) {
    activeFruit = fruit;
    hideAll();
    document.getElementById('brandHubTitle').innerText = 'Select ' + fruitNames[fruit] + ' Brand';
    document.getElementById('brand-hub').classList.remove('hidden');
    renderBrands(fruit);
}

// Select brand and show calculator
function selectBrand(brand) {
    activeBrand = brand;
    hideAll();
    document.getElementById('brandName').innerText = brand;
    document.getElementById('commodityLabel').innerText = fruitNames[activeFruit] + ' AGE CHECKER';
    document.getElementById('appInterface').classList.remove('hidden');
    updateFavStar();
    renderHistory();
}

// Open defect detector hub
function openDefectDetector() {
    hideAll();
    document.getElementById('defect-hub').classList.remove('hidden');
}

// Open colour scanner
function openColourScanner() {
    hideAll();
    document.getElementById('colour-scanner-view').classList.remove('hidden');
}

// Open news
function openNews() {
    hideAll();
    document.getElementById('news-view').classList.remove('hidden');
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
    localStorage.setItem('pulpTheme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
}

// Toggle language
function toggleLanguage() {
    if (typeof applyLanguage === 'function') applyLanguage();
}

// Toggle favorites in menu
function toggleMenuFavs() {
    const list = document.getElementById('menu-fav-list');
    const chevron = document.getElementById('favChevron');
    list.classList.toggle('show');
    chevron.classList.toggle('bi-chevron-up');
    chevron.classList.toggle('bi-chevron-down');
}

// Update fav star on calculator
function updateFavStar() {
    if (typeof updateFavoriteUI === 'function') updateFavoriteUI();
}
