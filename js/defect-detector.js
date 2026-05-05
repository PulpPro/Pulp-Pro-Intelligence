// Defect Detector Module
// Handles camera access, model loading, and defect detection for Banana, Mango, and Avocado

const DefectDetector = (() => {
    let activeModel = null;
    let cameraStream = null;
    let videoElement = null;
    let canvasElement = null;
    let isDetecting = false;

    // Roboflow Model Configuration
    const models = {
        banana: {
            name: 'Banana Defects',
            projectId: 'vc-dswyr',
            projectName: 'banana-defects',
            version: 1,
            apiKey: '' // Will be set when needed
        },
        mango: {
            name: 'Mango Defect',
            projectId: 'akshathaprabhu-ryh3y',
            projectName: 'mango-defect',
            version: 1,
            apiKey: ''
        },
        avocado: {
            name: 'Avocado Defect Detection',
            projectId: 'neurantechno-1yd1n',
            projectName: 'avocado-defect-detection',
            version: 1,
            apiKey: ''
        }
    };

    // Initialize defect detector
    function init() {
        console.log('Defect Detector Module initialized');
        setupUIElements();
    }

    // Setup UI elements
    function setupUIElements() {
        videoElement = document.getElementById('defectCameraFeed');
        canvasElement = document.getElementById('defectCanvas');
    }

    // Load model for specific fruit
    async function loadModel(fruitType) {
        if (!models[fruitType]) {
            console.error('Invalid fruit type:', fruitType);
            return false;
        }

        try {
            activeModel = models[fruitType];
            console.log(`Loading model for ${activeModel.name}...`);
            return true;
        } catch (err) {
            console.error('Model loading failed:', err);
            return false;
        }
    }

    // Start camera stream
    async function startCamera() {
        try {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }

            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = cameraStream;
            videoElement.play();
            console.log('Camera started successfully');
            return true;
        } catch (err) {
            console.error('Camera access failed:', err);
            showError('Camera access denied. Please enable camera permissions.');
            return false;
        }
    }

    // Stop camera stream
    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
        }
        isDetecting = false;
    }

    // Capture frame from video
    function captureFrame() {
        if (!videoElement) return null;

        const context = canvasElement.getContext('2d');
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        context.drawImage(videoElement, 0, 0);
        return canvasElement.toDataURL('image/jpeg');
    }

    // Send frame to Roboflow API for detection
    async function detectDefect(frameData) {
        if (!activeModel) {
            console.error('No model loaded');
            return null;
        }

        try {
            const url = `https://detect.roboflow.com/${activeModel.projectName}/${activeModel.version}`;
            
            const formData = new FormData();
            formData.append('image', frameData.split(',')[1]); // Remove data URL prefix
            formData.append('api_key', activeModel.apiKey || 'rf_demo_key');
            formData.append('confidence', 40);
            formData.append('overlap', 30);

            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusCode}`);
            }

            const result = await response.json();
            return result;
        } catch (err) {
            console.error('Detection failed:', err);
            showError('Detection failed. Please try again.');
            return null;
        }
    }

    // Start continuous detection
    function startDetection() {
        isDetecting = true;
        detectLoop();
    }

    // Detection loop
    async function detectLoop() {
        if (!isDetecting) return;

        const frameData = captureFrame();
        if (frameData) {
            const result = await detectDefect(frameData);
            if (result) {
                displayResults(result);
            }
        }

        requestAnimationFrame(detectLoop);
    }

    // Display detection results
    function displayResults(detectionResult) {
        const resultsBox = document.getElementById('defectResults');
        
        if (!detectionResult.predictions || detectionResult.predictions.length === 0) {
            resultsBox.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-dim);">No defects detected</div>';
            return;
        }

        let html = '<div style="padding: 15px;">';
        html += `<div style="font-weight: 900; color: var(--pulp-lime); margin-bottom: 15px;">DEFECTS FOUND: ${detectionResult.predictions.length}</div>`;

        detectionResult.predictions.forEach((prediction, index) => {
            const confidence = Math.round(prediction.confidence * 100);
            html += `
                <div style="margin-bottom: 12px; padding: 10px; background: rgba(255, 77, 77, 0.1); border-radius: 8px; border-left: 3px solid var(--pulp-red);">
                    <div style="font-weight: 700; color: var(--text-main);">Defect ${index + 1}</div>
                    <div style="font-size: 0.9rem; color: var(--text-dim); margin-top: 5px;">
                        Class: <span style="color: var(--pulp-amber);">${prediction.class}</span>
                    </div>
                    <div style="font-size: 0.9rem; color: var(--text-dim);">
                        Confidence: <span style="color: var(--pulp-lime);">${confidence}%</span>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        resultsBox.innerHTML = html;
    }

    // Show error message
    function showError(message) {
        const resultsBox = document.getElementById('defectResults');
        resultsBox.innerHTML = `<div style="padding: 20px; color: var(--pulp-red); text-align: center;">${message}</div>`;
    }

    // Open defect detector
    async function open(fruitType) {
        const view = document.getElementById('defectDetectorView');
        if (!view) {
            console.error('Defect detector view not found');
            return;
        }

        view.classList.remove('hidden');
        
        const loaded = await loadModel(fruitType);
        if (!loaded) {
            showError('Failed to load model');
            return;
        }

        const cameraStarted = await startCamera();
        if (cameraStarted) {
            startDetection();
        }
    }

    // Close defect detector
    function close() {
        const view = document.getElementById('defectDetectorView');
        if (view) {
            view.classList.add('hidden');
        }
        stopCamera();
    }

    // Public API
    return {
        init,
        open,
        close,
        startCamera,
        stopCamera,
        startDetection
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    DefectDetector.init();
});
