const inputField = document.getElementById('codeIn');

// Input listeners
inputField.addEventListener('input', () => {
    document.getElementById('resBox').classList.add('hidden');
    renderHistory();
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

    let d = dChar - 64;
    if (yDigit === '2') d += 26;

    const isValid = (mChar >= 65 && mChar <= 76) &&
                    (dChar >= 65 && dChar <= 90) &&
                    (yDigit === '1' || yDigit === '2') &&
                    (d >= 1 && d <= 31);

    if (!isValid) {
        box.classList.add('hidden');
        triggerShake();
        return;
    }

    const now = new Date();
    const m = mChar - 65;

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
    const days = document.getElementById('daysValue').innerText;
    const date = document.getElementById('dateText').innerText;
    const code = document.getElementById('codeIn').value.toUpperCase();

    if (document.getElementById('resBox').classList.contains('hidden')) return;

    const appUrl = 'https://pulppro.github.io/Pulp-Pro-Intelligence/';

    const plainText = `Pulp Pro Report\nCode: ${code}\nAge: ${days} Days\nHarvest Date: ${date}`;
    const htmlText = `
        <div style="font-family: sans-serif;">
            <div style="display: inline-block; background-color: #000000; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;">
                <img src="https://pulppro.github.io/Pulp-Pro-Intelligence/edited-image.png" alt="Pulp Pro" style="width: 24px; height: 24px; vertical-align: middle; margin-right: 8px;">
                <a href="${appUrl}" style="color: #a6e22e; font-weight: bold; text-decoration: none; font-size: 16px; vertical-align: middle;">Pulp Pro Report</a>
            </div>
            <p style="margin-top: 16px;">Code: <span style="color:#ff4d4d; font-weight:bold;">${code}</span></p>
            <p>Age: <span style="color:#ff4d4d; font-weight:bold;">${days} Days</span></p>
            <p>Harvest Date: ${date}</p>
        </div>
    `;

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
