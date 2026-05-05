// Defect Detector Module
const DefectDetector = (() => {
    let activeModel = null;
    let cameraStream = null;
    let isDetecting = false;
    let lastDetectionTime = 0;
    const DETECTION_INTERVAL = 2000;

    const models = {
        banana: {
            name: 'Banana Defects',
            projectName: 'banana-defects',
            version: 1,
            apiKey: '9xIqfcEBoTfMaxCPncH5'
        },
        mango: {
            name: 'Mango Defect',
            projectName: 'mango-defect',
            version: 1,
            apiKey: '9xIqfcEBoTfMaxCPncH5'
        },
        avocado: {
            name: 'Avocado Defect Detection',
            projectName: 'avocado-defect-detection',
            version: 1,
            apiKey: '9xIqfcEBoTfMaxCPncH5'
        }
    };

    function init() {
        console.log('Defect Detector ready');
    }

    async function open(fruitType) {
        activeModel = models[fruitType] || null;
        if (!activeModel) {
            showError('Invalid fruit type.');
            return;
        }
        isDetecting = false;
        clearResults();
        setStatus('');
        await startCamera();
    }

    function close() {
        stopCamera();
        hideScanOverlay();
        clearResults();
        setStatus('');
    }

    async function startCamera() {
        try {
            const video = getVideo();
            if (!video) { showError('Camera element not found.'); return false; }
            if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            video.srcObject = cameraStream;
            await video.play();
            return true;
        } catch (err) {
            console.error('Camera error:', err);
            showError('Camera access denied. Please enable camera permissions.');
            return false;
        }
    }

    function stopCamera() {
        isDetecting = false;
        if (cameraStream) {
            cameraStream.getTracks().forEach(t => t.stop());
            cameraStream = null;
        }
        const video = getVideo();
        if (video) video.srcObject = null;
    }

    function getVideo()  { return document.getElementById('defectCameraFeed'); }
    function getCanvas() { return document.getElementById('defectCanvas'); }

    function captureFrame() {
        const video = getVideo();
        const canvas = getCanvas();
        if (!video || !canvas || video.videoWidth === 0) return null;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        return canvas.toDataURL('image/jpeg');
    }

    async function detectDefect(frameData) {
        if (!activeModel) return null;
        try {
            const url = `https://detect.roboflow.com/${activeModel.projectName}/${activeModel.version}`;
            const formData = new FormData();
            formData.append('image', frameData.split(',')[1]);
            formData.append('api_key', activeModel.apiKey);
            formData.append('confidence', 40);
            formData.append('overlap', 30);
            const response = await fetch(url, { method: 'POST', body: formData });
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            return await response.json();
        } catch (err) {
            console.error('Detection failed:', err);
            showError('Detection failed. Please try again.');
            return null;
        }
    }

    function showScanOverlay() {
        const overlay = document.getElementById('scanOverlay');
        if (overlay) overlay.style.display = 'block';
    }

    function hideScanOverlay() {
        const overlay = document.getElementById('scanOverlay');
        if (overlay) overlay.style.display = 'none';
    }

    function setStatus(msg) {
        const el = document.getElementById('scanStatus');
        if (el) el.innerText = msg;
    }

    function clearResults() {
        const el = document.getElementById('defectResults');
        if (el) el.innerHTML = '';
    }

    function displayResults(detectionResult) {
        const resultsBox = document.getElementById('defectResults');
        if (!resultsBox) return;

        if (!detectionResult.predictions || detectionResult.predictions.length === 0) {
            resultsBox.innerHTML = `
                <div style="padding:20px; text-align:center; background:rgba(166,226,46,0.05); border:1px solid var(--border-glass); border-radius:16px;">
                    <div style="font-size:1.5rem; margin-bottom:8px;">✅</div>
                    <div style="font-weight:900; color:var(--pulp-lime); letter-spacing:2px;">NO DEFECTS DETECTED</div>
                </div>`;
            return;
        }

        let html = `<div style="padding:15px; background:rgba(255,77,77,0.05); border:1px solid rgba(255,77,77,0.2); border-radius:16px;">`;
        html += `<div style="font-weight:900; color:var(--pulp-red); margin-bottom:15px; letter-spacing:2px;">⚠️ DEFECTS FOUND: ${detectionResult.predictions.length}</div>`;

        detectionResult.predictions.forEach((prediction, index) => {
            const confidence = Math.round(prediction.confidence * 100);
            html += `
                <div style="margin-bottom:12px; padding:12px; background:rgba(255,77,77,0.08); border-radius:10px; border-left:3px solid var(--pulp-red);">
                    <div style="font-weight:900; color:var(--text-main); font-size:0.85rem; letter-spacing:1px;">DEFECT ${index + 1}</div>
                    <div style="font-size:0.8rem; color:var(--text-dim); margin-top:6px;">
                        Type: <span style="color:var(--pulp-amber); font-weight:700;">${prediction.class}</span>
                    </div>
                    <div style="font-size:0.8rem; color:var(--text-dim);">
                        Confidence: <span style="color:var(--pulp-lime); font-weight:700;">${confidence}%</span>
                    </div>
                </div>`;
        });

        html += '</div>';
        resultsBox.innerHTML = html;
    }

    function showError(message) {
        const resultsBox = document.getElementById('defectResults');
        if (resultsBox) {
            resultsBox.innerHTML = `<div style="padding:20px; color:var(--pulp-red); text-align:center; border:1px solid rgba(255,77,77,0.2); border-radius:16px;">${message}</div>`;
        }
    }

    return { init, open, close };
})();

// Triggered by SCAN button
async function triggerScan() {
    const btn = document.getElementById('scanBtn');
    const overlay = document.getElementById('scanOverlay');

    // Show scanning state
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-camera"></i> SCANNING...';
    btn.style.opacity = '0.6';
    if (overlay) overlay.style.display = 'block';
    document.getElementById('scanStatus').innerText = 'ANALYSING...';
    document.getElementById('defectResults').innerHTML = '';

    // Capture and detect
    const video = document.getElementById('defectCameraFeed');
    const canvas = document.getElementById('defectCanvas');

    await new Promise(r => setTimeout(r, 1800)); // let scan animation play

    if (video && canvas && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const frameData = canvas.toDataURL('image/jpeg');

        const activeModel = DefectDetector._activeModel;

        // Call API directly
        try {
            const url = `https://detect.roboflow.com/${window._defectModel.projectName}/${window._defectModel.version}`;
            const formData = new FormData();
            formData.append('image', frameData.split(',')[1]);
            formData.append('api_key', window._defectModel.apiKey);
            formData.append('confidence', 40);
            formData.append('overlap', 30);

            const response = await fetch(url, { method: 'POST', body: formData });
            const result = await response.json();

            if (overlay) overlay.style.display = 'none';
            document.getElementById('scanStatus').innerText = 'SCAN COMPLETE';

            // Display results
            const resultsBox = document.getElementById('defectResults');
            if (!result.predictions || result.predictions.length === 0) {
                resultsBox.innerHTML = `
                    <div style="padding:20px; text-align:center; background:rgba(166,226,46,0.05); border:1px solid var(--border-glass); border-radius:16px;">
                        <div style="font-size:1.5rem; margin-bottom:8px;">✅</div>
                        <div style="font-weight:900; color:var(--pulp-lime); letter-spacing:2px;">NO DEFECTS DETECTED</div>
                    </div>`;
            } else {
                let html = `<div style="padding:15px; background:rgba(255,77,77,0.05); border:1px solid rgba(255,77,77,0.2); border-radius:16px;">`;
                html += `<div style="font-weight:900; color:var(--pulp-red); margin-bottom:15px; letter-spacing:2px;">⚠️ DEFECTS FOUND: ${result.predictions.length}</div>`;
                result.predictions.forEach((p, i) => {
                    const conf = Math.round(p.confidence * 100);
                    html += `
                        <div style="margin-bottom:12px; padding:12px; background:rgba(255,77,77,0.08); border-radius:10px; border-left:3px solid var(--pulp-red);">
                            <div style="font-weight:900; color:var(--text-main); font-size:0.85rem; letter-spacing:1px;">DEFECT ${i + 1}</div>
                            <div style="font-size:0.8rem; color:var(--text-dim); margin-top:6px;">Type: <span style="color:var(--pulp-amber); font-weight:700;">${p.class}</span></div>
                            <div style="font-size:0.8rem; color:var(--text-dim);">Confidence: <span style="color:var(--pulp-lime); font-weight:700;">${conf}%</span></div>
                        </div>`;
                });
                html += '</div>';
                resultsBox.innerHTML = html;
            }
        } catch (err) {
            if (overlay) overlay.style.display = 'none';
            document.getElementById('scanStatus').innerText = 'SCAN FAILED';
            document.getElementById('defectResults').innerHTML = `<div style="padding:20px; color:var(--pulp-red); text-align:center; border:1px solid rgba(255,77,77,0.2); border-radius:16px;">Detection failed. Please try again.</div>`;
        }
    }

    // Reset button
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-camera"></i> SCAN AGAIN';
    btn.style.opacity = '1';
}

document.addEventListener('DOMContentLoaded', () => {
    DefectDetector.init();
});
