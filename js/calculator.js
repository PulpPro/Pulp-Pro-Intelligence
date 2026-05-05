// Calculator Module
function initCalculator() {
    const inputField = document.getElementById('codeIn');
    if (!inputField) return;

    inputField.value = '';
    document.getElementById('resBox').classList.add('hidden');

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
}

function handlePostCalculation() {
    const inputField = document.getElementById('codeIn');
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

function checkFruit(historicalCode = null) {
    const inputField = document.getElementById('codeIn');
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
    box.classList.remove('hidden');

    if (diff > 31) {
        label.innerText = 'TOO OLD';
        box.className = 'result-display bg-old';
    } else if (diff <= 21) {
        label.innerText = 'PERFECT';
        box.className = 'result-display bg-perfect';
    } else {
        label.innerText = 'ACCEPTABLE';
        box.className = 'result-display bg-acceptable';
    }

    if (!historicalCode) {
        saveToHistory(val, diff);
        handlePostCalculation();
    }
    renderHistory();
}

function triggerShake() {
    document.getElementById('appCard').classList.add('shake');
    setTimeout(() => document.getElementById('appCard').classList.remove('shake'), 400);
}

function copyResult() {
    const inputField = document.getElementById('codeIn');
    const days = document.getElementById('daysValue').innerText;
    const date = document.getElementById('dateText').innerText;
    const code = inputField.value.toUpperCase();

    if (document.getElementById('resBox').classList.contains('hidden')) return;

    const plainText = `Pulp Pro Report\nCode: ${code}\nAge: ${days} Days\nHarvest Date: ${date}`;
    const htmlText = `<div style="font-family:sans-serif;"><p><strong>Pulp Pro Report</strong></p><p>Code: <strong>${code}</strong></p><p>Age: <strong>${days} Days</strong></p><p>Harvest Date: ${date}</p></div>`;

    try {
        const blobHTML = new Blob([htmlText], { type: 'text/html' });
        const blobText = new Blob([plainText], { type: 'text/plain' });
        const data = [new ClipboardItem({ 'text/plain': blobText, 'text/html': blobHTML })];
        navigator.clipboard.write(data).then(showCopySuccess).catch(() => {
            navigator.clipboard.writeText(plainText).then(showCopySuccess);
        });
    } catch (err) {
        navigator.clipboard.writeText(plainText).then(showCopySuccess);
    }
}

function showCopySuccess() {
    const btn = document.getElementById('copyBtn');
    btn.classList.add('success');
    btn.innerHTML = `<i class="bi bi-check-lg"></i> COPIED`;
    setTimeout(() => {
        btn.classList.remove('success');
        btn.innerHTML = `<i class="bi bi-clipboard"></i> COPY`;
    }, 2000);
}
