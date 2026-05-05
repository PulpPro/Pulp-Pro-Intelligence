// Defect Detector Module

const DefectDetector = (() => {
    let activeModel = null;
    let cameraStream = null;
    let isDetecting = false;

    const models = {
        banana: { name: 'Banana Defects', projectName: 'banana-defects', version: 1 },
        mango:  { name: 'Mango Defect',   projectName: 'mango-defect',   version: 1 },
        avocado:{ name: 'Avocado Defect', projectName: 'avocado-defect-detection', version: 1 }
    };

    function init() {
        console.log('Defect Detector ready');
    }

    async function open(fruitType) {
        activeModel = models[fruitType] || null;
        const view = document.getElementById('defect-scanner-view');
        if (view) view.classList.remove('hidden');
        await startCamera();
    }

    function close() {
        const view = document.getElementById('defect-scanner-view');
        if (view) view.classList.add('hidden');
        stopCamera();
    }

    async function startCamera() {
        try {
            const video = document.getElementById('defectCameraFeed');
            if (!video) return;
            if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            video.srcObject = cameraStream;
            video.play();
        } catch (err) {
            showError('Camera access denied. Please enable camera permissions.');
        }
    }

    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(t => t.stop());
            cameraStream = null;
        }
        isDetecting = false;
    }

    function showError(message) {
        const box = document.getElementById('defectResults');
        if (box) box.innerHTML = `<div style="padding:20px; color:var(--pulp-red); text-align:center;">${message}</div>`;
    }

    return { init, open, close, startCamera, stopCamera };
})();

// Navigation helpers for defect hub
function startDefectScan(fruit) {
    const fruitNames = { banana: 'Banana', mango: 'Mango', avocado: 'Avocado' };
    document.getElementById('defectScannerTitle').innerText = 'Scan ' + fruitNames[fruit];
    document.getElementById('defect-hub').classList.add('hidden');
    document.getElementById('defect-scanner-view').classList.remove('hidden');
    DefectDetector.open(fruit);
}

function backToDefectHub() {
    document.getElementById('defect-scanner-view').classList.add('hidden');
    document.getElementById('defect-hub').classList.remove('hidden');
    DefectDetector.close();
}

document.addEventListener('DOMContentLoaded', () => {
    DefectDetector.init();
});
