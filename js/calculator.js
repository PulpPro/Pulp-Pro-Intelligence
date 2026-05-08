const inputField = document.getElementById('codeIn');
let scanMode = 'single';
let batchCodes = [];

// Input listeners
inputField.addEventListener('input', () => {
    if (scanMode === 'single') {
        document.getElementById('resBox').classList.add('hidden');
        renderHistory();
    }
});

inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (scanMode === 'single') {
            checkFruit();
        } else {
            addToBatch();
        }
    }
});

// Set scan mode
function setScanMode(mode) {
    scanMode = mode;
    batchCodes = [];
    document.getElementById('singleCodeBtn').classList.toggle('active', mode === 'single');
    document.getElementById('batchCodeBtn').classList.toggle('active', mode === 'batch');
    inputField.value = '';
    document.getElementById('resBox').classList.add('hidden');
    document.getElementById('daysValue').style.display = 'block';
    document.getElementById('calcBtn').style.display = mode === 'single' ? 'block' : 'none';
    document.getElementById('batchList').style.display = mode === 'batch' ? 'block' : 'none';
    document.getElementById('batchReportBtn').style.display = 'none';
    if (mode === 'batch') renderBatchList();
    inputField.focus();
}

// Add code to batch
function addToBatch() {
    const val = inputField.value.toUpperCase();
    if (val.length < 3) { triggerShake(); return; }

    const mChar = val.charCodeAt(0);
    const dChar = val.charCodeAt(1);
    const yDigit = val.charAt(2);
    const isValid = (mChar >= 65 && mChar <= 76) &&
                    (dChar >= 65 && dChar <= 90) &&
                    (yDigit === '1' || yDigit === '2');
    if (!isValid) { triggerShake(); return; }

    const now = new Date();
    const m = mChar - 65;
    let d = dChar - 64;
    if (yDigit === '2') d += 26;
    let hDate = new Date(now.getFullYear(), m, d);
    if (hDate > now) hDate.setFullYear(now.getFullYear() - 1);
    const diff = Math.floor((now - hDate) / (1000 * 60 * 60 * 24));
    const dateStr = hDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

    let status = '', statusColor = '';
    if (diff > 31) { status = 'TOO OLD'; statusColor = '#ff4d4d'; }
    else if (diff <= 21) { status = 'PERFECT'; statusColor = '#a6e22e'; }
    else { status = 'ACCEPTABLE'; statusColor = '#ff8c00'; }

    batchCodes.push({ code: val, days: diff, date: dateStr, status, color: statusColor });
    inputField.value = '';
    renderBatchList();
    document.getElementById('batchReportBtn').style.display = 'block';
    inputField.focus();
}

// Render batch list
function renderBatchList() {
    const container = document.getElementById('batchList');
    if (batchCodes.length === 0) {
        container.innerHTML = `<div style="padding:20px; text-align:center; color:var(--text-dim); font-size:0.7rem; opacity:0.5;">Enter a code and press Enter to add</div>`;
        return;
    }
    container.innerHTML = batchCodes.map((item, index) => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 15px; border-bottom:1px solid var(--border-glass);">
            <div>
                <div style="font-weight:900; font-family:monospace; font-size:0.85rem;">${item.code}</div>
                <div style="font-size:0.6rem; opacity:0.6; margin-top:2px;">${item.date}</div>
            </div>
            <div style="text-align:right; margin-right:10px;">
                <div style="color:${item.color}; font-weight:900; font-size:0.8rem;">${item.days}D</div>
                <div style="font-size:0.6rem; opacity:0.7;">${item.status}</div>
            </div>
            <i class="bi bi-x-circle" onclick="removeBatchCode(${index})" style="cursor:pointer; color:var(--pulp-red); font-size:1.1rem;"></i>
        </div>
    `).join('');
}

// Remove a code from batch
function removeBatchCode(index) {
    batchCodes.splice(index, 1);
    renderBatchList();
    if (batchCodes.length === 0) {
        document.getElementById('batchReportBtn').style.display = 'none';
        document.getElementById('resBox').classList.add('hidden');
    }
}

// Show batch report
function showBatchReport() {
    if (batchCodes.length === 0) return;
    document.getElementById('daysValue').style.display = 'none';
    document.getElementById('resBox').classList.remove('hidden');
    document.getElementById('resBox').className = 'result-display bg-perfect';
    document.getElementById('statusLabel').innerText = `BATCH — ${batchCodes.length} CODE${batchCodes.length > 1 ? 'S' : ''}`;
    document.getElementById('dateText').innerText = 'Ready to copy';
}

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

// Main calculation logic (single mode)
function checkFruit(historicalCode = null) {
    const val = historicalCode || inputField.value.toUpperCase();
    if (historicalCode) inputField.value = historicalCode;

    const box = document.getElementById('resBox');
    document.getElementById('daysValue').style.display = 'block';

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
    let hDate = new Date(now.getFullYear(), m, d);
    if (hDate > now) hDate.setFullYear(now.getFullYear() - 1);
    const diff = Math.floor((now - hDate) / (1000 * 60 * 60 * 24));

    document.getElementById('daysValue').innerText = diff;
    document.getElementById('dateText').innerText = hDate.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    }).toUpperCase();

    const label = document.getElementById('statusLabel');
    let statusColor = '';
    box.classList.remove('hidden');

    if (diff > 31) {
        label.innerText = 'TOO OLD';
        box.className = 'result-display bg-old';
        statusColor = '#ff4d4d';
    } else if (diff <= 21) {
        label.innerText = 'PERFECT';
        box.className = 'result-display bg-perfect';
        statusColor = '#a6e22e';
    } else {
        label.innerText = 'ACCEPTABLE';
        box.className = 'result-display bg-acceptable';
        statusColor = '#ff8c00';
    }

    if (!historicalCode) {
        saveToHistory(val, diff, statusColor);
        handlePostCalculation();
    }
    renderHistory();
}

// Shake animation on invalid input
function triggerShake() {
    document.getElementById('appCard').classList.add('shake');
    setTimeout(() => document.getElementById('appCard').classList.remove('shake'), 400);
}

// Copy result to clipboard
function copyResult() {
    const appUrl = 'https://pulppro.github.io/Pulp-Pro-Intelligence/';
    let plainText = '';
    let htmlText = '';

    if (scanMode === 'single') {
        if (document.getElementById('resBox').classList.contains('hidden')) return;
        const days = document.getElementById('daysValue').innerText;
        const date = document.getElementById('dateText').innerText;
        const code = inputField.value.toUpperCase();

        plainText = `Pulp Pro Intelligence: ${appUrl}\nCode: ${code}  Age: ${days} Days  Harvest Date: ${date}`;

        htmlText = `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.8;">
<p style="margin:0 0 6px 0;"><a href="${appUrl}" style="color:#0066cc;text-decoration:none;">Pulp Pro Intelligence</a></p>
<p style="margin:0;">Code: <strong style="color:#cc0000;">${code}</strong>&nbsp;&nbsp;Age: <strong style="color:#cc0000;">${days} Days</strong>&nbsp;&nbsp;Harvest Date: ${date}</p>
</div>`;

    } else {
        if (batchCodes.length === 0) return;

        const lines = batchCodes.map(item =>
            `Code: ${item.code}  Age: ${item.days} Days  Harvest Date: ${item.date}`
        ).join('\n');
        plainText = `Pulp Pro Intelligence: ${appUrl}\n${lines}`;

        const htmlLines = batchCodes.map(item =>
            `<p style="margin:0;">Code: <strong style="color:#cc0000;">${item.code}</strong>&nbsp;&nbsp;Age: <strong style="color:#cc0000;">${item.days} Days</strong>&nbsp;&nbsp;Harvest Date: ${item.date}</p>`
        ).join('');

        htmlText = `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.8;">
<p style="margin:0 0 6px 0;"><a href="${appUrl}" style="color:#0066cc;text-decoration:none;">Pulp Pro Intelligence</a></p>
${htmlLines}
</div>`;
    }

    try {
        const blobHTML = new Blob([htmlText], { type: 'text/html' });
        const blobText = new Blob([plainText], { type: 'text/plain' });
        const data = [new ClipboardItem({ 'text/plain': blobText, 'text/html': blobHTML })];
        navigator.clipboard.write(data).then(() => {
            showCopySuccess();
        }).catch(() => {
            navigator.clipboard.writeText(plainText).then(showCopySuccess);
        });
    } catch (err) {
        navigator.clipboard.writeText(plainText).then(showCopySuccess);
    }
}

// Copy success feedback
function showCopySuccess() {
    const btn = document.getElementById('copyBtn');
    btn.classList.add('success');
    btn.innerHTML = `<i class="bi bi-check-lg"></i> COPIED`;
    setTimeout(() => {
        btn.classList.remove('success');
        btn.innerHTML = `<i class="bi bi-clipboard"></i> COPY`;
    }, 2000);
}
