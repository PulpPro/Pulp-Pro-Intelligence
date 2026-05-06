// Defect Detector Module
const DefectDetector = (() => {
    let activeModel = null;
    let cameraStream = null;
    let videoElement = null;
    let canvasElement = null;
    let isDetecting = false;
    let detectionInterval = null;

    const API_KEY = '9xIqfcEBoTfMaxCPncH5';

    const models = {
        banana: {
            name: 'Banana Defects',
            projectName: 'banana-defects',
            version: 1
        },
        mango: {
            name: 'Mango Defect',
            projectName: 'mango-defect',
            version: 1
        },
        avocado: {
            name: 'Avocado Defect Detection',
            projectName: 'avocado-defect-detection',
            version: 1
        }
    };

    function init() {
        videoElement = document.getElementById('defectCameraFeed');
        canvasElement = document.getElementById('defectCanvas');
    }

    async function open(fruitType) {
        if (!models[fruitType]) return;
        activeModel = models[fruitType];
        showStatus('Starting camera...');
        const started = await startCamera();
        if (started) {
            showStatus('Point camera at fruit and press Scan.');
        }
    }

    async function startCamera() {
        try {
            if (cameraStream) {
                cameraStream.getTracks().forEach(t => t.stop());
            }
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            videoElement.srcObject = cameraStream;
            await videoElement.play();
            return true;
        } catch (err) {
            showError('Camera access denied. Please enable camera permissions.');
            return false;
        }
    }

    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(t => t.stop());
            cameraStream = null;
        }
        if (detectionInterval) {
            clearInterval(detectionInterval);
            detectionInterval = null;
        }
        isDetecting = false;
    }

    function captureFrame() {
        if (!videoElement || !canvasElement) return null;
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        canvasElement.getContext('2d').drawImage(videoElement, 0, 0);
        return canvasElement.toDataURL('image/jpeg', 0.8);
    }

    async function runScan() {
        if (!activeModel) return;
        showStatus('Scanning...');

        const frameData = captureFrame();
        if (!frameData) {
            showError('Could not capture frame. Try again.');
            return;
        }

        try {
            const base64Image = frameData.split(',')[1];
            const url = `https://detect.roboflow.com/${activeModel.projectName}/${activeModel.version}?api_key=${API_KEY}&confidence=40&overlap=30`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: base64Image
            });

            if (!response.ok) throw new Error('API error: ' + response.status);

            const result = await response.json();
            displayResults(result);
        } catch (err) {
            showError('Scan failed: ' + err.message);
        }
    }

    function startDetection() {
        if (detectionInterval) clearInterval(detectionInterval);
        runScan();
        detectionInterval = setInterval(runScan, 4000);
    }

    function displayResults(result) {
        const resultsBox = document.getElementById('defectResults');

        if (!result.predictions || result.predictions.length === 0) {
            resultsBox.innerHTML = `
                <div style="padding:20px; text-align:center; color:var(--pulp-lime); font-weight:900; text-transform:uppercase; letter-spacing:2px;">
                    ✅ No Defects Detected
                </div>`;
            return;
        }

        let html = `<div style="padding:15px;">
            <div style="font-weight:900; color:var(--pulp-red); margin-bottom:15px; text-transform:uppercase; letter-spacing:2px;">
                ⚠️ ${result.predictions.length} Defect(s) Found
            </div>`;

        result.predictions.forEach((p, i) => {
            const confidence = Math.round(p.confidence * 100);
            html += `
                <div style="margin-bottom:12px; padding:12px; background:rgba(255,77,77,0.1); border-radius:12px; border-left:3px solid var(--pulp-red);">
                    <div style="font-weight:800; color:var(--text-main); text-transform:uppercase;">Defect ${i + 1}</div>
                    <div style="font-size:0.85rem; color:var(--text-dim); margin-top:4px;">
                        Type: <span style="color:var(--pulp-amber); font-weight:700;">${p.class}</span>
                    </div>
                    <div style="font-size:0.85rem; color:var(--text-dim);">
                        Confidence: <span style="color:var(--pulp-lime); font-weight:700;">${confidence}%</span>
                    </div>
                </div>`;
        });

        html += '</div>';
        resultsBox.innerHTML = html;
    }

    function showStatus(msg) {
        document.getElementById('defectResults').innerHTML = `
            <div style="padding:20px; text-align:center; opacity:0.6; font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:2px;">
                ${msg}
            </div>`;
    }

    function showError(msg) {
        document.getElementById('defectResults').innerHTML = `
            <div style="padding:20px; text-align:center; color:var(--pulp-red); font-weight:700; text-transform:uppercase; letter-spacing:1px;">
                ⚠️ ${msg}
            </div>`;
    }

    function close() {
        stopCamera();
        const view = document.getElementById('defectDetectorView');
        if (view) view.classList.add('hidden');
    }

    return { init, open, close, startCamera, stopCamera, startDetection, runScan };
})();

document.addEventListener('DOMContentLoaded', () => {
    DefectDetector.init();
});
