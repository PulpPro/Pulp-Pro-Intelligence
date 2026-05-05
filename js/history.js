// Save scan to history
function saveToHistory(code, days, color) {
    const now = new Date();
    const ts = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} • ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`.toUpperCase();
    scanHistory.unshift({ code, days, color, timestamp: ts, brand: activeBrand });
    if (scanHistory.length > 25) scanHistory.pop();
    localStorage.setItem('pulpProHistory', JSON.stringify(scanHistory));
}

// Render history list
function renderHistory() {
    const list = document.getElementById('historyList');
    const section = document.getElementById('historySection');
    const boxHidden = document.getElementById('resBox').classList.contains('hidden');

    if (scanHistory.length === 0) {
        section.style.display = 'none';
        return;
    }

    if (window.innerWidth >= 992) {
        section.style.display = 'block';
    } else {
        section.style.display = boxHidden ? 'none' : 'block';
    }

    list.innerHTML = `
        <div style="font-size:0.75rem; font-weight:900; color:var(--pulp-lime); margin-bottom:15px; border-bottom:1px solid var(--border-glass); padding-bottom:8px;">
            ARCHIVE
        </div>` +
        scanHistory.map(item => `
            <div class="log-item" onclick="checkFruit('${item.code}')">
                <div class="log-code">
                    ${item.code}
                    <small style="font-size:0.5rem; opacity:0.6;">${item.brand || ''}</small>
                </div>
                <div class="log-meta" style="text-align:right;">
                    <span style="color:${item.color}; font-weight:900;">${item.days}D</span>
                    <span class="log-timestamp">${item.timestamp}</span>
                </div>
            </div>
        `).join('');
}

// Clear all history
function clearHistory() {
    if (confirm("Wipe logs?")) {
        scanHistory = [];
        localStorage.removeItem('pulpProHistory');
        renderHistory();
    }
}
