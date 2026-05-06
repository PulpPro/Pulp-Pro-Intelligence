// Render brands into brand hub
function renderBrands(fruit) {
    const grid = document.getElementById('brandGrid');

    if (fruit === 'banana') {
        grid.innerHTML = `
            <div class="list-btn" onclick="selectBrand('Chiquita')">Chiquita</div>
            <div class="list-btn disabled">Fyffes (Soon)</div>
            <div class="list-btn disabled">Favorita (Soon)</div>
            <div class="list-btn disabled">Agrofair (Soon)</div>
            <div class="list-btn disabled">Port (Soon)</div>
        `;
    } else {
        grid.innerHTML = `
            <div style="opacity:0.5; padding:20px; text-align:center; font-weight:700; text-transform:uppercase; letter-spacing:2px;">
                ${fruit} brands coming soon.
            </div>
        `;
    }
}
