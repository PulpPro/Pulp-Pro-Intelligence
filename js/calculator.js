const inputField = document.getElementById('codeIn');

// Active article
let activeArticle = 'Chiquita 18kg';

// Multi scan batch
let batchResults = [];
let scanMode = 'single';

// Set article
function setArticle(name) {
    activeArticle = name;
    document.querySelectorAll('.article-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.article === name);
    });
}

// Set scan mode
function setScanMode(mode) {
    scanMode = mode;
    document.getElementById('singleModeBtn').classList.toggle('active', mode === 'single');
    document.getElementById('multiModeBtn').classList.toggle('active', mode === 'multi');

    if (mode === 'single') {
        document.getElementById('batchList').classList.add('hidden');
        document.getElementById('batchActionBtns').classList.add('hidden');
        document.getElementById('resBox').classList.add('hidden');
        batchResults = [];
        inputField.value = '';
        inputField.focus();
    } else {
        document.getElementById('resBox').classList.add('hidden');
        document.getElementById('batchList').classList.remove('hidden');
        batchResults = [];
        renderBatchList();
        inputField.value = '';
        inputField.focus();
    }
}

// Input listeners
inputField.addEventListener('input', () => {
    if (scanMode === 'single') {
        document.getElementById('resBox').classList.add('hidden');
    }
});

inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        checkFruit();
    }
});

// Handle keyboard after calculation
function handlePostCalculation() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
        inputField.blur();
        const currentType = inputField.getAttribute('type');
        inputField.setAttribute('type', 'button');
        setTimeout(() => inputField.setAttribute('type', currentType), 100);
    } else {
        inputField.select();
        inputField.focus();
    }
}

// Main calculation logic
function checkFruit(historicalCode = null) {
    const val = historicalCode || inputField.value.toUpperCase();
    if (historicalCode) inputField.value = historicalCode;

    const box = document.getElementById('resBox');

    if (val.length < 3) {
        box.classList.add('hidden');
        if (!historicalCode) triggerShake();
        return;
    }

    const mChar = val.charCodeAt(0);
    const dChar = val.charCodeAt(1);
    const yDigit = val.charAt(2);

    const isValid = (mChar >= 65 && mChar <= 76) &&
                    (dChar >= 65 && dChar <= 90) &&
                    (yDigit === '1' || yDigit === '2');

    if (!isValid) {
        box.classList.add('hidden');
        triggerShake();
        return;
    }

    const now = new Date();
    const m = mChar - 65;
    let d = dChar - 64;
    if (yDigit === '2') d += 26;

    // Validate day is within the actual days of that month
    const daysInMonth = new Date(now.getFullYear(), m + 1, 0).getDate();
    if (d > daysInMonth) {
        box.classList.add('hidden');
        triggerShake();
        return;
    }

    let hDate = new Date(now.getFullYear(), m, d);
    if (hDate > now) hDate.setFullYear(now.getFullYear() - 1);

    const diff = Math.floor((now - hDate) / (1000 * 60 * 60 * 24));
    const dateStr = hDate.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    }).toUpperCase();

    let status = '';
    let statusColor = '';
    if (diff > 31) {
        status = 'TOO OLD';
        statusColor = '#ff4d4d';
    } else if (diff <= 21) {
        status = 'PERFECT';
        statusColor = '#a6e22e';
    } else {
        status = 'ACCEPTABLE';
        statusColor = '#ff8c00';
    }

    if (scanMode === 'multi' && !historicalCode) {
        // Add to batch
        batchResults.push({ code: val, days: diff, date: dateStr, status, statusColor });
        renderBatchList();
        inputField.value = '';
        inputField.focus();
        saveToHistory(val, diff, statusColor);
        return;
    }

    // Single scan
    document.getElementById('daysValue').innerText = diff;
    document.getElementById('dateText').innerText = dateStr;

    const label = document.getElementById('statusLabel');
    label.innerText = status;
    box.className = 'result-display ' + (diff > 31 ? 'bg-old' : diff <= 21 ? 'bg-perfect' : 'bg-acceptable');
    box.classList.remove('hidden');

    if (!historicalCode) {
        saveToHistory(val, diff, statusColor);
        handlePostCalculation();
    }
    renderHistory();
}

// Render batch list
function renderBatchList() {
    const list = document.getElementById('batchList');

    if (batchResults.length === 0) {
        list.innerHTML = '<div style="padding:14px;text-align:center;font-size:0.65rem;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:1px;">Enter codes to start scanning</div>';
        document.getElementById('batchActionBtns').classList.add('hidden');
        return;
    }

    list.innerHTML = batchResults.map((r, i) => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:11px 14px;${i < batchResults.length - 1 ? 'border-bottom:1px solid rgba(255,255,255,0.06);' : ''}">
            <div style="font-weight:900;font-size:0.9rem;color:#fff;letter-spacing:2px;">${r.code}</div>
            <div style="text-align:right;">
                <span style="color:${r.statusColor};font-weight:900;font-size:0.85rem;">${r.days}D</span>
                <div style="font-size:0.5rem;color:rgba(255,255,255,0.3);margin-top:2px;">${r.date}</div>
            </div>
            <button onclick="removeBatchItem(${i})" style="background:none;border:none;color:rgba(255,255,255,0.2);font-size:1rem;cursor:pointer;padding:0 0 0 8px;">✕</button>
        </div>
    `).join('');

    document.getElementById('batchActionBtns').classList.remove('hidden');
}

// Remove batch item
function removeBatchItem(index) {
    batchResults.splice(index, 1);
    renderBatchList();
}

// Shake animation on invalid input
function triggerShake() {
    document.getElementById('appCard').classList.add('shake');
    setTimeout(() => document.getElementById('appCard').classList.remove('shake'), 400);
}

// Copy single result
function copyResult() {
    const days = document.getElementById('daysValue').innerText;
    const date = document.getElementById('dateText').innerText;
    const code = document.getElementById('codeIn').value.toUpperCase();

    if (document.getElementById('resBox').classList.contains('hidden')) return;

    const plainText = `Article: ${activeArticle}\nCode: ${code}  Age: ${days} Days  Harvest Date: ${date}`;

    try {
        const blobText = new Blob([plainText], { type: 'text/plain' });
        const data = [new ClipboardItem({ 'text/plain': blobText })];
        navigator.clipboard.write(data).then(() => {
            showCopySuccess('copyBtn');
        }).catch(() => {
            navigator.clipboard.writeText(plainText).then(() => showCopySuccess('copyBtn'));
        });
    } catch (err) {
        navigator.clipboard.writeText(plainText).then(() => showCopySuccess('copyBtn'));
    }
}

// Copy batch result
function copyBatch() {
    if (batchResults.length === 0) return;

    const lines = batchResults.map(r => `Code: ${r.code}  Age: ${r.days} Days  Harvest Date: ${r.date}`).join('\n');
    const plainText = `Article: ${activeArticle}\n${lines}`;

    try {
        const blobText = new Blob([plainText], { type: 'text/plain' });
        const data = [new ClipboardItem({ 'text/plain': blobText })];
        navigator.clipboard.write(data).then(() => {
            showCopySuccess('batchCopyBtn');
        }).catch(() => {
            navigator.clipboard.writeText(plainText).then(() => showCopySuccess('batchCopyBtn'));
        });
    } catch (err) {
        navigator.clipboard.writeText(plainText).then(() => showCopySuccess('batchCopyBtn'));
    }
}

// Email single result
function emailResult() {
    const days = document.getElementById('daysValue').innerText;
    const date = document.getElementById('dateText').innerText;
    const code = document.getElementById('codeIn').value.toUpperCase();

    if (document.getElementById('resBox').classList.contains('hidden')) return;

    const subject = encodeURIComponent(`${activeArticle} Oud Fruit Ordernummer:`);
    const body = encodeURIComponent(`Article: ${activeArticle}\nCode: ${code}  Age: ${days} Days  Harvest Date: ${date}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

// Email batch result
function emailBatch() {
    if (batchResults.length === 0) return;

    const lines = batchResults.map(r => `Code: ${r.code}  Age: ${r.days} Days  Harvest Date: ${r.date}`).join('\n');
    const subject = encodeURIComponent(`${activeArticle} Oud Fruit Ordernummer:`);
    const body = encodeURIComponent(`Article: ${activeArticle}\n${lines}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

// Copy success feedback
function showCopySuccess(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.classList.add('success');
    btn.innerHTML = `<i class="bi bi-check-lg"></i> COPIED`;
    setTimeout(() => {
        btn.classList.remove('success');
        btn.innerHTML = `<i class="bi bi-clipboard"></i> COPY`;
    }, 2000);
}
