// Switch between views
function switchView(targetId) {
    document.querySelectorAll('.nav-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('appInterface').style.display = 'none';

    if (targetId === 'appInterface') {
        document.getElementById('appInterface').style.display = 'flex';
        setTimeout(() => document.getElementById('codeIn').focus(), 100);
    } else {
        document.getElementById(targetId).classList.remove('hidden');
    }
}

// Show Home Hub
function showHub() {
    switchView('fruit-hub');
    renderFavorites();
}

// Open Middle Hub (Fruit Menu)
function openMiddleHub(fruit) {
    activeFruit = fruit;
    switchView('middle-hub');
    const title = fruit.charAt(0).toUpperCase() + fruit.slice(1);
    document.getElementById('middleHubTitle').innerText = `${title} Menu`;
    document.getElementById('brandsBtn').innerText = `${title} Brands`;
}

// Open Calculator
function openCalc(brand, fruit = activeFruit) {
    activeBrand = brand;
    activeFruit = fruit;
    switchView('appInterface');
    document.getElementById('brandName').innerText = brand;
    document.getElementById('commodityLabel').innerText = `${activeFruit.toUpperCase()} AGE CHECKER`;
    document.getElementById('codeIn').value = '';
    document.getElementById('resBox').classList.add('hidden');
    updateFavoriteUI();
    renderHistory();
}
