const ColourScanner = (() => {
    let cameraStream = null;
    let scanMode = 'single';
    let multiScans = [];
    const MAX_SCANS = 3;

    const COLOUR_STAGES = [
        { value: 1,   hex: '#1a5c0a', name: 'Full Green',    shelfLife: '7+ Days',  status: 'Unripe',      statusColor: '#4caf50' },
        { value: 1.5, hex: '#2e7d0e', name: 'Green+',        shelfLife: '6–7 Days', status: 'Unripe',      statusColor: '#4caf50' },
        { value: 2,   hex: '#5a9e10', name: 'More Green',     shelfLife: '5–6 Days', status: 'Early',       statusColor: '#8bc34a' },
        { value: 2.5, hex: '#8db81a', name: 'Green-Yellow',   shelfLife: '4–5 Days', status: 'Turning',     statusColor: '#cddc39' },
        { value: 3,   hex: '#c8c81a', name: 'More Yellow',    shelfLife: '3–4 Days', status: 'Turning',     statusColor: '#ffeb3b' },
        { value: 3.5, hex: '#d4b800', name: 'Yellow-Green',   shelfLife: '3 Days',   status: 'Ripening',    statusColor: '#ffc107' },
        { value: 4,   hex: '#f5c518', name: 'More Yellow',    shelfLife: '2–3 Days', status: 'Ripening',    statusColor: '#ffd740' },
        { value: 4.5, hex: '#f5b800', name: 'Full Yellow',    shelfLife: '2 Days',   status: 'Ready',       statusColor: '#ffb300' },
        { value: 5,   hex: '#f5a000', name: 'Yellow + Flecks',shelfLife: '1–2 Days', status: 'Peak',        statusColor: '#ff8f00' },
        { value: 5.5, hex: '#c87800', name: 'Yellow-Brown',   shelfLife: '1 Day',    status: 'Overripe',    statusColor: '#ff6f00' },
        { value: 6,   hex: '#7a4500', name: 'Full Brown',     shelfLife: 'Sell Now', status: 'Overripe',    statusColor: '#ff5722' }
    ];

    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    }

    function colourDistance(rgb1, rgb2) {
        return Math.sqrt(
            Math.pow(rgb1.r - rgb2.r, 2) +
            Math.pow(rgb1.g - rgb2.g, 2) +
            Math.pow(rgb1.b - rgb2.b, 2)
        );
    }

    function detectStage(r, g, b) {
        const input = { r, g, b };
        let distances = COLOUR_STAGES.map(stage => ({
            stage,
            dist: colourDistance(input, hexToRgb(stage.hex))
        }));
        distances.sort((a, b) => a.dist - b.dist);

        const best = distances[0];
        const second = distances[1];
        const threshold = 40;

        if (second.dist - best.dist < threshold) {
            return { type: 'range', lower: best.stage, upper: second.stage };
        }
        return { type: 'single', stage: best.stage };
    }

    function sampleCameraColour() {
        const video = document.getElementById('csVideo');
        const canvas = document.getElementById('csCanvas');
        if (!video || !video.videoWidth) return null;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        const cx = Math.floor(canvas.width / 2);
        const cy = Math.floor(canvas.height / 2);
        const size = 40;
        const data = ctx.getImageData(cx - size / 2, cy - size / 2, size, size).data;

        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
            r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
        }
        return { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) };
    }

    async function startCamera() {
        try {
            if (cameraStream) stopCamera();
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            const video = document.getElementById('csVideo');
            video.srcObject = cameraStream;
            await video.play();
            document.getElementById('csPlaceholder').style.display = 'none';
            video.style.display = 'block';
        } catch (err) {
            console.warn('Camera unavailable:', err);
            document.getElementById('csPlaceholder').style.display = 'flex';
            document.getElementById('csVideo').style.display = 'none';
        }
    }

    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(t => t.stop());
            cameraStream = null;
        }
    }

    function init() {
        setScanMode('single');
    }

    function setScanMode(mode) {
        scanMode = mode;
        multiScans = [];
        document.getElementById('csSingleBtn').classList.toggle('active', mode === 'single');
        document.getElementById('csMultiBtn').classList.toggle('active', mode === 'multi');
        updateScanButton();
        renderMultiScans();
        startCamera();
    }

    function updateScanButton() {
        const btn = document.getElementById('csScanBtn');
        if (scanMode === 'single') {
            btn.innerText = 'Scan';
        } else {
            const next = multiScans.length + 1;
            btn.innerText = next <= MAX_SCANS ? `Scan Box ${next}` : 'Done';
        }
    }

    function doScan() {
        const rgb = sampleCameraColour();
        let result;

        if (rgb) {
            result = detectStage(rgb.r, rgb.g, rgb.b);
        } else {
            // Fallback for demo/no camera — pick a random stage
            const idx = Math.floor(Math.random() * COLOUR_STAGES.length);
            result = { type: 'single', stage: COLOUR_STAGES[idx] };
        }

        if (scanMode === 'single') {
            showSingleResult(result);
        } else {
            if (multiScans.length < MAX_SCANS) {
                multiScans.push(result);
                renderMultiScans();
                updateScanButton();
                if (multiScans.length === MAX_SCANS) {
                    document.getElementById('csBatchBtn').style.display = 'block';
                }
            }
        }
    }

    function getResultColour(result) {
        if (result.type === 'single') return result.stage.hex;
        // For range, blend the two colours
        const c1 = hexToRgb(result.lower.hex);
        const c2 = hexToRgb(result.upper.hex);
        const blended = {
            r: Math.round((c1.r + c2.r) / 2),
            g: Math.round((c1.g + c2.g) / 2),
            b: Math.round((c1.b + c2.b) / 2)
        };
        return `rgb(${blended.r},${blended.g},${blended.b})`;
    }

    function getResultLabel(result) {
        if (result.type === 'single') {
            return `Color ${result.stage.value} — ${result.stage.name}`;
        }
        const a = result.lower.value;
        const b = result.upper.value;
        const lo = Math.min(a, b);
        const hi = Math.max(a, b);
        return `Color ${lo}/${hi}`;
    }

    function getResultName(result) {
        if (result.type === 'single') return result.stage.name;
        const a = result.lower.value;
        const b = result.upper.value;
        const lo = Math.min(a, b);
        const hi = Math.max(a, b);
        const loStage = COLOUR_STAGES.find(s => s.value === lo);
        const hiStage = COLOUR_STAGES.find(s => s.value === hi);
        return `${loStage.name} / ${hiStage.name}`;
    }

    function getResultShelfLife(result) {
        if (result.type === 'single') return result.stage.shelfLife;
        const a = result.lower;
        const b = result.upper;
        const riper = a.value > b.value ? a : b;
        return riper.shelfLife;
    }

    function getResultStatus(result) {
        if (result.type === 'single') return { label: result.stage.status, color: result.stage.statusColor };
        const a = result.lower;
        const b = result.upper;
        const riper = a.value > b.value ? a : b;
        return { label: riper.status, color: riper.statusColor };
    }

    function showSingleResult(result) {
        stopCamera();
        const colour = getResultColour(result);
        const label = getResultLabel(result);
        const name = getResultName(result);
        const shelfLife = getResultShelfLife(result);
        const status = getResultStatus(result);
        const stageVal = result.type === 'single' ? result.stage.value : (result.lower.value + result.upper.value) / 2;
        const barWidth = Math.round((stageVal / 6) * 100);

        document.getElementById('csSingleSwatch').style.background = colour;
        document.getElementById('csSingleLabel').innerText = label;
        document.getElementById('csSingleName').innerText = name;
        document.getElementById('csSingleBar').style.width = barWidth + '%';
        document.getElementById('csSingleBar').style.background = colour;
        document.getElementById('csSingleShelf').innerText = shelfLife;
        document.getElementById('csSingleStatus').innerText = status.label;
        document.getElementById('csSingleStatus').style.color = status.color;

        document.getElementById('cs-scanner').classList.add('hidden');
        document.getElementById('cs-single-result').classList.remove('hidden');
    }

    function renderMultiScans() {
        const container = document.getElementById('csMultiList');
        let html = '';

        for (let i = 0; i < MAX_SCANS; i++) {
            const scan = multiScans[i];
            if (scan) {
                const colour = getResultColour(scan);
                const label = getResultLabel(scan);
                html += `
                    <div class="cs-scan-row">
                        <div class="cs-scan-dot" style="background:${colour};"></div>
                        <div class="cs-scan-info">
                            <div class="cs-scan-lbl">Box ${i + 1}</div>
                            <div class="cs-scan-val">${label}</div>
                        </div>
                    </div>`;
            } else {
                html += `
                    <div class="cs-scan-row cs-scan-empty">
                        <div class="cs-scan-dot" style="background:rgba(255,255,255,0.05); border:1px dashed rgba(255,255,255,0.15);"></div>
                        <div class="cs-scan-info">
                            <div class="cs-scan-lbl" style="color:rgba(255,255,255,0.2);">Box ${i + 1}</div>
                            <div class="cs-scan-val" style="color:rgba(255,255,255,0.2); font-size:0.68rem;">Tap scan to add</div>
                        </div>
                    </div>`;
            }
        }
        container.innerHTML = html;
    }

    function getBatchResult() {
        if (multiScans.length === 0) return;
        stopCamera();

        const avgValue = multiScans.reduce((sum, r) => {
            const val = r.type === 'single' ? r.stage.value : (r.lower.value + r.upper.value) / 2;
            return sum + val;
        }, 0) / multiScans.length;

        const rounded = Math.round(avgValue * 2) / 2;
        const lower = COLOUR_STAGES.find(s => s.value === rounded);
        const above = COLOUR_STAGES.find(s => s.value === rounded + 0.5);
        const diff = Math.abs(avgValue - rounded);

        let batchResult;
        if (diff < 0.15 || !above) {
            batchResult = { type: 'single', stage: lower || COLOUR_STAGES[COLOUR_STAGES.length - 1] };
        } else {
            batchResult = { type: 'range', lower: lower, upper: above };
        }

        const colour = getResultColour(batchResult);
        const label = getResultLabel(batchResult);
        const shelfLife = getResultShelfLife(batchResult);
        const status = getResultStatus(batchResult);

        document.getElementById('csBatchSwatch').style.background = colour;
        document.getElementById('csBatchLabel').innerText = label;
        document.getElementById('csBatchShelf').innerText = shelfLife;
        document.getElementById('csBatchStatus').innerText = status.label;
        document.getElementById('csBatchStatus').style.color = status.color;
        document.getElementById('csBatchCount').innerText = multiScans.length + ' of ' + MAX_SCANS;

        renderBatchBreakdown();

        document.getElementById('cs-scanner').classList.add('hidden');
        document.getElementById('cs-batch-result').classList.remove('hidden');
    }

    function renderBatchBreakdown() {
        const container = document.getElementById('csBatchBreakdown');
        container.innerHTML = multiScans.map((scan, i) => {
            const colour = getResultColour(scan);
            const label = getResultLabel(scan);
            return `
                <div class="cs-scan-row">
                    <div class="cs-scan-dot" style="background:${colour};"></div>
                    <div class="cs-scan-info">
                        <div class="cs-scan-lbl">Box ${i + 1}</div>
                        <div class="cs-scan-val">${label}</div>
                    </div>
                </div>`;
        }).join('');
    }

    function copySingleResult() {
        const label = document.getElementById('csSingleLabel').innerText;
        const shelf = document.getElementById('csSingleShelf').innerText;
        const status = document.getElementById('csSingleStatus').innerText;
        const appUrl = 'https://pulppro.github.io/Pulp-Pro-Intelligence/';
        const text = `Pulp Pro Intelligence: ${appUrl}\n━━━━━━━━━━━━━━━━━━━━\nBANANA COLOUR SCAN\n${label}\nShelf Life: ${shelf}\nStatus: ${status}`;
        navigator.clipboard.writeText(text).then(() => showCopyFeedback('csCopySingle'));
    }

    function copyBatchResult() {
        const label = document.getElementById('csBatchLabel').innerText;
        const shelf = document.getElementById('csBatchShelf').innerText;
        const status = document.getElementById('csBatchStatus').innerText;
        const count = document.getElementById('csBatchCount').innerText;
        const appUrl = 'https://pulppro.github.io/Pulp-Pro-Intelligence/';
        const breakdownItems = multiScans.map((s, i) => `Box ${i + 1}: ${getResultLabel(s)}`).join('\n');
        const text = `Pulp Pro Intelligence: ${appUrl}\n━━━━━━━━━━━━━━━━━━━━\nBANANA BATCH COLOUR SCAN\nBatch Average: ${label}\nBoxes Scanned: ${count}\nShelf Life: ${shelf}\nStatus: ${status}\n━━━━━━━━━━━━━━━━━━━━\n${breakdownItems}`;
        navigator.clipboard.writeText(text).then(() => showCopyFeedback('csCopyBatch'));
    }

    function showCopyFeedback(btnId) {
        const btn = document.getElementById(btnId);
        const orig = btn.innerText;
        btn.innerText = '✓ Copied!';
        btn.style.background = '#a6e22e';
        btn.style.color = '#000';
        setTimeout(() => {
            btn.innerText = orig;
            btn.style.background = '';
            btn.style.color = '';
        }, 2000);
    }

    function resetScanner() {
        multiScans = [];
        document.getElementById('cs-single-result').classList.add('hidden');
        document.getElementById('cs-batch-result').classList.add('hidden');
        document.getElementById('cs-scanner').classList.remove('hidden');
        document.getElementById('csBatchBtn').style.display = 'none';
        renderMultiScans();
        updateScanButton();
        startCamera();
    }

    function close() {
        stopCamera();
        showHub();
    }

    return {
        init,
        setScanMode,
        doScan,
        getBatchResult,
        copySingleResult,
        copyBatchResult,
        resetScanner,
        close
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    ColourScanner.init();
});
