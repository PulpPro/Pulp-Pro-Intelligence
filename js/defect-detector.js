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
        const started = await startCamera();
        if (started) {
            isDetecting = true;
            detectLoop();
        }
    }

    function close() {
        stopCamera();
    }

    async function startCamera() {
        try {
            const video = getVideo();
            if (!video) {
                showError('Camera element not found.');
                return false;
            }
            if (cameraStream) {
                cameraStream.getTracks().forEach(t => t.stop());
            }
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            video.srcObject = cameraStream;
            await video.play();
            console.log('Camera started');
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

    function getVideo() {
        return document.getElementById('defectCameraFeed');
    }

    function getCanvas() {
        return document.getElementById('defectCanvas');
    }

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

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            return await response.json();
        } catch (err) {
            console.error('Detection failed:', err);
            showError('Detection failed. Please try again.');
            return null;
        }
    }

    async function detectLoop() {
        if (!isDetecting) return;

        const now = Date.now();
        if (now - lastDetectionTime >= DETECTION_INTERVAL) {
            lastDetectionTime = now;
            const frameData = captureFrame();
            if (frameData) {
                const result = await detectDefect(frameData);
                if (result) displayResults(result);
            }
        }

        requestAnimationFrame(detectLoop);
    }

    function displayResults(detectionResult) {
        const resultsBox = document.getElementById('defectResults');
        if (!resultsBox) return;

        if (!detectionResult.predictions || detectionResult.predictions.length === 0) {
            resultsBox.innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-dim);">No defects detected</div>';
            return;
        }

        let html = '<div style="padding:15px;">';
        html += `<div style="font-weight:900; color:var(--pulp-lime); margin-bottom:15px;">DEFECTS FOUND: ${detectionResult.predictions.length}</div>`;

        detectionResult.predictions.forEach((prediction, index) => {
            const confidence = Math.round(prediction.confidence * 100);
            html += `
                <div style="margin-bottom:12px; padding:10px; background:rgba(255,77,77,0.1); border-radius:8px; border-left:3px solid var(--pulp-red);">
                    <div style="font-weight:700; color:var(--text-main);">Defect ${index + 1}</div>
                    <div style="font-size:0.9rem; color:var(--text-dim); margin-top:5px;">
                        Class: <span style="color:var(--pulp-amber);">${prediction.class}</span>
                    </div>
                    <div style="font-size:0.9rem; color:var(--text-dim);">
                        Confidence: <span style="color:var(--pulp-lime);">${confidence}%</span>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        resultsBox.innerHTML = html;
    }

    function showError(message) {
        const resultsBox = document.getElementById('defectResults');
        if (resultsBox) {
            resultsBox.innerHTML = `<div style="padding:20px; color:var(--pulp-red); text-align:center;">${message}</div>`;
        }
    }

    return { init, open, close };
})();

document.addEventListener('DOMContentLoaded', () => {
    DefectDetector.init();
});
