// Navigation Module
// Handles navigation between different hubs in the app

// ── HISTORY API — intercept browser/device back button ────────
function pushNav(view) {
    history.pushState({ view }, '', window.location.pathname);
}

window.addEventListener('popstate', function(e) {
    const state = e.state;
    if (!state) { _showHub(); return; }
    switch (state.view) {
        case 'hub':         _showHub();                  break;
        case 'middle-hub':  _openMiddleHub(activeFruit); break;
        case 'brand-hub':   _openBrands(activeFruit);    break;
        case 'defect-hub':  _openDefectDetector();       break;
        default:            _showHub();                  break;
    }
});

// ── INTERNAL (no history push) ────────────────────────────────
function _showHub() {
    document.getElementById('fruit-hub').classList.remove('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    const dh = document.getElementById('defect-hub');
    if (dh) dh.classList.add('hidden');
}

function _openMiddleHub(fruit) {
    if (!fruit) return;
    const names = { banana: 'Banana', mango: 'Mango', avocado: 'Avocado' };
    document.getElementById('middleHubTitle').innerText = names[fruit] + ' Menu';
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.remove('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    const dh = document.getElementById('defect-hub');
    if (dh) dh.classList.add('hidden');
}

function _openBrands(fruit) {
    if (!fruit) return;
    const names = { banana: 'Banana', mango: 'Mango', avocado: 'Avocado' };
    document.getElementById('brandHubTitle').innerText = 'Select ' + names[fruit] + ' Brand';
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.remove('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    const dh = document.getElementById('defect-hub');
    if (dh) dh.classList.add('hidden');
    renderBrands(fruit);
}

function _openDefectDetector() {
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    const dh = document.getElementById('defect-hub');
    if (dh) dh.classList.remove('hidden');
}

// ── PUBLIC (with history push) ────────────────────────────────
function showHub() {
    _showHub();
    pushNav('hub');
}

function openMiddleHub(fruit) {
    activeFruit = fruit;
    _openMiddleHub(fruit);
    pushNav('middle-hub');
}

function openBrands(fruit) {
    activeFruit = fruit;
    _openBrands(fruit);
    pushNav('brand-hub');
}

function selectBrand(brand) {
    activeBrand = brand;
    document.getElementById('brandName').innerText = brand;
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('middle-hub').classList.add('hidden');
    document.getElementById('brand-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.remove('hidden');
    const dh = document.getElementById('defect-hub');
    if (dh) dh.classList.add('hidden');
    pushNav('calculator');
}

function openDefectDetector() {
    _openDefectDetector();
    pushNav('defect-hub');
}
