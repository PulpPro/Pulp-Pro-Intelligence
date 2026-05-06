// Toggle Favorite
function toggleFavorite() {
    const id = `${activeFruit}_${activeBrand}`;
    const index = favorites.findIndex(f => f.id === id);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push({ id, fruit: activeFruit, brand: activeBrand, page: 'Age Checker' });
    }
    localStorage.setItem('pulpProFavorites', JSON.stringify(favorites));
    updateFavoriteUI();
    renderFavorites();
}

// Update Star Icon
function updateFavoriteUI() {
    const id = `${activeFruit}_${activeBrand}`;
    const isFav = favorites.some(f => f.id === id);
    document.getElementById('favStar').classList.toggle('active', isFav);
}

// Render Favorites on Home & Menu
function renderFavorites() {
    const section = document.getElementById('favorites-section');
    const grid = document.getElementById('fav-grid');
    const menuList = document.getElementById('menu-fav-list');

    if (favorites.length === 0) {
        section.classList.add('hidden');
        menuList.innerHTML = `<div style="padding:10px; font-size:0.6rem; opacity:0.3;">NO SAVED FAVS</div>`;
        return;
    }

    section.classList.remove('hidden');
    grid.innerHTML = favorites.map(f => `
        <div class="fav-card" onclick="selectBrand('${f.brand}'); activeFruit='${f.fruit}';">
            <i class="bi bi-star-fill"></i>
            <span>${f.brand}</span>
            <small style="opacity:0.5; font-size:0.55rem; font-weight:800; color:var(--text-main);">
                ${f.fruit.toUpperCase()}
            </small>
        </div>
    `).join('');

    menuList.innerHTML = favorites.map(f => `
        <div class="menu-fav-item" onclick="activeFruit='${f.fruit}'; selectBrand('${f.brand}'); toggleMenu();">
            ${f.brand}
            <span>(${f.page || 'Age Checker'})</span>
        </div>
    `).join('');
}
