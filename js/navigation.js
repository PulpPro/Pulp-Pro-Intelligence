// Navigation Module
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
        if (!el) return;
        if (id === 'appInterface') {
            el.classList.remove('visible');
        } else {
            el.classList.add('hidden');
        }
    });
}

function showHub() {
    hideAllViews();
    document.getElementById('fruit-hub').classList.remove('hidden');
}

function openMiddleHub(fruit) {
    activeFruit = fruit;
    const fruitNames = { banana: 'Banana', mango: 'Mango', avocado: 'Avocado' };
    document.getElementById('middleHubTitle').innerText = fruitNames[fruit] + ' Menu';
    hideAllViews();
    document.getElementById('middle-hub').classList.remove('hidden');
}

function openBrands(fruit) {
    activeFruit = fruit;
    const fruitNames = { banana: 'Banana', mango: 'Mango', avocado: 'Avocado' };
    document.getElementById('brandHubTitle').innerText = 'Select ' + fruitNames[fruit] + ' Brand';
    hideAllViews();
    document.getElementById('brand-hub').classList.remove('hidden');
    renderBrands(fruit);
}

function selectBrand(brand) {
    activeBrand = brand;
    document.getElementById('brandName').innerText = brand;
    hideAllViews();
    document.getElementById('appInterface').classList.add('visible');
    initCalculator();
    updateFavoriteUI();
}

function openCalc(brand, fruit) {
    activeFruit = fruit;
    activeBrand = brand;
    document.getElementById('brandName').innerText = brand;
    hideAllViews();
    document.getElementById('appInterface').classList.add('visible');
    initCalculator();
    updateFavoriteUI();
}

function openDefectDetector() {
    hideAllViews();
    document.getElementById('defect-hub').classList.remove('hidden');
}

function startDefectScan(fruit) {
    const fruitNames = { banana: 'Banana', mango: 'Mango', avocado: 'Avocado' };
    document.getElementById('defectScannerTitle').innerText = '— ' + fruitNames[fruit] + ' —';
    document.getElementById('scanBtn').innerHTML = '<i class="bi bi-camera"></i> SCAN';
    document.getElementById('scanStatus').innerText = '';
    document.getElementById('defectResults').innerHTML = '';

    // Store active model globally for triggerScan()
    window._defectModel = {
        banana: { projectName: 'banana-defects', version: 1, apiKey: '9xIqfcEBoTfMaxCPncH5' },
        mango:  { projectName: 'mango-defect',   version: 1, apiKey: '9xIqfcEBoTfMaxCPncH5' },
        avocado:{ projectName: 'avocado-defect-detection', version: 1, apiKey: '9xIqfcEBoTfMaxCPncH5' }
    }[fruit];

    hideAllViews();
    document.getElementById('defect-scanner-view').classList.remove('hidden');
    DefectDetector.open(fruit);
}

function backToDefectHub() {
    DefectDetector.close();
    hideAllViews();
    document.getElementById('defect-hub').classList.remove('hidden');
}
