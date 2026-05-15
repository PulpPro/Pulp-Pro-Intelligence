let activeFruit = null;
let activeBrand = null;

function hideAllViews() {
    document.querySelectorAll('.nav-view').forEach(el => el.classList.add('hidden'));
    const app = document.getElementById('appInterface');
    if (app) app.classList.add('hidden');
}

function showHub() {
    hideAllViews();
    document.getElementById('fruit-hub').classList.remove('hidden');
    if (typeof renderFavorites === 'function') renderFavorites();
}

function openMiddleHub(fruit) {
    activeFruit = fruit;
    const names = { banana: 'Banana', mango: 'Mango', avocado: 'Avocado' };
    document.getElementById('middleHubTitle').innerText = names[fruit] || fruit;
    document.getElementById('middleHubSub').innerText = 'Select a tool';

    document.querySelectorAll('.fruit-chip').forEach(c => c.classList.remove('active'));
    const chip = document.getElementById('chip-' + fruit);
    if (chip) chip.classList.add('active');

    const btns = document.getElementById('middleHubButtons');
    if (btns) {
        if (fruit === 'banana') {
            btns.innerHTML = `
            <div class="mrow acc" onclick="openAgeChecker()">
                <div class="ic ic-lime"><i class="bi bi-calendar3" style="font-size:1rem;"></i></div>
                <div class="mb"><div class="mn">Age Checker</div><div class="md">Chiquita code system</div></div>
                <i class="bi bi-chevron-right ma"></i>
            </div>
            <div class="mrow" onclick="FruitDefects.open('banana')">
                <div class="ic ic-amber"><i class="bi bi-search" style="font-size:1rem;"></i></div>
                <div class="mb"><div class="mn">Defects</div><div class="md">8 external · 4 internal</div></div>
                <i class="bi bi-chevron-right ma"></i>
            </div>
            <div class="mrow" onclick="OriginReport.open('banana')">
                <div class="ic ic-blue"><i class="bi bi-globe" style="font-size:1rem;"></i></div>
                <div class="mb"><div class="mn">Origin Report</div><div class="md">Live weather · AI analysis</div></div>
                <i class="bi bi-chevron-right ma"></i>
            </div>
            <div class="mrow dim">
                <div class="ic" style="background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.2);"><i class="bi bi-thermometer-half" style="font-size:1rem;"></i></div>
                <div class="mb"><div class="mn">Ripening</div><div class="md">Room calculator</div></div>
                <div class="soon-pill">Soon</div>
            </div>`;
        } else if (fruit === 'mango') {
            btns.innerHTML = `
            <div class="mrow" onclick="FruitDefects.open('mango')">
                <div class="ic ic-amber"><i class="bi bi-search" style="font-size:1rem;"></i></div>
                <div class="mb"><div class="mn">Defects</div><div class="md">6 external · 3 internal</div></div>
                <i class="bi bi-chevron-right ma"></i>
            </div>
            <div class="mrow" onclick="OriginReport.open('mango')">
                <div class="ic ic-blue"><i class="bi bi-globe" style="font-size:1rem;"></i></div>
                <div class="mb"><div class="mn">Origin Report</div><div class="md">Live weather · AI analysis</div></div>
                <i class="bi bi-chevron-right ma"></i>
            </div>
            <div class="mrow dim">
                <div class="ic" style="background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.2);"><i class="bi bi-thermometer-half" style="font-size:1rem;"></i></div>
                <div class="mb"><div class="mn">Ripening</div><div class="md">Room calculator</div></div>
                <div class="soon-pill">Soon</div>
            </div>`;
        } else if (fruit === 'avocado') {
            btns.innerHTML = `
            <div class="mrow" onclick="FruitDefects.open('avocado')">
                <div class="ic ic-green"><i class="bi bi-search" style="font-size:1rem;"></i></div>
                <div class="mb"><div class="mn">Defects</div><div class="md">5 external · 4 internal</div></div>
                <i class="bi bi-chevron-right ma"></i>
            </div>
            <div class="mrow" onclick="OriginReport.open('avocado')">
                <div class="ic ic-blue"><i class="bi bi-globe" style="font-size:1rem;"></i></div>
                <div class="mb"><div class="mn">Origin Report</div><div class="md">Live weather · AI analysis</div></div>
                <i class="bi bi-chevron-right ma"></i>
            </div>
            <div class="mrow dim">
                <div class="ic" style="background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.2);"><i class="bi bi-thermometer-half" style="font-size:1rem;"></i></div>
                <div class="mb"><div class="mn">Ripening</div><div class="md">Room calculator</div></div>
                <div class="soon-pill">Soon</div>
            </div>`;
        }
    }

    hideAllViews();
    document.getElementById('middle-hub').classList.remove('hidden');
}

function openAgeChecker() {
    activeBrand = 'Chiquita';
    document.getElementById('brandName').innerText = 'Chiquita';
    document.getElementById('commodityLabel').innerText = (activeFruit || 'banana').toUpperCase() + ' AGE CHECKER';
    document.getElementById('codeIn').value = '';
    document.getElementById('resBox').classList.add('hidden');
    hideAllViews();
    document.getElementById('appInterface').classList.remove('hidden');
    if (typeof updateFavoriteUI === 'function') updateFavoriteUI();
    if (typeof renderHistory === 'function') renderHistory();
    setTimeout(() => document.getElementById('codeIn').focus(), 100);
}

function openDefectDetector() {
    hideAllViews();
    document.getElementById('defect-hub').classList.remove('hidden');
}

function openDefectDetectorDirect(fruit, type) {
    hideAllViews();
    document.getElementById('defect-scan-view').classList.remove('hidden');
    const names = { banana: 'Banana', mango: 'Mango', avocado: 'Avocado' };
    document.getElementById('defectScanTitle').innerText = (names[fruit] || fruit) + ' — ' + (type === 'external' ? 'External' : 'Internal');
    if (typeof updateDefectFavoriteUI === 'function') updateDefectFavoriteUI();
    if (typeof DefectDetector !== 'undefined') DefectDetector.selectType(type);
}

function openColourScanner() {
    hideAllViews();
    document.getElementById('colour-scanner-view').classList.remove('hidden');
    if (typeof updateColourFavoriteUI === 'function') updateColourFavoriteUI();
    if (typeof ColourScanner !== 'undefined') { ColourScanner.init(); ColourScanner.setScanMode('single'); }
}

function openNews() {
    hideAllViews();
    document.getElementById('news-view').classList.remove('hidden');
    if (typeof NewsManager !== 'undefined') NewsManager.init();
}

function toggleMenu() {
    document.getElementById('menu-drawer').classList.toggle('open');
    document.getElementById('menu-overlay').classList.toggle('open');
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    document.getElementById('themeText').innerText = isLight ? 'Light Mode' : 'Dark Mode';
    localStorage.setItem('pulpTheme', isLight ? 'light' : 'dark');
}
