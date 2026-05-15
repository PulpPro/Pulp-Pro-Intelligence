// Global State
let activeFruit = null;
let activeBrand = null;

// Helper — hide all views
function hideAllViews() {
    document.querySelectorAll('.nav-view').forEach(el => el.classList.add('hidden'));
    const app = document.getElementById('appInterface');
    if (app) app.classList.add('hidden');
}

// Show Home Hub
function showHub() {
    hideAllViews();
    document.getElementById('fruit-hub').classList.remove('hidden');
    if (typeof renderFavorites === 'function') renderFavorites();
}

// Open Middle Hub
function openMiddleHub(fruit) {
    activeFruit = fruit;

    const titleEl = document.getElementById('middleHubTitle');
    const subEl   = document.getElementById('middleHubSub');
    const names   = { banana: 'Banana', mango: 'Mango', avocado: 'Avocado' };
    if (titleEl) titleEl.innerText = names[fruit] || fruit;
    if (subEl)   subEl.innerText   = 'Select a tool';

    const btns = document.getElementById('middleHubButtons');
    if (btns) {
        if (fruit === 'banana') {
            btns.innerHTML = `
            <div class="menu-row accent" onclick="openAgeChecker()">
                <div class="mr-icon mr-lime"><i class="bi bi-calendar3" style="font-size:1rem;"></i></div>
                <div class="mr-body"><div class="mr-name">Age Checker</div><div class="mr-desc">Chiquita code system</div></div>
                <i class="bi bi-chevron-right mr-arrow"></i>
            </div>
            <div class="menu-row" onclick="FruitDefects.open('banana')">
                <div class="mr-icon mr-amber"><i class="bi bi-search" style="font-size:1rem;"></i></div>
                <div class="mr-body"><div class="mr-name">Defects</div><div class="mr-desc">8 external · 4 internal</div></div>
                <i class="bi bi-chevron-right mr-arrow"></i>
            </div>
            <div class="menu-row" onclick="OriginReport.open('banana')">
                <div class="mr-icon mr-blue"><i class="bi bi-globe" style="font-size:1rem;"></i></div>
                <div class="mr-body"><div class="mr-name">Origin Report</div><div class="mr-desc">Live weather · AI analysis</div></div>
                <i class="bi bi-chevron-right mr-arrow"></i>
            </div>
            <div class="menu-row" style="opacity:0.35; cursor:default;">
                <div class="mr-icon" style="background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.2);"><i class="bi bi-thermometer-half" style="font-size:1rem;"></i></div>
                <div class="mr-body"><div class="mr-name">Ripening</div><div class="mr-desc">Room calculator</div></div>
                <div class="soon-pill">Soon</div>
            </div>`;
        } else if (fruit === 'mango') {
            btns.innerHTML = `
            <div class="menu-row" onclick="FruitDefects.open('mango')">
                <div class="mr-icon mr-amber"><i class="bi bi-search" style="font-size:1rem;"></i></div>
                <div class="mr-body"><div class="mr-name">Defects</div><div class="mr-desc">6 external · 3 internal</div></div>
                <i class="bi bi-chevron-right mr-arrow"></i>
            </div>
            <div class="menu-row" onclick="OriginReport.open('mango')">
                <div class="mr-icon mr-blue"><i class="bi bi-globe" style="font-size:1rem;"></i></div>
                <div class="mr-body"><div class="mr-name">Origin Report</div><div class="mr-desc">Live weather · AI analysis</div></div>
                <i class="bi bi-chevron-right mr-arrow"></i>
            </div>
            <div class="menu-row" style="opacity:0.35; cursor:default;">
                <div class="mr-icon" style="background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.2);"><i class="bi bi-thermometer-half" style="font-size:1rem;"></i></div>
                <div class="mr-body"><div class="mr-name">Ripening</div><div class="mr-desc">Room calculator</div></div>
                <div class="soon-pill">Soon</div>
            </div>`;
        } else if (fruit === 'avocado') {
            btns.innerHTML = `
            <div class="menu-row" onclick="FruitDefects.open('avocado')">
                <div class="mr-icon mr-green"><i class="bi bi-search" style="font-size:1rem;"></i></div>
                <div class="mr-body"><div class="mr-name">Defects</div><div class="mr-desc">5 external · 4 internal</div></div>
                <i class="bi bi-chevron-right mr-arrow"></i>
            </div>
            <div class="menu-row" onclick="OriginReport.open('avocado')">
                <div class="mr-icon mr-blue"><i class="bi bi-globe" style="font-size:1rem;"></i></div>
                <div class="mr-body"><div class="mr-name">Origin Report</div><div class="mr-desc">Live weather · AI analysis</div></div>
                <i class="bi bi-chevron-right mr-arrow"></i>
            </div>
            <div class="menu-row" style="opacity:0.35; cursor:default;">
                <div class="mr-icon" style="background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.2);"><i class="bi bi-thermometer-half" style="font-size:1rem;"></i></div>
                <div class="mr-body"><div class="mr-name">Ripening</div><div class="mr-desc">Room calculator</div></div>
                <div class="soon-pill">Soon</div>
            </div>`;
        }
    }

    // Highlight selected chip
    document.querySelectorAll('.fruit-chip').forEach(c => c.classList.remove('active'));
    const chip = document.getElementById('chip-' + fruit);
    if (chip) chip.classList.add('active');

    hideAllViews();
    document.getElementById('middle-hub').classList.remove('hidden');
}

// Open Age Checker directly
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

// Open Defect Detector Hub
function openDefectDetector() {
    hideAllViews();
    document.getElementById('defect-hub').classList.remove('hidden');
}

// Open Defect Detector directly from favorites
function openDefectDetectorDirect(fruit, type) {
    hideAllViews();
    document.getElementById('defect-scan-view').classList.remove('hidden');
    const names = { banana: 'Banana', mango: 'Mango', avocado: 'Avocado' };
    const typeLabel = type === 'external' ? 'External' : 'Internal';
    document.getElementById('defectScanTitle').innerText = (names[fruit] || fruit) + ' — ' + typeLabel;
    if (typeof updateDefectFavoriteUI === 'function') updateDefectFavoriteUI();
    if (typeof DefectDetector !== 'undefined') DefectDetector.selectType(type);
}

// Open Colour Scanner
function openColourScanner() {
    hideAllViews();
    document.getElementById('colour-scanner-view').classList.remove('hidden');
    if (typeof updateColourFavoriteUI === 'function') updateColourFavoriteUI();
    if (typeof ColourScanner !== 'undefined') {
        ColourScanner.init();
        ColourScanner.setScanMode('single');
    }
}

// Open News
function openNews() {
    hideAllViews();
    document.getElementById('news-view').classList.remove('hidden');
    if (typeof NewsManager !== 'undefined') NewsManager.init();
}

// Toggle Menu
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
