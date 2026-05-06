// Toggle Favorite — works for calculator, defect scanner and colour scanner
function toggleFavorite(type = 'calculator') {
    let id, label, page, fruit, brand, defectType;

    if (type === 'calculator') {
        id = `${activeFruit}_${activeBrand}`;
        label = activeBrand;
        page = 'Age Checker';
        fruit = activeFruit;
        brand = activeBrand;
    } else if (type === 'defect') {
        fruit = window.defectActiveFruit || 'banana';
        defectType = window.defectActiveType || 'external';
        id = `defect_${fruit}_${defectType}`;
        const fruitNames = { banana: 'Banana', mango: 'Mango', avocado: 'Avocado' };
        const typeLabel = defectType === 'external' ? t('external') : t('internal');
        label = fruitNames[fruit] + ' ' + typeLabel;
        page = 'Defect Detector';
    } else if (type === 'colour') {
        id = 'colour_scanner';
        label = t('bananaColourScanner');
        page = 'Colour Scanner';
        fruit = 'banana';
    }

    const index = favorites.findIndex(f => f.id === id);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push({ id, label, page, fruit, brand, defectType, type });
    }

    localStorage.setItem('pulpProFavorites', JSON.stringify(favorites));
    updateAllFavoriteStars();
    renderFavorites();
}

// Update star for calculator
function updateFavoriteUI() {
    const id = `${activeFruit}_${activeBrand}`;
    const isFav = favorites.some(f => f.id === id);
    const star = document.getElementById('favStar');
    if (star) star.classList.toggle('active', isFav);
}

// Update star for defect scanner
function updateDefectFavoriteUI() {
    const fruit = window.defectActiveFruit || 'banana';
    const defectType = window.defectActiveType || 'external';
    const id = `defect_${fruit}_${defectType}`;
    const isFav = favorites.some(f => f.id === id);
    const star = document.getElementById('defectFavStar');
    if (star) star.classList.toggle('active', isFav);
}

// Update star for colour scanner
function updateColourFavoriteUI() {
    const isFav = favorites.some(f => f.id === 'colour_scanner');
    const star = document.getElementById('colourFavStar');
    if (star) star.classList.toggle('active', isFav);
}

// Update all stars at once
function updateAllFavoriteStars() {
    updateFavoriteUI();
    updateDefectFavoriteUI();
    updateColourFavoriteUI();
}

// Render favorites on home and menu
function renderFavorites() {
    const section = document.getElementById('favorites-section');
    const grid = document.getElementById('fav-grid');
    const menuList = document.getElementById('menu-fav-list');

    if (favorites.length === 0) {
        if (section) section.classList.add('hidden');
        if (menuList) menuList.innerHTML = `<div style="padding:10px; font-size:0.6rem; opacity:0.3;">${t('noSavedFavs')}</div>`;
        return;
    }

    if (section) section.classList.remove('hidden');

    grid.innerHTML = favorites.map(f => {
        let icon = 'bi-star-fill';
        let onclick = '';

        if (f.type === 'calculator') {
            onclick = `activeFruit='${f.fruit}'; selectBrand('${f.brand}');`;
            icon = 'bi-star-fill';
        } else if (f.type === 'defect') {
            onclick = `openDefectDetectorDirect('${f.fruit}', '${f.defectType}');`;
            icon = 'bi-search';
        } else if (f.type === 'colour') {
            onclick = `openColourScanner();`;
            icon = 'bi-palette-fill';
        }

        return `
        <div class="fav-card" onclick="${onclick}">
            <i class="bi ${icon}"></i>
            <span>${f.label}</span>
            <small style="opacity:0.5; font-size:0.55rem; font-weight:800; color:var(--text-main);">
                ${f.page}
            </small>
        </div>`;
    }).join('');

    menuList.innerHTML = favorites.map(f => {
        let onclick = '';
        if (f.type === 'calculator') {
            onclick = `activeFruit='${f.fruit}'; selectBrand('${f.brand}'); toggleMenu();`;
        } else if (f.type === 'defect') {
            onclick = `openDefectDetectorDirect('${f.fruit}', '${f.defectType}'); toggleMenu();`;
        } else if (f.type === 'colour') {
            onclick = `openColourScanner(); toggleMenu();`;
        }

        return `
        <div class="menu-fav-item" onclick="${onclick}">
            ${f.label}
            <span>(${f.page})</span>
        </div>`;
    }).join('');
}
