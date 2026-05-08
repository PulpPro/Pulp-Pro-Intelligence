const inputField = document.getElementById('codeIn');
let scanMode = 'single'; // 'single' or 'batch'
let batchCodes = []; // Array to store batch scan codes

// Input listeners
inputField.addEventListener('input', () => {
    document.getElementById('resBox').classList.add('hidden');
    if (scanMode === 'single') {
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
    
    // Update toggle buttons
    document.getElementById('singleCodeBtn').classList.toggle('active', mode === 'single');
    document.getElementById('batchCodeBtn').classList.toggle('active', mode === 'batch');
    
    // Clear input and results
    inputField.value = '';
    document.getElementById('resBox').classList.add('hidden');
    
    // Show/hide batch elements
    const batchList = document.getElementById('batchList');
    const batchReportBtn = document.getElementById('batchReportBtn');
    
    if (mode === 'single') {
        batchList.style.display = 'none';
        batchReportBtn.style.display = 'none';
    } else {
        batchList.style.display = 'block';
        batchReportBtn.style.display = 'none';
        renderBatchList();
    }
}

// Add code to batch
function addToBatch() {
    const val = inputField.value.toUpperCase();
    
    if (val.length < 3) {
        triggerShake();
        return;
    }
    
    const mChar = val.charCodeAt(0);
    const dChar = val.charCodeAt(1);
    const yDigit = val.charAt(2);
    
    const isValid = (mChar >= 65 && mChar <= 76) &&
                    (dChar >= 65 && dChar <= 90) &&
                    (yDigit === '1' || yDigit === '2');
    
    if (!isValid) {
        triggerShake();
        return;
    }
    
    // Calculate for this code
    const now = new Date();
    const m = mChar - 65;
    let d = dChar - 64;
    if (yDigit === '2') d += 26;
    
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
    
    // Add to batch array
    batchCodes.push({
        code: val,
        days: diff,
        date: dateStr,
        status: status,
        color: statusColor
    });
    
    // Clear input
    inputField.value = '';
    
    // Render batch list
    renderBatchList();
    
    // Show batch report button
    document.getElementById('batchReportBtn').style.display = 'block';
}

// Render batch list
function renderBatchList() {
    const container = document.getElementById('batchList');
    
    if (batchCodes.length === 0) {
        container.innerHTML = `
            <div style="padding:20px; text-align:center; color:var(--text-dim); font-size:0.7rem; opacity:0.5;">
                Enter codes and press Enter to add to batch
            </div>`;
        return;
    }
    
    container.innerHTML = batchCodes.map((item, index) => `
        <div class="batch-item" style="display:flex; justify-content:space-between; align-items:center; padding:12px 15px; border-bottom:1px solid var(--border-glass);">
            <div>
                <div style="font-weight:900; font-family:monospace; font-size:0.85rem;">${item.code}</div>
                <div style="font-size:0.65rem; opacity:0.6; margin-top:2px;">${item.date}</div>
            </div>
            <div style="text-align:right;">
                <div style="color:${item.color}; font-weight:900; font-size:0.8rem;">${item.days}D</div>
                <div style="font-size:0.6rem; opacity:0.7;">${item.status}</div>
            </div>
            <i class="bi bi-x-circle" onclick="removeBatchCode(${index})" style="cursor:pointer; color:var(--pulp-red); opacity:0.6; margin-left:10px; font-size:1.2rem;"></i>
        </div>
    `).join('');
}

// Remove code from batch
function removeBatchCode(index) {
    batchCodes.splice(index, 1);
    renderBatchList();
    if (batchCodes.length === 0) {
        document.getElementById('batchReportBtn').style.display = 'none';
    }
}

// Show batch report
function showBatchReport() {
    if (batchCodes.length === 0) return;
    
    // For now, just show first code result in resBox
    // (You can enhance this later to show a summary)
    const first = batchCodes[0];
    document.getElementById('daysValue').innerText = first.days;
    document.getElementById('dateText').innerText = first.date;
    document.getElementById('statusLabel').innerText = first.status;
    document.getElementById('resBox').className = 'result-display';
    
    if (first.status === 'TOO OLD') {
        document.getElementById('resBox').classList.add('bg-old');
    } else if (first.status === 'PERFECT') {
        document.getElementById('resBox').classList.add('bg-perfect');
    } else {
        document.getElementById('resBox').classList.add('bg-acceptable');
    }
    
    document.getElementById('resBox').classList.remove('hidden');
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

    if (document.getElementById('resBox').classList.contains('hidden')) return;

    let plainText = '';
    let htmlText = '';

    if (scanMode === 'single') {
        // Single code copy
        const days = document.getElementById('daysValue').innerText;
        const date = document.getElementById('dateText').innerText;
        const code = document.getElementById('codeIn').value.toUpperCase();

        plainText = `Pulp Pro Intelligence: ${appUrl}\nCode: ${code}  Age: ${days} Days  Harvest Date: ${date}`;
        
        htmlText = `
            <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
                <p style="margin: 0 0 8px 0;">
                    <a href="${appUrl}" style="color: #0066cc; text-decoration: none;">Pulp Pro Intelligence</a>
                </p>
                <p style="margin: 0;">
                    Code: <span style="font-weight: bold; color: #ff0000;">${code}</span>  
                    Age: <span style="font-weight: bold; color: #ff0000;">${days} Days</span>  
                    Harvest Date: ${date}
                </p>
            </div>
        `;
    } else {
        // Batch copy
        if (batchCodes.length === 0) return;

        const lines = batchCodes.map(item => 
            `Code: ${item.code}  Age: ${item.days} Days  Harvest Date: ${item.date}`
        ).join('\n');

        plainText = `Pulp Pro Intelligence: ${appUrl}\n${lines}`;

        const htmlLines = batchCodes.map(item => `
            <p style="margin: 0;">
                Code: <span style="font-weight: bold; color: #ff0000;">${item.code}</span>  
                Age: <span style="font-weight: bold; color: #ff0000;">${item.days} Days</span>  
                Harvest Date: ${item.date}
            </p>
        `).join('');

        htmlText = `
            <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
                <p style="margin: 0 0 8px 0;">
                    <a href="${appUrl}" style="color: #0066cc; text-decoration: none;">Pulp Pro Intelligence</a>
                </p>
                ${htmlLines}
            </div>
        `;
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
