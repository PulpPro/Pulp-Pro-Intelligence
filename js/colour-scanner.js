const ColourScanner = (() => {
    let cameraStream = null;
    let scanMode = 'single';
    let multiScans = [];
    let capturedPhotos = [];
    const MAX_SCANS = 3;

    const AI_MODEL_URL = 'https://raw.githubusercontent.com/PulpPro/banana-brain/main/scanner/banana_brain.json';
    let aiClassifier = null;
    let aiMobileNet = null;
    let aiReady = false;
    let aiLoading = false;

    // Keep blob refs alive so iOS doesn't GC them before share completes
    let _sharedBlobs = [];

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

    // ── AI ────────────────────────────────────────────────────
    async function loadAIModel() {
        if (aiReady || aiLoading) return;
        aiLoading = true; setAIStatus('loading');
        try {
            if (typeof tf === 'undefined' || typeof knnClassifier === 'undefined' || typeof mobilenet === 'undefined') {
                setAIStatus('unavailable'); aiLoading = false; return;
            }
            const res = await fetch(AI_MODEL_URL + '?t=' + Date.now());
            if (!res.ok) { setAIStatus('unavailable'); aiLoading = false; return; }
            const data = await res.json();
            if (!data || Object.keys(data).length === 0) { setAIStatus('unavailable'); aiLoading = false; return; }
            aiMobileNet = await mobilenet.load();
            aiClassifier = knnClassifier.create();
            const tensorDataset = {}; let totalSamples = 0;
            Object.keys(data).forEach(label => {
                const flat = data[label], numSamples = Math.floor(flat.length / 1024);
                if (numSamples > 0) { tensorDataset[label] = tf.tensor2d(flat, [numSamples, 1024]); totalSamples += numSamples; }
            });
            aiClassifier.setClassifierDataset(tensorDataset);
            aiReady = true; aiLoading = false; setAIStatus('active', totalSamples);
        } catch (e) { console.warn('AI model load failed:', e); aiReady = false; aiLoading = false; setAIStatus('unavailable'); }
    }

    function setAIStatus(state, samples) {
        const el = document.getElementById('csAIStatus'); if (!el) return;
        if (state === 'loading') { el.innerText = '⏳ Loading AI model...'; el.style.color = 'var(--pulp-amber)'; }
        else if (state === 'active') { el.innerText = `🤖 AI Model Active (${samples} samples)`; el.style.color = 'var(--pulp-lime)'; }
        else { el.innerText = '📊 Classic Mode'; el.style.color = 'rgba(255,255,255,0.3)'; }
    }

    async function detectStageAI(videoEl) {
        try {
            if (!aiReady || !aiClassifier || !aiMobileNet || aiClassifier.getNumClasses() === 0) return null;
            const imgTensor = tf.browser.fromPixels(videoEl);
            const activation = aiMobileNet.infer(imgTensor, 'conv_preds');
            const result = await aiClassifier.predictClass(activation);
            imgTensor.dispose(); activation.dispose();
            const labelVal = parseFloat(result.label);
            const confidence = result.confidences[result.label] || 0;
            const stage = COLOUR_STAGES.find(s => s.value === labelVal)
                || COLOUR_STAGES.reduce((p, c) => Math.abs(c.value-labelVal) < Math.abs(p.value-labelVal) ? c : p);
            return { type: 'single', stage, confidence };
        } catch (e) { console.warn('AI scan failed:', e); return null; }
    }

    // ── COLOUR DETECTION ──────────────────────────────────────
    function hexToRgb(hex) {
        return { r: parseInt(hex.slice(1,3),16), g: parseInt(hex.slice(3,5),16), b: parseInt(hex.slice(5,7),16) };
    }
    function colourDistance(rgb1, rgb2) {
        const rMean = (rgb1.r+rgb2.r)/2, dr=rgb1.r-rgb2.r, dg=rgb1.g-rgb2.g, db=rgb1.b-rgb2.b;
        return Math.sqrt((2+rMean/256)*dr*dr + 4*dg*dg + (2+(255-rMean)/256)*db*db);
    }
    function detectStage(r, g, b) {
        const distances = COLOUR_STAGES.map(stage => ({ stage, dist: colourDistance({r,g,b}, hexToRgb(stage.hex)) }));
        distances.sort((a,b) => a.dist - b.dist);
        const best = distances[0], second = distances[1];
        if (second.dist - best.dist < 20) {
            const lo = best.stage.value < second.stage.value ? best.stage : second.stage;
            const hi = best.stage.value < second.stage.value ? second.stage : best.stage;
            return { type: 'range', lower: lo, upper: hi };
        }
        return { type: 'single', stage: best.stage };
    }

    // ── CAMERA ────────────────────────────────────────────────
    function capturePhotoDataUrl() {
        const video = document.getElementById('csVideo'), canvas = document.getElementById('csCanvas');
        if (!video || !video.videoWidth) return null;
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.9);
    }
    function sampleCameraColour() {
        const video = document.getElementById('csVideo'), canvas = document.getElementById('csCanvas');
        if (!video || !video.videoWidth) return null;
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d'); ctx.drawImage(video, 0, 0);
        const cx = Math.floor(canvas.width/2), cy = Math.floor(canvas.height/2), size = 80;
        const data = ctx.getImageData(cx-size/2, cy-size/2, size, size).data;
        let r=0,g=0,b=0,count=0;
        for (let i=0;i<data.length;i+=4){r+=data[i];g+=data[i+1];b+=data[i+2];count++;}
        return { r:Math.round(r/count), g:Math.round(g/count), b:Math.round(b/count) };
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
                const caps = track.getCapabilities();
                if (caps.zoom) await track.applyConstraints({ advanced: [{ zoom: caps.zoom.min }] });
            }
            await video.play();
            const ph = document.getElementById('csPlaceholder'); if (ph) ph.style.display = 'none';
            video.style.display = 'block';
        } catch (err) {
            console.warn('Camera unavailable:', err);
            const ph = document.getElementById('csPlaceholder'); if (ph) ph.style.display = 'flex';
            const video = document.getElementById('csVideo'); if (video) video.style.display = 'none';
        }
    }
    function stopCamera() {
        if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
    }
    function showView(viewId) {
        ['cs-scanner','cs-single-result','cs-batch-result'].forEach(id => {
            const el = document.getElementById(id); if (el) el.classList.add('hidden');
        });
        const target = document.getElementById(viewId); if (target) target.classList.remove('hidden');
    }

    // ── INIT / MODE ───────────────────────────────────────────
    function init() {
        multiScans = []; capturedPhotos = []; scanMode = 'single';
        const sb = document.getElementById('csSingleBtn'), mb = document.getElementById('csMultiBtn');
        if (sb) sb.classList.add('active'); if (mb) mb.classList.remove('active');
        const bb = document.getElementById('csBatchBtn'); if (bb) bb.style.display = 'none';
        showView('cs-scanner'); updateScanButton(); renderMultiScans(); loadAIModel();
    }
    function setScanMode(mode) {
        scanMode = mode; multiScans = []; capturedPhotos = [];
        const sb = document.getElementById('csSingleBtn'), mb = document.getElementById('csMultiBtn');
        if (sb) sb.classList.toggle('active', mode === 'single');
        if (mb) mb.classList.toggle('active', mode === 'multi');
        const bb = document.getElementById('csBatchBtn'); if (bb) bb.style.display = 'none';
        showView('cs-scanner'); updateScanButton(); renderMultiScans(); startCamera();
    }
    function updateScanButton() {
        const btn = document.getElementById('csScanBtn'); if (!btn) return;
        if (scanMode === 'single') { btn.innerHTML = '<i class="bi bi-camera-fill"></i> Scan'; }
        else {
            const next = multiScans.length + 1;
            btn.innerHTML = next <= MAX_SCANS
                ? `<i class="bi bi-camera-fill"></i> Scan Box ${next}`
                : '<i class="bi bi-check-lg"></i> All Scanned';
        }
    }

    // ── SCAN ──────────────────────────────────────────────────
    async function doScan() {
        if (scanMode === 'multi' && multiScans.length >= MAX_SCANS) return;
        const btn = document.getElementById('csScanBtn');
        if (btn) { btn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Scanning...'; btn.disabled = true; }
        const photoDataUrl = capturePhotoDataUrl();
        const video = document.getElementById('csVideo');
        let result = null;
        if (aiReady && video) result = await detectStageAI(video);
        if (!result) {
            const rgb = sampleCameraColour();
            result = rgb ? detectStage(rgb.r, rgb.g, rgb.b) : { type:'single', stage: COLOUR_STAGES[Math.floor(Math.random()*COLOUR_STAGES.length)] };
        }
        if (btn) btn.disabled = false;
        if (scanMode === 'single') { capturedPhotos = [photoDataUrl]; showSingleResult(result); }
        else {
            capturedPhotos.push(photoDataUrl); multiScans.push(result);
            renderMultiScans(); updateScanButton();
            if (multiScans.length >= 1) { const b = document.getElementById('csBatchBtn'); if (b) b.style.display = 'block'; }
        }
    }

    // ── RESULT HELPERS ────────────────────────────────────────
    function getResultColour(result) {
        if (result.type === 'single') return result.stage.hex;
        const c1=hexToRgb(result.lower.hex), c2=hexToRgb(result.upper.hex);
        return `rgb(${Math.round((c1.r+c2.r)/2)},${Math.round((c1.g+c2.g)/2)},${Math.round((c1.b+c2.b)/2)})`;
    }
    function getResultLabel(result) {
        if (result.type === 'single') return `Color ${result.stage.value} — ${result.stage.name}`;
        const lo=Math.min(result.lower.value,result.upper.value), hi=Math.max(result.lower.value,result.upper.value);
        return `Color ${lo}/${hi}`;
    }
    function getResultName(result) {
        if (result.type === 'single') return result.stage.name;
        const lo=Math.min(result.lower.value,result.upper.value), hi=Math.max(result.lower.value,result.upper.value);
        return `${COLOUR_STAGES.find(s=>s.value===lo).name} / ${COLOUR_STAGES.find(s=>s.value===hi).name}`;
    }
    function getResultShelfLife(result) {
        if (result.type === 'single') return result.stage.shelfLife;
        return (result.lower.value > result.upper.value ? result.lower : result.upper).shelfLife;
    }
    function getResultStatus(result) {
        if (result.type === 'single') return { label: result.stage.status, color: result.stage.statusColor };
        const riper = result.lower.value > result.upper.value ? result.lower : result.upper;
        return { label: riper.status, color: riper.statusColor };
    }

    // ── SINGLE RESULT ─────────────────────────────────────────
    function showSingleResult(result) {
        stopCamera();
        const colour=getResultColour(result), label=getResultLabel(result), name=getResultName(result);
        const shelfLife=getResultShelfLife(result), status=getResultStatus(result);
        const stageVal = result.type==='single' ? result.stage.value : (result.lower.value+result.upper.value)/2;
        const barWidth = Math.round((stageVal/6)*100);
        const swatch=document.getElementById('csSingleSwatch');
        if(swatch){swatch.style.background=colour;swatch.style.boxShadow=`0 8px 30px ${colour}60`;}
        const labelEl=document.getElementById('csSingleLabel'); if(labelEl) labelEl.innerText=label;
        const nameEl=document.getElementById('csSingleName'); if(nameEl) nameEl.innerText=name;
        const bar=document.getElementById('csSingleBar'); if(bar){bar.style.width=barWidth+'%';bar.style.background=colour;}
        const shelfEl=document.getElementById('csSingleShelf'); if(shelfEl) shelfEl.innerText=shelfLife;
        const statusEl=document.getElementById('csSingleStatus'); if(statusEl){statusEl.innerText=status.label;statusEl.style.color=status.color;}
        const photoEl=document.getElementById('csSinglePhoto');
        if(photoEl&&capturedPhotos[0]){photoEl.src=capturedPhotos[0];photoEl.style.display='block';document.getElementById('csSinglePhotoPlaceholder').style.display='none';}
        const confidenceEl=document.getElementById('csAIConfidence');
        if(confidenceEl){
            if(result.confidence!==undefined){confidenceEl.innerText=`🤖 AI Confidence: ${Math.round(result.confidence*100)}%`;confidenceEl.style.display='block';}
            else confidenceEl.style.display='none';
        }
        const noteInput=document.getElementById('csNoteInput'); if(noteInput) noteInput.value='';
        updateNotePreview(''); showView('cs-single-result');
    }

    // ── MULTI SCAN ────────────────────────────────────────────
    function renderMultiScans() {
        const container=document.getElementById('csMultiList'); if(!container) return;
        let html='';
        for(let i=0;i<MAX_SCANS;i++){
            const scan=multiScans[i];
            if(scan){
                const colour=getResultColour(scan), label=getResultLabel(scan);
                html+=`<div class="cs-scan-row"><div class="cs-scan-dot" style="background:${colour};box-shadow:0 4px 12px ${colour}60;"></div><div class="cs-scan-info"><div class="cs-scan-lbl">Box ${i+1}</div><div class="cs-scan-val">${label}</div></div><i class="bi bi-check-circle-fill" style="color:var(--pulp-lime);font-size:1rem;flex-shrink:0;"></i></div>`;
            } else {
                html+=`<div class="cs-scan-row" style="border:1px dashed rgba(255,255,255,0.1);background:transparent;"><div class="cs-scan-dot" style="background:rgba(255,255,255,0.04);border:1px dashed rgba(255,255,255,0.15);"></div><div class="cs-scan-info"><div class="cs-scan-lbl" style="color:rgba(255,255,255,0.2);">Box ${i+1}</div><div class="cs-scan-val" style="color:rgba(255,255,255,0.18);font-size:0.68rem;font-weight:600;">Awaiting scan</div></div><i class="bi bi-circle" style="color:rgba(255,255,255,0.1);font-size:1rem;flex-shrink:0;"></i></div>`;
            }
        }
        container.innerHTML=html;
    }

    function getBatchResult() {
        if(multiScans.length===0) return; stopCamera();
        const avgValue=multiScans.reduce((sum,r)=>{
            return sum + (r.type==='single' ? r.stage.value : (r.lower.value+r.upper.value)/2);
        },0)/multiScans.length;
        const rounded=Math.round(avgValue*2)/2;
        const lower=COLOUR_STAGES.find(s=>s.value===rounded), above=COLOUR_STAGES.find(s=>s.value===rounded+0.5);
        let batchResult;
        if(Math.abs(avgValue-rounded)<0.15||!above) batchResult={type:'single',stage:lower||COLOUR_STAGES[COLOUR_STAGES.length-1]};
        else batchResult={type:'range',lower,upper:above};
        const colour=getResultColour(batchResult), label=getResultLabel(batchResult);
        const shelfLife=getResultShelfLife(batchResult), status=getResultStatus(batchResult);
        const batchSwatch=document.getElementById('csBatchSwatch');
        if(batchSwatch){batchSwatch.style.background=colour;batchSwatch.style.boxShadow=`0 8px 30px ${colour}60`;}
        const batchLabel=document.getElementById('csBatchLabel'); if(batchLabel) batchLabel.innerText=label;
        const batchShelf=document.getElementById('csBatchShelf'); if(batchShelf) batchShelf.innerText=shelfLife;
        const batchStatus=document.getElementById('csBatchStatus'); if(batchStatus){batchStatus.innerText=status.label;batchStatus.style.color=status.color;}
        const batchCount=document.getElementById('csBatchCount'); if(batchCount) batchCount.innerText=multiScans.length+' of '+MAX_SCANS;
        renderBatchPhotos(); renderBatchBreakdown();
        const noteInput=document.getElementById('csBatchNoteInput'); if(noteInput) noteInput.value='';
        updateBatchNotePreview(''); showView('cs-batch-result');
    }

    function renderBatchPhotos() {
        const container=document.getElementById('csBatchPhotoGrid'); if(!container) return;
        container.innerHTML=multiScans.map((scan,i)=>{
            const colour=getResultColour(scan), label=getResultLabel(scan), photo=capturedPhotos[i];
            return `<div style="flex:1;min-width:0;border-radius:16px;overflow:hidden;background:#111;position:relative;height:90px;">${photo?`<img src="${photo}" style="width:100%;height:100%;object-fit:cover;">`:`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;">🍌</div>`}<div style="position:absolute;bottom:0;left:0;right:0;padding:4px 6px;background:rgba(0,0,0,0.7);"><div style="font-size:0.45rem;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:1px;">Box ${i+1}</div><div style="font-size:0.5rem;font-weight:900;color:${colour};">${label}</div></div></div>`;
        }).join('');
    }

    function renderBatchBreakdown() {
        const container=document.getElementById('csBatchBreakdown'); if(!container) return;
        container.innerHTML=multiScans.map((scan,i)=>{
            const colour=getResultColour(scan), label=getResultLabel(scan);
            return `<div class="cs-scan-row"><div class="cs-scan-dot" style="background:${colour};box-shadow:0 4px 12px ${colour}60;"></div><div class="cs-scan-info"><div class="cs-scan-lbl">Box ${i+1}</div><div class="cs-scan-val">${label}</div></div></div>`;
        }).join('');
    }

    // ── NOTE HELPERS ──────────────────────────────────────────
    function updateNotePreview(val) {
        const preview=document.getElementById('csNotePreview'), previewText=document.getElementById('csNotePreviewText'), charCount=document.getElementById('csNoteCharCount');
        if(charCount) charCount.innerText=val.length+' / 120';
        if(preview&&previewText){val.trim().length>0?(preview.classList.remove('hidden'),previewText.innerText=val):preview.classList.add('hidden');}
    }
    function updateBatchNotePreview(val) {
        const preview=document.getElementById('csBatchNotePreview'), previewText=document.getElementById('csBatchNotePreviewText'), charCount=document.getElementById('csBatchNoteCharCount');
        if(charCount) charCount.innerText=val.length+' / 120';
        if(preview&&previewText){val.trim().length>0?(preview.classList.remove('hidden'),previewText.innerText=val):preview.classList.add('hidden');}
    }
    function getNote(inputId) { const el=document.getElementById(inputId); return el?el.value.trim():''; }
    function getNow() {
        const now=new Date();
        return now.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}).toUpperCase()+' · '+now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    }

    // ── CANVAS HELPERS ────────────────────────────────────────
    function roundRect(ctx,x,y,w,h,r){
        ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
        ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h);
        ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
    }
    function loadImage(src){
        return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=src;});
    }

    // Draw image with cover crop inside a rounded rect
    function drawImageCover(ctx, img, x, y, w, h, r) {
        if (!img) return;
        const scale = Math.max(w / img.width, h / img.height);
        const sw = img.width * scale, sh = img.height * scale;
        const sx = x + (w - sw) / 2, sy = y + (h - sh) / 2;
        ctx.save(); roundRect(ctx, x, y, w, h, r); ctx.clip();
        ctx.drawImage(img, sx, sy, sw, sh);
        ctx.restore();
    }

    // ── GENERATE SINGLE REPORT CANVAS ────────────────────────
    async function generateReportCanvas({label, shelf, status, colour, note, photo, timestamp}) {
        const W = 1080;
        let H = 1200; if (note) H += 80;
        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, W, H);

        // Header bar
        ctx.fillStyle = '#111111'; ctx.fillRect(0, 0, W, 90);
        ctx.fillStyle = '#a6e22e'; ctx.font = 'bold 28px -apple-system, sans-serif'; ctx.fillText('PULP PRO', 40, 52);
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '400 22px -apple-system, sans-serif'; ctx.fillText('Banana Colour Scan Report', 200, 52);
        ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '400 20px -apple-system, sans-serif';
        ctx.textAlign = 'right'; ctx.fillText(timestamp, W - 40, 52); ctx.textAlign = 'left';

        // Photo — full width, properly cropped
        const photoImg = photo ? await loadImage(photo) : null;
        if (photoImg) {
            drawImageCover(ctx, photoImg, 0, 90, W, 480, 0);
            // Gradient overlay
            const grad = ctx.createLinearGradient(0, 420, 0, 570);
            grad.addColorStop(0, 'rgba(10,10,10,0)');
            grad.addColorStop(1, 'rgba(10,10,10,0.97)');
            ctx.fillStyle = grad; ctx.fillRect(0, 90, W, 480);
        } else {
            ctx.fillStyle = '#111'; ctx.fillRect(0, 90, W, 480);
            ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.font = '400 26px -apple-system, sans-serif';
            ctx.textAlign = 'center'; ctx.fillText('No photo captured', W/2, 340); ctx.textAlign = 'left';
        }

        // Colour swatch over photo
        ctx.fillStyle = colour; roundRect(ctx, 40, 480, 110, 110, 22); ctx.fill();
        ctx.shadowColor = colour; ctx.shadowBlur = 30;
        ctx.fillStyle = colour; roundRect(ctx, 40, 480, 110, 110, 22); ctx.fill();
        ctx.shadowBlur = 0;

        // Stage label
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 56px -apple-system, sans-serif'; ctx.fillText(label, 175, 540);

        // Colour scale
        const scaleStages = [
            '#78c830','#86c82c','#98c428','#aec022','#c4bc1c','#d4b418',
            '#dca814','#e0a010','#d89010','#bc7414','#905818'
        ];
        const scaleY = 620, scaleH = 18, stepW = Math.floor((W-80) / scaleStages.length);
        scaleStages.forEach((hex, i) => {
            ctx.fillStyle = hex;
            roundRect(ctx, 40 + i*stepW, scaleY, stepW-4, scaleH, 4);
            ctx.fill();
            // Active marker
            if (hex === colour || (i === 5 && colour.includes('d4b418'))) {
                ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5;
                roundRect(ctx, 40 + i*stepW - 2, scaleY - 2, stepW, scaleH+4, 5);
                ctx.stroke();
            }
        });
        ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '400 18px -apple-system, sans-serif';
        ctx.fillText('1 · Full Green', 40, scaleY + scaleH + 22);
        ctx.textAlign = 'right'; ctx.fillText('6 · Full Brown', W-40, scaleY + scaleH + 22); ctx.textAlign = 'left';

        // Divider
        ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(40, 690, W-80, 1);

        // Data rows
        const rows = [
            ['Colour Stage', label],
            ['Shelf Life', shelf],
            ['Status', status],
        ];
        let y = 740;
        rows.forEach(([key, val]) => {
            ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '400 24px -apple-system, sans-serif'; ctx.fillText(key.toUpperCase(), 40, y);
            ctx.fillStyle = '#ffffff'; ctx.font = 'bold 26px -apple-system, sans-serif'; ctx.textAlign = 'right'; ctx.fillText(val, W-40, y); ctx.textAlign = 'left';
            ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(40, y+12, W-80, 1);
            y += 58;
        });

        // Note
        if (note) {
            ctx.fillStyle = 'rgba(166,226,46,0.08)'; roundRect(ctx, 40, y+10, W-80, 60, 14); ctx.fill();
            ctx.fillStyle = '#a6e22e'; ctx.font = '600 22px -apple-system, sans-serif'; ctx.fillText('NOTE: ' + note, 60, y+48); y += 80;
        }

        // Footer
        ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(0, H-70, W, 70);
        ctx.fillStyle = '#a6e22e'; ctx.font = 'bold 24px -apple-system, sans-serif'; ctx.fillText('PULP PRO INTELLIGENCE', 40, H-30);
        ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '400 20px -apple-system, sans-serif';
        ctx.textAlign = 'right'; ctx.fillText('pulp-pro-intelligence.pulpprobrain.workers.dev', W-40, H-30); ctx.textAlign = 'left';

        return canvas;
    }

    // ── GENERATE BATCH REPORT CANVAS ─────────────────────────
    async function generateBatchReportCanvas({label, shelf, status, colour, note, count, scans, photos, timestamp}) {
        const W = 1080;
        const PHOTO_H = 280; // each box photo height - reduced for better iMessage display
        const BOX_INFO_H = 120;
        const HEADER_H = 90;
        const AVG_H = 200;
        const SCALE_H = 80;
        const FOOTER_H = 70;
        const NOTE_H = note ? 80 : 0;
        let H = HEADER_H + (scans.length * (PHOTO_H + BOX_INFO_H + 20)) + AVG_H + SCALE_H + NOTE_H + FOOTER_H + 40;

        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, W, H);

        // Header
        ctx.fillStyle = '#111111'; ctx.fillRect(0, 0, W, HEADER_H);
        ctx.fillStyle = '#a6e22e'; ctx.font = 'bold 28px -apple-system, sans-serif'; ctx.fillText('PULP PRO', 40, 52);
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '400 22px -apple-system, sans-serif';
        ctx.fillText(`Batch Colour Scan · ${scans.length} Boxes`, 200, 52);
        ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '400 20px -apple-system, sans-serif';
        ctx.textAlign = 'right'; ctx.fillText(timestamp, W-40, 52); ctx.textAlign = 'left';

        // Each box
        let y = HEADER_H + 20;
        for (let i = 0; i < scans.length; i++) {
            const scan = scans[i], photo = photos[i];
            const c = getResultColour(scan), lbl = getResultLabel(scan), sh = getResultShelfLife(scan);
            const st = getResultStatus(scan);

            // Photo
            const photoImg = photo ? await loadImage(photo) : null;
            if (photoImg) {
                drawImageCover(ctx, photoImg, 40, y, W-80, PHOTO_H, 20);
                // Gradient at bottom
                const grad = ctx.createLinearGradient(0, y + PHOTO_H - 120, 0, y + PHOTO_H);
                grad.addColorStop(0, 'rgba(10,10,10,0)');
                grad.addColorStop(1, 'rgba(10,10,10,0.98)');
                ctx.fillStyle = grad; ctx.fillRect(40, y, W-80, PHOTO_H);
            } else {
                ctx.fillStyle = '#111'; roundRect(ctx, 40, y, W-80, PHOTO_H, 20); ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.font = '400 24px -apple-system, sans-serif';
                ctx.textAlign = 'center'; ctx.fillText('No photo — Box ' + (i+1), W/2, y + PHOTO_H/2); ctx.textAlign = 'left';
            }

            // Box label on photo
            ctx.fillStyle = 'rgba(0,0,0,0.7)'; roundRect(ctx, 60, y+20, 140, 44, 22); ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.font = 'bold 22px -apple-system, sans-serif'; ctx.fillText('BOX ' + (i+1), 78, y+47);

            // Info row below photo
            const infoY = y + PHOTO_H + 10;
            ctx.fillStyle = c; roundRect(ctx, 40, infoY, 80, 80, 16); ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.font = 'bold 32px -apple-system, sans-serif'; ctx.fillText(lbl, 140, infoY+40);
            ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '400 24px -apple-system, sans-serif'; ctx.fillText('Shelf Life: ' + sh + '  ·  ' + st.label, 140, infoY+72);

            ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(40, infoY + BOX_INFO_H, W-80, 1);
            y += PHOTO_H + BOX_INFO_H + 30;
        }

        // Batch average
        y += 10;
        ctx.fillStyle = 'rgba(166,226,46,0.06)'; roundRect(ctx, 40, y, W-80, AVG_H - 20, 20); ctx.fill();
        ctx.strokeStyle = 'rgba(166,226,46,0.15)'; ctx.lineWidth = 1; roundRect(ctx, 40, y, W-80, AVG_H - 20, 20); ctx.stroke();

        ctx.fillStyle = 'rgba(166,226,46,0.6)'; ctx.font = 'bold 22px -apple-system, sans-serif'; ctx.fillText('BATCH AVERAGE', 60, y+44);
        ctx.fillStyle = colour; roundRect(ctx, 60, y+60, 80, 80, 16); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 42px -apple-system, sans-serif'; ctx.fillText(label, 160, y+112);

        const avgRows = [['Boxes Scanned', count], ['Shelf Life', shelf], ['Status', status]];
        let ay = y + 152;
        avgRows.forEach(([k, v]) => {
            ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '400 22px -apple-system, sans-serif'; ctx.fillText(k.toUpperCase(), 60, ay);
            ctx.fillStyle = '#ffffff'; ctx.font = 'bold 24px -apple-system, sans-serif'; ctx.textAlign = 'right'; ctx.fillText(v, W-60, ay); ctx.textAlign = 'left';
            ay += 42;
        });
        y += AVG_H + 10;

        // Note
        if (note) {
            ctx.fillStyle = 'rgba(166,226,46,0.08)'; roundRect(ctx, 40, y, W-80, 60, 14); ctx.fill();
            ctx.fillStyle = '#a6e22e'; ctx.font = '600 22px -apple-system, sans-serif'; ctx.fillText('NOTE: ' + note, 60, y+38); y += 80;
        }

        // Footer
        ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(0, H-FOOTER_H, W, FOOTER_H);
        ctx.fillStyle = '#a6e22e'; ctx.font = 'bold 24px -apple-system, sans-serif'; ctx.fillText('PULP PRO INTELLIGENCE', 40, H-30);
        ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '400 20px -apple-system, sans-serif';
        ctx.textAlign = 'right'; ctx.fillText('pulp-pro-intelligence.pulpprobrain.workers.dev', W-40, H-30); ctx.textAlign = 'left';

        return canvas;
    }

    // ── SHARE ─────────────────────────────────────────────────
    async function shareCanvas(canvas, filename) {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const file = new File([blob], filename, { type: 'image/png' });

        // Keep blob alive — iOS GC kills it before share completes otherwise
        _sharedBlobs = [blob, file];

        try {
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: 'Pulp Pro Colour Scan' });
            } else {
                // Fallback: download
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = filename; a.click();
                setTimeout(() => URL.revokeObjectURL(url), 5000);
            }
        } catch (err) {
            // User cancelled or error — don't delete the result view
            console.log('Share cancelled or failed:', err);
        } finally {
            // Clear blob refs after 30s — enough time for any share to complete
            setTimeout(() => { _sharedBlobs = []; }, 30000);
        }
    }

    async function shareReport() {
        const btn = document.getElementById('csCopySingle') || document.querySelector('[onclick*="shareReport"]');
        const shareBtn = document.querySelector('[onclick*="shareReport()"]');
        if (shareBtn) { shareBtn.disabled = true; shareBtn.style.opacity = '0.5'; }
        try {
            const label = document.getElementById('csSingleLabel')?.innerText || '';
            const shelf = document.getElementById('csSingleShelf')?.innerText || '';
            const status = document.getElementById('csSingleStatus')?.innerText || '';
            const colour = document.getElementById('csSingleSwatch')?.style.background || '#78c830';
            const note = getNote('csNoteInput'), photo = capturedPhotos[0];
            const canvas = await generateReportCanvas({ label, shelf, status, colour, note, photo, timestamp: getNow() });
            await shareCanvas(canvas, 'pulp-pro-colour-scan.png');
        } finally {
            if (shareBtn) { shareBtn.disabled = false; shareBtn.style.opacity = ''; }
        }
    }

    async function shareBatchReport() {
        const shareBtn = document.querySelector('[onclick*="shareBatchReport()"]');
        if (shareBtn) { shareBtn.disabled = true; shareBtn.style.opacity = '0.5'; }
        try {
            const label = document.getElementById('csBatchLabel')?.innerText || '';
            const shelf = document.getElementById('csBatchShelf')?.innerText || '';
            const status = document.getElementById('csBatchStatus')?.innerText || '';
            const colour = document.getElementById('csBatchSwatch')?.style.background || '#98c428';
            const note = getNote('csBatchNoteInput');
            const count = document.getElementById('csBatchCount')?.innerText || '';
            const canvas = await generateBatchReportCanvas({ label, shelf, status, colour, note, count, scans: multiScans, photos: capturedPhotos, timestamp: getNow() });
            await shareCanvas(canvas, 'pulp-pro-batch-scan.png');
        } finally {
            if (shareBtn) { shareBtn.disabled = false; shareBtn.style.opacity = ''; }
        }
    }

    // ── COPY ──────────────────────────────────────────────────
    function copySingleResult() {
        const label = document.getElementById('csSingleLabel')?.innerText || '';
        const shelf = document.getElementById('csSingleShelf')?.innerText || '';
        const status = document.getElementById('csSingleStatus')?.innerText || '';
        const note = getNote('csNoteInput');
        let text = `Pulp Pro Intelligence\n━━━━━━━━━━━━━━━━━━━━\nBANANA COLOUR SCAN\n${label}\nShelf Life: ${shelf}\nStatus: ${status}`;
        if (note) text += `\nNote: ${note}`;
        navigator.clipboard.writeText(text).then(() => showCopyFeedback('csCopySingle'));
    }
    function copyBatchResult() {
        const label = document.getElementById('csBatchLabel')?.innerText || '';
        const shelf = document.getElementById('csBatchShelf')?.innerText || '';
        const status = document.getElementById('csBatchStatus')?.innerText || '';
        const count = document.getElementById('csBatchCount')?.innerText || '';
        const note = getNote('csBatchNoteInput');
        const breakdownItems = multiScans.map((s,i) => `Box ${i+1}: ${getResultLabel(s)}`).join('\n');
        let text = `Pulp Pro Intelligence\n━━━━━━━━━━━━━━━━━━━━\nBANANA BATCH COLOUR SCAN\nBatch Average: ${label}\nBoxes Scanned: ${count}\nShelf Life: ${shelf}\nStatus: ${status}\n━━━━━━━━━━━━━━━━━━━━\n${breakdownItems}`;
        if (note) text += `\nNote: ${note}`;
        navigator.clipboard.writeText(text).then(() => showCopyFeedback('csCopyBatch'));
    }
    function showCopyFeedback(btnId) {
        const btn = document.getElementById(btnId); if (!btn) return;
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-check-lg"></i> Copied!'; btn.style.background = 'var(--pulp-lime)'; btn.style.color = '#000';
        setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; btn.style.color = ''; }, 2000);
    }

    // ── RESET / CLOSE ─────────────────────────────────────────
    function resetScanner() {
        multiScans = []; capturedPhotos = [];
        const bb = document.getElementById('csBatchBtn'); if (bb) bb.style.display = 'none';
        showView('cs-scanner'); renderMultiScans(); updateScanButton(); startCamera();
    }
    function close() { stopCamera(); showHub(); }

    return { init, setScanMode, doScan, getBatchResult, shareReport, shareBatchReport, copySingleResult, copyBatchResult, updateNotePreview, updateBatchNotePreview, resetScanner, close };
})();
