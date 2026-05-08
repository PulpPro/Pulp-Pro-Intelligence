const ColourScanner = (() => {
    let cameraStream = null;
    let scanMode = 'single';
    let multiScans = [];
    let capturedPhotos = [];
    const MAX_SCANS = 3;

    // ── AI MODEL STATE ────────────────────────────────────────
    const AI_MODEL_URL = 'https://raw.githubusercontent.com/PulpPro/banana-brain/main/scanner/banana_brain.json';
    let aiClassifier = null;
    let aiMobileNet = null;
    let aiReady = false;
    let aiLoading = false;

    // ── COLOUR STAGES (fallback HSV detection) ────────────────
    const COLOUR_STAGES = [
        { value: 1,   hex: '#78c830', name: 'Full Green',     shelfLife: '7+ Days',  status: 'Unripe',   statusColor: '#78c830' },
        { value: 1.5, hex: '#86c82c', name: 'Green+',         shelfLife: '6–7 Days', status: 'Unripe',   statusColor: '#86c82c' },
        { value: 2,   hex: '#98c428', name: 'More Green',      shelfLife: '5–6 Days', status: 'Early',    statusColor: '#98c428' },
        { value: 2.5, hex: '#aec022', name: 'Green-Yellow',    shelfLife: '4–5 Days', status: 'Turning',  statusColor: '#aec022' },
        { value: 3,   hex: '#c4bc1c', name: 'More Yellow',     shelfLife: '3–4 Days', status: 'Turning',  statusColor: '#c4bc1c' },
        { value: 3.5, hex: '#d4b418', name: 'Yellow-Green',    shelfLife: '3 Days',   status: 'Ripening', statusColor: '#d4b418' },
        { value: 4,   hex: '#dca814', name: 'More Yellow',     shelfLife: '2–3 Days', status: 'Ripening', statusColor: '#dca814' },
        { value: 4.5, hex: '#e0a010', name: 'Full Yellow',     shelfLife: '2 Days',   status: 'Ready',    statusColor: '#e0a010' },
        { value: 5,   hex: '#d89010', name: 'Yellow + Flecks', shelfLife: '1–2 Days', status: 'Peak',     statusColor: '#d89010' },
        { value: 5.5, hex: '#bc7414', name: 'Yellow-Brown',    shelfLife: '1 Day',    status: 'Overripe', statusColor: '#bc7414' },
        { value: 6,   hex: '#905818', name: 'Full Brown',      shelfLife: 'Sell Now', status: 'Overripe', statusColor: '#ff5722' }
    ];

    // ── AI MODEL LOADER ───────────────────────────────────────
    async function loadAIModel() {
        if (aiReady || aiLoading) return;
        aiLoading = true;
        setAIStatus('loading');

        try {
            // Check if TensorFlow libraries are available
            if (typeof tf === 'undefined' || typeof knnClassifier === 'undefined' || typeof mobilenet === 'undefined') {
                setAIStatus('unavailable');
                aiLoading = false;
                return;
            }

            // Fetch trained data from GitHub
            const res = await fetch(AI_MODEL_URL + '?t=' + Date.now());
            if (!res.ok) {
                setAIStatus('unavailable');
                aiLoading = false;
                return;
            }

            const data = await res.json();
            if (!data || Object.keys(data).length === 0) {
                setAIStatus('unavailable');
                aiLoading = false;
                return;
            }

            // Load MobileNet
            aiMobileNet = await mobilenet.load();

            // Load KNN classifier with saved data
            aiClassifier = knnClassifier.create();
            const tensorDataset = {};
            let totalSamples = 0;
            Object.keys(data).forEach(label => {
                const flat = data[label];
                const numSamples = Math.floor(flat.length / 1024);
                if (numSamples > 0) {
                    tensorDataset[label] = tf.tensor2d(flat, [numSamples, 1024]);
                    totalSamples += numSamples;
                }
            });
            aiClassifier.setClassifierDataset(tensorDataset);

            aiReady = true;
            aiLoading = false;
            setAIStatus('active', totalSamples);
        } catch (e) {
            console.warn('AI model load failed, using classic mode:', e);
            aiReady = false;
            aiLoading = false;
            setAIStatus('unavailable');
        }
    }

    function setAIStatus(state, samples) {
        const el = document.getElementById('csAIStatus');
        if (!el) return;
        if (state === 'loading') {
            el.innerText = '⏳ Loading AI model...';
            el.style.color = 'var(--pulp-amber)';
        } else if (state === 'active') {
            el.innerText = `🤖 AI Model Active (${samples} samples)`;
            el.style.color = 'var(--pulp-lime)';
        } else {
            el.innerText = '📊 Classic Mode';
            el.style.color = 'rgba(255,255,255,0.3)';
        }
    }

    // ── AI SCAN ───────────────────────────────────────────────
    async function detectStageAI(videoEl) {
        try {
            if (!aiReady || !aiClassifier || !aiMobileNet) return null;
            if (aiClassifier.getNumClasses() === 0) return null;

            const imgTensor = tf.browser.fromPixels(videoEl);
            const activation = aiMobileNet.infer(imgTensor, 'conv_preds');
            const result = await aiClassifier.predictClass(activation);
            imgTensor.dispose();
            activation.dispose();

            const labelVal = parseFloat(result.label);
            const confidence = result.confidences[result.label] || 0;

            // Find matching stage
            const stage = COLOUR_STAGES.find(s => s.value === labelVal)
                || COLOUR_STAGES.reduce((prev, curr) =>
                    Math.abs(curr.value - labelVal) < Math.abs(prev.value - labelVal) ? curr : prev
                );

            return { type: 'single', stage, confidence };
        } catch (e) {
            console.warn('AI scan failed, falling back to HSV:', e);
            return null;
        }
    }

    // ── CLASSIC HSV DETECTION (fallback) ─────────────────────
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

    // ── CAMERA HELPERS ────────────────────────────────────────
    function capturePhotoDataUrl() {
        const video = document.getElementById('csVideo');
        const canvas = document.getElementById('csCanvas');
        if (!video || !video.videoWidth) return null;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.9);
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
                video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
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

    // ── INIT ──────────────────────────────────────────────────
    function init() {
        multiScans = [];
        capturedPhotos = [];
        scanMode = 'single';
        const singleBtn = document.getElementById('csSingleBtn');
        const multiBtn = document.getElementById('csMultiBtn');
        if (singleBtn) singleBtn.classList.add('active');
        if (multiBtn) multiBtn.classList.remove('active');
        const batchBtn = document.getElementById('csBatchBtn');
        if (batchBtn) batchBtn.style.display = 'none';
        showView('cs-scanner');
        updateScanButton();
        renderMultiScans();

        // Load AI model silently in background
        loadAIModel();
    }

    function setScanMode(mode) {
        scanMode = mode;
        multiScans = [];
        capturedPhotos = [];
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

    // ── DO SCAN (AI first, HSV fallback) ──────────────────────
    async function doScan() {
        if (scanMode === 'multi' && multiScans.length >= MAX_SCANS) return;

        const btn = document.getElementById('csScanBtn');
        if (btn) {
            btn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Scanning...';
            btn.disabled = true;
        }

        const photoDataUrl = capturePhotoDataUrl();
        const video = document.getElementById('csVideo');
        let result = null;

        // Try AI first
        if (aiReady && video) {
            result = await detectStageAI(video);
        }

        // Fall back to classic HSV if AI not available or failed
        if (!result) {
            const rgb = sampleCameraColour();
            if (rgb) {
                result = detectStage(rgb.r, rgb.g, rgb.b);
            } else {
                const idx = Math.floor(Math.random() * COLOUR_STAGES.length);
                result = { type: 'single', stage: COLOUR_STAGES[idx] };
            }
        }

        if (btn) btn.disabled = false;

        if (scanMode === 'single') {
            capturedPhotos = [photoDataUrl];
            showSingleResult(result);
        } else {
            capturedPhotos.push(photoDataUrl);
            multiScans.push(result);
            renderMultiScans();
            updateScanButton();
            if (multiScans.length >= 1) {
                const batchBtn = document.getElementById('csBatchBtn');
                if (batchBtn) batchBtn.style.display = 'block';
            }
        }
    }

    // ── RESULT HELPERS ────────────────────────────────────────
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

    // ── SHOW SINGLE RESULT ────────────────────────────────────
    function showSingleResult(result) {
        stopCamera();
        const colour = getResultColour(result);
        const label = getResultLabel(result);
        const name = getResultName(result);
        const shelfLife = getResultShelfLife(result);
        const status = getResultStatus(result);
        const stageVal = result.type === 'single' ? result.stage.value : (result.lower.value + result.upper.value) / 2;
        const barWidth = Math.round((stageVal / 6) * 100);

        const swatch = document.getElementById('csSingleSwatch');
        if (swatch) { swatch.style.background = colour; swatch.style.boxShadow = `0 8px 30px ${colour}60`; }
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

        // Show photo preview
        const photoEl = document.getElementById('csSinglePhoto');
        if (photoEl && capturedPhotos[0]) {
            photoEl.src = capturedPhotos[0];
            photoEl.style.display = 'block';
            document.getElementById('csSinglePhotoPlaceholder').style.display = 'none';
        }

        // Show AI confidence if available
        const confidenceEl = document.getElementById('csAIConfidence');
        if (confidenceEl) {
            if (result.confidence !== undefined) {
                confidenceEl.innerText = `🤖 AI Confidence: ${Math.round(result.confidence * 100)}%`;
                confidenceEl.style.display = 'block';
            } else {
                confidenceEl.style.display = 'none';
            }
        }

        // Reset note
        const noteInput = document.getElementById('csNoteInput');
        if (noteInput) noteInput.value = '';
        updateNotePreview('');

        showView('cs-single-result');
    }

    // ── MULTI SCAN RENDER ─────────────────────────────────────
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

    // ── BATCH RESULT ──────────────────────────────────────────
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

        const batchSwatch = document.getElementById('csBatchSwatch');
        if (batchSwatch) { batchSwatch.style.background = colour; batchSwatch.style.boxShadow = `0 8px 30px ${colour}60`; }
        const batchLabel = document.getElementById('csBatchLabel');
        if (batchLabel) batchLabel.innerText = label;
        const batchShelf = document.getElementById('csBatchShelf');
        if (batchShelf) batchShelf.innerText = shelfLife;
        const batchStatus = document.getElementById('csBatchStatus');
        if (batchStatus) { batchStatus.innerText = status.label; batchStatus.style.color = status.color; }
        const batchCount = document.getElementById('csBatchCount');
        if (batchCount) batchCount.innerText = multiScans.length + ' of ' + MAX_SCANS;

        renderBatchPhotos();
        renderBatchBreakdown();

        const noteInput = document.getElementById('csBatchNoteInput');
        if (noteInput) noteInput.value = '';
        updateBatchNotePreview('');

        showView('cs-batch-result');
    }

    function renderBatchPhotos() {
        const container = document.getElementById('csBatchPhotoGrid');
        if (!container) return;
        container.innerHTML = multiScans.map((scan, i) => {
            const colour = getResultColour(scan);
            const label = getResultLabel(scan);
            const photo = capturedPhotos[i];
            return `
            <div style="flex:1; min-width:0; border-radius:16px; overflow:hidden; background:#111; position:relative; height:90px;">
                ${photo
                    ? `<img src="${photo}" style="width:100%; height:100%; object-fit:cover;">`
                    : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:1.5rem;">🍌</div>`
                }
                <div style="position:absolute; bottom:0; left:0; right:0; padding:4px 6px; background:rgba(0,0,0,0.7);">
                    <div style="font-size:0.45rem; font-weight:900; color:#fff; text-transform:uppercase; letter-spacing:1px;">Box ${i + 1}</div>
                    <div style="font-size:0.5rem; font-weight:900; color:${colour};">${label}</div>
                </div>
            </div>`;
        }).join('');
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

    // ── NOTE HELPERS ──────────────────────────────────────────
    function updateNotePreview(val) {
        const preview = document.getElementById('csNotePreview');
        const previewText = document.getElementById('csNotePreviewText');
        const charCount = document.getElementById('csNoteCharCount');
        if (charCount) charCount.innerText = val.length + ' / 120';
        if (preview && previewText) {
            if (val.trim().length > 0) {
                preview.classList.remove('hidden');
                previewText.innerText = val;
            } else {
                preview.classList.add('hidden');
            }
        }
    }

    function updateBatchNotePreview(val) {
        const preview = document.getElementById('csBatchNotePreview');
        const previewText = document.getElementById('csBatchNotePreviewText');
        const charCount = document.getElementById('csBatchNoteCharCount');
        if (charCount) charCount.innerText = val.length + ' / 120';
        if (preview && previewText) {
            if (val.trim().length > 0) {
                preview.classList.remove('hidden');
                previewText.innerText = val;
            } else {
                preview.classList.add('hidden');
            }
        }
    }

    function getNote(inputId) {
        const el = document.getElementById(inputId);
        return el ? el.value.trim() : '';
    }

    function getNow() {
        const now = new Date();
        return now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
            + ' · ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // ── SHARE / COPY ──────────────────────────────────────────
    async function shareReport() {
        const label = document.getElementById('csSingleLabel')?.innerText || '';
        const shelf = document.getElementById('csSingleShelf')?.innerText || '';
        const status = document.getElementById('csSingleStatus')?.innerText || '';
        const colour = document.getElementById('csSingleSwatch')?.style.background || '#78c830';
        const note = getNote('csNoteInput');
        const photo = capturedPhotos[0];

        const canvas = await generateReportCanvas({
            type: 'single', label, shelf, status, colour, note, photo,
            timestamp: getNow()
        });

        shareCanvas(canvas, 'pulp-pro-colour-scan.png');
    }

    async function shareBatchReport() {
        const label = document.getElementById('csBatchLabel')?.innerText || '';
        const shelf = document.getElementById('csBatchShelf')?.innerText || '';
        const status = document.getElementById('csBatchStatus')?.innerText || '';
        const colour = document.getElementById('csBatchSwatch')?.style.background || '#98c428';
        const note = getNote('csBatchNoteInput');
        const count = document.getElementById('csBatchCount')?.innerText || '';

        const canvas = await generateBatchReportCanvas({
            label, shelf, status, colour, note, count,
            scans: multiScans, photos: capturedPhotos,
            timestamp: getNow()
        });

        shareCanvas(canvas, 'pulp-pro-batch-scan.png');
    }

    async function generateReportCanvas({ type, label, shelf, status, colour, note, photo, timestamp }) {
        const W = 1080;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let H = 900;
        if (note) H += 80;
        canvas.width = W;
        canvas.height = H;

        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, W, H);

        if (photo) {
            const img = await loadImage(photo);
            ctx.save();
            roundRect(ctx, 40, 40, W - 80, 400, 40);
            ctx.clip();
            ctx.drawImage(img, 40, 40, W - 80, 400);
            ctx.restore();
            const grad = ctx.createLinearGradient(0, 300, 0, 440);
            grad.addColorStop(0, 'rgba(10,10,10,0)');
            grad.addColorStop(1, 'rgba(10,10,10,0.95)');
            ctx.fillStyle = grad;
            ctx.fillRect(40, 40, W - 80, 400);
        } else {
            ctx.fillStyle = 'rgba(22,22,24,0.98)';
            roundRect(ctx, 40, 40, W - 80, 400, 40);
            ctx.fill();
        }

        ctx.fillStyle = colour;
        roundRect(ctx, 60, 460, 100, 100, 20);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 52px -apple-system, sans-serif';
        ctx.fillText(label, 180, 520);

        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        roundRect(ctx, 60, 580, W - 120, 12, 6);
        ctx.fill();

        const rows = [
            ['Shelf Life', shelf],
            ['Status', status],
            ['Date', timestamp]
        ];
        let y = 620;
        rows.forEach(([key, val]) => {
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.font = '600 28px -apple-system, sans-serif';
            ctx.fillText(key.toUpperCase(), 60, y);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px -apple-system, sans-serif';
            ctx.fillText(val, 400, y);
            y += 50;
        });

        if (note) {
            ctx.fillStyle = 'rgba(166,226,46,0.1)';
            roundRect(ctx, 60, y + 10, W - 120, 60, 16);
            ctx.fill();
            ctx.fillStyle = '#a6e22e';
            ctx.font = '600 24px -apple-system, sans-serif';
            ctx.fillText('NOTE: ' + note, 80, y + 48);
            y += 80;
        }

        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(0, H - 80, W, 80);
        ctx.fillStyle = '#a6e22e';
        ctx.font = 'bold 30px -apple-system, sans-serif';
        ctx.fillText('PULP PRO', 60, H - 38);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '400 24px -apple-system, sans-serif';
        ctx.fillText('pulppro.github.io/Pulp-Pro-Intelligence', W - 580, H - 38);

        return canvas;
    }

    async function generateBatchReportCanvas({ label, shelf, status, colour, note, count, scans, photos, timestamp }) {
        const W = 1080;
        const photoH = 220;
        let H = 200 + (scans.length * (photoH + 120)) + 300;
        if (note) H += 80;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = '#a6e22e';
        ctx.font = 'bold 36px -apple-system, sans-serif';
        ctx.fillText('BATCH COLOUR SCAN', 60, 70);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '400 26px -apple-system, sans-serif';
        ctx.fillText(timestamp, 60, 110);

        let y = 150;

        for (let i = 0; i < scans.length; i++) {
            const scan = scans[i];
            const photo = photos[i];
            const c = getResultColour(scan);
            const lbl = getResultLabel(scan);
            const sh = getResultShelfLife(scan);

            ctx.fillStyle = 'rgba(22,22,24,0.98)';
            roundRect(ctx, 40, y, W - 80, photoH + 100, 30);
            ctx.fill();

            if (photo) {
                const img = await loadImage(photo);
                ctx.save();
                roundRect(ctx, 40, y, W - 80, photoH, 30);
                ctx.clip();
                ctx.drawImage(img, 40, y, W - 80, photoH);
                ctx.restore();
                const grad = ctx.createLinearGradient(0, y + photoH - 80, 0, y + photoH);
                grad.addColorStop(0, 'rgba(22,22,24,0)');
                grad.addColorStop(1, 'rgba(22,22,24,0.95)');
                ctx.fillStyle = grad;
                ctx.fillRect(40, y, W - 80, photoH);
            }

            ctx.fillStyle = c;
            roundRect(ctx, 60, y + photoH + 15, 70, 70, 14);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 36px -apple-system, sans-serif';
            ctx.fillText(`Box ${i + 1} — ${lbl}`, 150, y + photoH + 50);
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = '400 26px -apple-system, sans-serif';
            ctx.fillText(`Shelf Life: ${sh}`, 150, y + photoH + 85);

            y += photoH + 120;
        }

        ctx.fillStyle = 'rgba(166,226,46,0.2)';
        ctx.fillRect(40, y, W - 80, 2);
        y += 20;

        ctx.fillStyle = '#a6e22e';
        ctx.font = 'bold 28px -apple-system, sans-serif';
        ctx.fillText('BATCH AVERAGE', 60, y + 40);

        ctx.fillStyle = colour;
        roundRect(ctx, 60, y + 60, 80, 80, 16);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px -apple-system, sans-serif';
        ctx.fillText(label, 160, y + 110);

        const batchRows = [
            ['Boxes Scanned', count],
            ['Shelf Life', shelf],
            ['Status', status]
        ];
        let by = y + 170;
        batchRows.forEach(([key, val]) => {
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.font = '600 26px -apple-system, sans-serif';
            ctx.fillText(key.toUpperCase(), 60, by);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 26px -apple-system, sans-serif';
            ctx.fillText(val, 380, by);
            by += 46;
        });

        if (note) {
            ctx.fillStyle = 'rgba(166,226,46,0.1)';
            roundRect(ctx, 60, by + 10, W - 120, 60, 16);
            ctx.fill();
            ctx.fillStyle = '#a6e22e';
            ctx.font = '600 24px -apple-system, sans-serif';
            ctx.fillText('NOTE: ' + note, 80, by + 48);
            by += 80;
        }

        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(0, H - 80, W, 80);
        ctx.fillStyle = '#a6e22e';
        ctx.font = 'bold 30px -apple-system, sans-serif';
        ctx.fillText('PULP PRO', 60, H - 38);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '400 24px -apple-system, sans-serif';
        ctx.fillText('pulppro.github.io/Pulp-Pro-Intelligence', W - 580, H - 38);

        return canvas;
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    async function shareCanvas(canvas, filename) {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const file = new File([blob], filename, { type: 'image/png' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: 'Pulp Pro Colour Scan' });
        } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    function copySingleResult() {
        const label = document.getElementById('csSingleLabel')?.innerText || '';
        const shelf = document.getElementById('csSingleShelf')?.innerText || '';
        const status = document.getElementById('csSingleStatus')?.innerText || '';
        const note = getNote('csNoteInput');
        const appUrl = 'https://pulppro.github.io/Pulp-Pro-Intelligence/';
        let text = `Pulp Pro Intelligence: ${appUrl}\n━━━━━━━━━━━━━━━━━━━━\nBANANA COLOUR SCAN\n${label}\nShelf Life: ${shelf}\nStatus: ${status}`;
        if (note) text += `\nNote: ${note}`;
        navigator.clipboard.writeText(text).then(() => showCopyFeedback('csCopySingle'));
    }

    function copyBatchResult() {
        const label = document.getElementById('csBatchLabel')?.innerText || '';
        const shelf = document.getElementById('csBatchShelf')?.innerText || '';
        const status = document.getElementById('csBatchStatus')?.innerText || '';
        const count = document.getElementById('csBatchCount')?.innerText || '';
        const note = getNote('csBatchNoteInput');
        const appUrl = 'https://pulppro.github.io/Pulp-Pro-Intelligence/';
        const breakdownItems = multiScans.map((s, i) => `Box ${i + 1}: ${getResultLabel(s)}`).join('\n');
        let text = `Pulp Pro Intelligence: ${appUrl}\n━━━━━━━━━━━━━━━━━━━━\nBANANA BATCH COLOUR SCAN\nBatch Average: ${label}\nBoxes Scanned: ${count}\nShelf Life: ${shelf}\nStatus: ${status}\n━━━━━━━━━━━━━━━━━━━━\n${breakdownItems}`;
        if (note) text += `\nNote: ${note}`;
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
        capturedPhotos = [];
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
        shareReport,
        shareBatchReport,
        copySingleResult,
        copyBatchResult,
        updateNotePreview,
        updateBatchNotePreview,
        resetScanner,
        close
    };
})();
