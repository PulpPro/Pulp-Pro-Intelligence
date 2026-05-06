const ColourScanner = (() => {
    let cameraStream = null;
    let scanMode = 'single';
    let multiScans = [];
    const MAX_SCANS = 3;

    const COLOUR_STAGES = [
        { value: 1,   hex: '#3d5c2a', name: 'Full Green',     shelfLife: '7+ Days',  status: 'Unripe',   statusColor: '#4caf50' },
        { value: 1.5, hex: '#4a6b2e', name: 'Green+',         shelfLife: '6–7 Days', status: 'Unripe',   statusColor: '#4caf50' },
        { value: 2,   hex: '#6b8c35', name: 'More Green',      shelfLife: '5–6 Days', status: 'Early',    statusColor: '#8bc34a' },
        { value: 2.5, hex: '#8fa83c', name: 'Green-Yellow',    shelfLife: '4–5 Days', status: 'Turning',  statusColor: '#cddc39' },
        { value: 3,   hex: '#b8b830', name: 'More Yellow',     shelfLife: '3–4 Days', status: 'Turning',  statusColor: '#ffeb3b' },
        { value: 3.5, hex: '#c9b025', name: 'Yellow-Green',    shelfLife: '3 Days',   status: 'Ripening', statusColor: '#ffc107' },
        { value: 4,   hex: '#d4aa22', name: 'More Yellow',     shelfLife: '2–3 Days', status: 'Ripening', statusColor: '#ffd740' },
        { value: 4.5, hex: '#d4a020', name: 'Full Yellow',     shelfLife: '2 Days',   status: 'Ready',    statusColor: '#ffb300' },
        { value: 5,   hex: '#c8901a', name: 'Yellow + Flecks', shelfLife: '1–2 Days', status: 'Peak',     statusColor: '#ff8f00' },
        { value: 5.5, hex: '#a87018', name: 'Yellow-Brown',    shelfLife: '1 Day',    status: 'Overripe', statusColor: '#ff6f00' },
        { value: 6,   hex: '#7a5010', name: 'Full Brown',      shelfLife: 'Sell Now', status: 'Overripe', statusColor: '#ff5722' }
    ];

    function hexToRgb(hex) {
        return {
            r: parseInt(hex.slice(1, 3), 16),
            g: parseInt(hex.slice(3, 5), 16),
            b: parseInt(hex.slice(5, 7), 16)
        };
    }

    function colourDistance(rgb1, rgb2) {
        const rMean = (rgb1.r + rgb2.r) / 2;
        const dr = rgb1.r - rgb2.r;
        const dg = rgb1.g - rgb2.g;
        const db = rgb1.b - rgb2.b;
        return Math.sqrt(
            (2 + rMean / 256) * dr * dr +
            4 * dg * dg +
            (2 + (255 - rMean) / 256) * db * db
        );
    }

    function detectStage(r, g, b) {
        const input = { r, g, b };
        const distances = COLOUR_STAGES.map(stage => ({
            stage,
            dist: colourDistance(input, hexToRgb(stage.hex))
        }));
        distances.sort((a, b) => a.dist - b.dist);

        const best = distances[0];
        const second = distances[1];

        if (second.dist - best.dist < 20) {
            const lo = best.stage.value < second.stage.value ? best.stage : second.stage;
            const hi = best.stage.value < second.stage.value ? second.stage : best.stage;
            return { type: 'range', lower: lo, upper: hi };
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
        const size = 80;
        const data = ctx.getImageData(cx - size / 2, cy - size / 2, size, size).data;

        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
            r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
        }
        return {
            r: Math.round(r / count),
            g: Math.round(g / count),
            b: Math.round(b / count)
        };
    }

    async function startCamera() {
        try {
            if (cameraStream) stopCamera();
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    zoom: 1.0
                }
            });
            const video = document.getElementById('csVideo');
            video.srcObject = cameraStream;

            const track = cameraStream.getVideoTracks()[0];
            if (track && track.getCapabilities) {
                const capabilities = track.getCapabilities();
                if (capabilities.zoom) {
                    await track.applyConstraints({ advanced: [{ zoom: capabilities.zoom.min }] });
                }
            }

            await video.play();
            const placeholder = document.getElementById('csPlaceholder');
            if (placeholder) placeholder.style.display = 'none';
            video.style.display = 'block';
        } catch (err) {
            console.warn('Camera unavailable:', err);
            const placeholder = document.getElementById('csPlaceholder');
            if (placeholder) placeholder.style.display = 'flex';
            const video = document.getElementById('csVideo');
            if (video) video.style.display = 'none';
        }
    }

    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(t => t.stop());
            cameraStream = null;
        }
    }

    function showView(viewId) {
        ['cs-scanner', 'cs-single-result', 'cs-batch-result'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
        const target = document.getElementById(viewId);
        if (target) target.classList.remove('hidden');
    }

    function init() {
        multiScans = [];
        setScanMode('single');
    }

    function setScanMode(mode) {
        scanMode = mode;
        multiScans = [];
        const singleBtn = document.getElementById('csSingleBtn');
        const multiBtn = document.getElementById('csMultiBtn');
        if (singleBtn) singleBtn.classList.toggle('active', mode === 'single');
        if (multiBtn) multiBtn.classList.toggle('active', mode === 'multi');
        const batchBtn = document.getElementById('csBatchBtn');
        if (batchBtn) batchBtn.style.display = 'none';
        showView('cs-scanner');
        updateScanButton();
        renderMultiScans();
        startCamera();
    }

    function updateScanButton() {
        const btn = document.getElementById('csScanBtn');
        if (!btn) return;
        if (scanMode === 'single') {
            btn.innerHTML = '<i class="bi bi-camera-fill"></i> Scan';
        } else {
            const next = multiScans.length + 1;
            btn.innerHTML = next <= MAX_SCANS
                ? `<i class="bi bi-camera-fill"></i> Scan Box ${next}`
                : '<i class="bi bi-check-lg"></i> All Scanned';
        }
    }

    function doScan() {
        if (scanMode === 'multi' && multiScans.length >= MAX_SCANS) return;

        const btn = document.getElementById('csScanBtn');
        if (btn) {
            btn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Scanning...';
            btn.disabled = true;
        }

        setTimeout(() => {
            const rgb = sampleCameraColour();
            let result;

            if (rgb) {
                result = detectStage(rgb.r, rgb.g, rgb.b);
            } else {
                const idx = Math.floor(Math.random() * COLOUR_STAGES.length);
                result = { type: 'single', stage: COLOUR_STAGES[idx] };
            }

            if (btn) btn.disabled = false;

            if (scanMode === 'single') {
                showSingleResult(result);
            } else {
                multiScans.push(result);
                renderMultiScans();
                updateScanButton();
                if (multiScans.length >= 1) {
                    const batchBtn = document.getElementById('csBatchBtn');
                    if (batchBtn) batchBtn.style.display = 'block';
                }
            }
        }, 600);
    }

    function getResultColour(result) {
        if (result.type === 'single') return result.stage.hex;
        const c1 = hexToRgb(result.lower.hex);
        const c2 = hexToRgb(result.upper.hex);
        return `rgb(${Math.round((c1.r + c2.r) / 2)},${Math.round((c1.g + c2.g) / 2)},${Math.round((c1.b + c2.b) / 2)})`;
    }

    function getResultLabel(result) {
        if (result.type === 'single') return `Color ${result.stage.value} — ${result.stage.name}`;
        const lo = Math.min(result.lower.value, result.upper.value);
        const hi = Math.max(result.lower.value, result.upper.value);
        return `Color ${lo}/${hi}`;
    }

    function getResultName(result) {
        if (result.type === 'single') return result.stage.name;
        const lo = Math.min(result.lower.value, result.upper.value);
        const hi = Math.max(result.lower.value, result.upper.value);
        const loStage = COLOUR_STAGES.find(s => s.value === lo);
        const hiStage = COLOUR_STAGES.find(s => s.value === hi);
        return `${loStage.name} / ${hiStage.name}`;
    }

    function getResultShelfLife(result) {
        if (result.type === 'single') return result.stage.shelfLife;
        const riper = result.lower.value > result.upper.value ? result.lower : result.upper;
        return riper.shelfLife;
    }

    function getResultStatus(result) {
        if (result.type === 'single') return { label: result.stage.status, color: result.stage.statusColor };
        const riper = result.lower.value > result.upper.value ? result.lower : result.upper;
        return { label: riper.status, color: riper.statusColor };
    }

    function showSingleResult(result) {
        stopCamera();
        const colour = getResultColour(result);
        const label = getResultLabel(result);
        const name = getResultName(result);
        const shelfLife = getResultShelfLife(result);
        const status = getResultStatus(result);
        const stageVal = result.type === 'single'
            ? result.stage.value
            : (result.lower.value + result.upper.value) / 2;
        const barWidth = Math.round((stageVal / 6) * 100);

        const swatch = document.getElementById('csSingleSwatch');
        if (swatch) {
            swatch.style.background = colour;
            swatch.style.boxShadow = `0 8px 30px ${colour}60`;
        }
        const labelEl = document.getElementById('csSingleLabel');
        if (labelEl) labelEl.innerText = label;
        const nameEl = document.getElementById('csSingleName');
        if (nameEl) nameEl.innerText = name;
        const bar = document.getElementById('csSingleBar');
        if (bar) { bar.style.width = barWidth + '%'; bar.style.background = colour; }
        const shelfEl = document.getElementById('csSingleShelf');
        if (shelfEl) shelfEl.innerText = shelfLife;
        const statusEl = document.getElementById('csSingleStatus');
        if (statusEl) { statusEl.innerText = status.label; statusEl.style.color = status.color; }

        showView('cs-single-result');
    }

    function renderMultiScans() {
        const container = document.getElementById('csMultiList');
        if (!container) return;
        let html = '';
        for (let i = 0; i < MAX_SCANS; i++) {
            const scan = multiScans[i];
            if (scan) {
                const colour = getResultColour(scan);
                const label = getResultLabel(scan);
                html += `
                <div class="cs-scan-row">
                    <div class="cs-scan-dot" style="background:${colour}; box-shadow:0 4px 12px ${colour}60;"></div>
                    <div class="cs-scan-info">
                        <div class="cs-scan-lbl">Box ${i + 1}</div>
                        <div class="cs-scan-val">${label}</div>
                    </div>
                    <i class="bi bi-check-circle-fill" style="color:var(--pulp-lime); font-size:1rem; flex-shrink:0;"></i>
                </div>`;
            } else {
                html += `
                <div class="cs-scan-row" style="border:1px dashed rgba(255,255,255,0.1); background:transparent;">
                    <div class="cs-scan-dot" style="background:rgba(255,255,255,0.04); border:1px dashed rgba(255,255,255,0.15);"></div>
                    <div class="cs-scan-info">
                        <div class="cs-scan-lbl" style="color:rgba(255,255,255,0.2);">Box ${i + 1}</div>
                        <div class="cs-scan-val" style="color:rgba(255,255,255,0.18); font-size:0.68rem; font-weight:600;">Awaiting scan</div>
                    </div>
                    <i class="bi bi-circle" style="color:rgba(255,255,255,0.1); font-size:1rem; flex-shrink:0;"></i>
                </div>`;
            }
        }
        container.innerHTML = html;
    }

    function getBatchResult() {
        if (multiScans.length === 0) return;
        stopCamera();

        const avgValue = multiScans.reduce((sum, r) => {
            const val = r.type === 'single'
                ? r.stage.value
                : (r.lower.value + r.upper.value) / 2;
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

        const batchSwatch = document.getElementById('csBatchSwatch');
        if (batchSwatch) {
            batchSwatch.style.background = colour;
            batchSwatch.style.boxShadow = `0 8px 30px ${colour}60`;
        }
        const batchLabel = document.getElementById('csBatchLabel');
        if (batchLabel) batchLabel.innerText = label;
        const batchShelf = document.getElementById('csBatchShelf');
        if (batchShelf) batchShelf.innerText = shelfLife;
        const batchStatus = document.getElementById('csBatchStatus');
        if (batchStatus) { batchStatus.innerText = status.label; batchStatus.style.color = status.color; }
        const batchCount = document.getElementById('csBatchCount');
        if (batchCount) batchCount.innerText = multiScans.length + ' of ' + MAX_SCANS;

        renderBatchBreakdown();
        showView('cs-batch-result');
    }

    function renderBatchBreakdown() {
        const container = document.getElementById('csBatchBreakdown');
        if (!container) return;
        container.innerHTML = multiScans.map((scan, i) => {
            const colour = getResultColour(scan);
            const label = getResultLabel(scan);
            return `
            <div class="cs-scan-row">
                <div class="cs-scan-dot" style="background:${colour}; box-shadow:0 4px 12px ${colour}60;"></div>
                <div class="cs-scan-info">
                    <div class="cs-scan-lbl">Box ${i + 1}</div>
                    <div class="cs-scan-val">${label}</div>
                </div>
            </div>`;
        }).join('');
    }

    function copySingleResult() {
        const label = document.getElementById('csSingleLabel')?.innerText || '';
        const shelf = document.getElementById('csSingleShelf')?.innerText || '';
        const status = document.getElementById('csSingleStatus')?.innerText || '';
        const appUrl = 'https://pulppro.github.io/Pulp-Pro-Intelligence/';
        const text = `Pulp Pro Intelligence: ${appUrl}\n━━━━━━━━━━━━━━━━━━━━\nBANANA COLOUR SCAN\n${label}\nShelf Life: ${shelf}\nStatus: ${status}`;
        navigator.clipboard.writeText(text).then(() => showCopyFeedback('csCopySingle'));
    }

    function copyBatchResult() {
        const label = document.getElementById('csBatchLabel')?.innerText || '';
        const shelf = document.getElementById('csBatchShelf')?.innerText || '';
        const status = document.getElementById('csBatchStatus')?.innerText || '';
        const count = document.getElementById('csBatchCount')?.innerText || '';
        const appUrl = 'https://pulppro.github.io/Pulp-Pro-Intelligence/';
        const breakdownItems = multiScans.map((s, i) => `Box ${i + 1}: ${getResultLabel(s)}`).join('\n');
        const text = `Pulp Pro Intelligence: ${appUrl}\n━━━━━━━━━━━━━━━━━━━━\nBANANA BATCH COLOUR SCAN\nBatch Average: ${label}\nBoxes Scanned: ${count}\nShelf Life: ${shelf}\nStatus: ${status}\n━━━━━━━━━━━━━━━━━━━━\n${breakdownItems}`;
        navigator.clipboard.writeText(text).then(() => showCopyFeedback('csCopyBatch'));
    }

    function showCopyFeedback(btnId) {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-check-lg"></i> Copied!';
        btn.style.background = 'var(--pulp-lime)';
        btn.style.color = '#000';
        setTimeout(() => {
            btn.innerHTML = orig;
            btn.style.background = '';
            btn.style.color = '';
        }, 2000);
    }

    function resetScanner() {
        multiScans = [];
        const batchBtn = document.getElementById('csBatchBtn');
        if (batchBtn) batchBtn.style.display = 'none';
        showView('cs-scanner');
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
