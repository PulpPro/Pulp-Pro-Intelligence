const DefectDetector = (() => {
    let currentFruit = null;
    let currentType = null;
    let cameraStream = null;
    let isScanning = false;

    function init() {
        console.log('Defect Detector ready');
    }

    function selectFruit(fruit) {
        currentFruit = fruit;
        const fruitNames = { banana: 'Banana', mango: 'Mango', avocado: 'Avocado' };
        document.getElementById('defectTypeTitle').innerText = fruitNames[fruit] + ' — ' + t('selectType');
        document.getElementById('defectTypeDesc_external').innerText = t(fruit + 'ExtDesc');
        document.getElementById('defectTypeDesc_internal').innerText = t(fruit + 'IntDesc');
        showDefectView('defect-type-view');
    }

    async function selectType(type) {
        currentType = type;
        window.defectActiveFruit = currentFruit;
        window.defectActiveType = type;
        const fruitNames = { banana: 'Banana', mango: 'Mango', avocado: 'Avocado' };
        const typeLabel = type === 'external' ? t('external') : t('internal');
        document.getElementById('defectScanTitle').innerText = fruitNames[currentFruit] + ' — ' + typeLabel;
        showDefectView('defect-scan-view');
        updateDefectFavoriteUI();
        resetScanUI();
        await startCamera();
    }

    async function startCamera() {
        try {
            if (cameraStream) stopCamera();
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });
            const video = document.getElementById('defectVideo');
            video.srcObject = cameraStream;
            await video.play();
            document.getElementById('cameraPlaceholder').style.display = 'none';
            video.style.display = 'block';
        } catch (err) {
            console.warn('Camera unavailable:', err);
            document.getElementById('cameraPlaceholder').style.display = 'flex';
            document.getElementById('defectVideo').style.display = 'none';
        }
    }

    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(t => t.stop());
            cameraStream = null;
        }
        isScanning = false;
    }

    function captureFrame() {
        const video = document.getElementById('defectVideo');
        const canvas = document.getElementById('defectCanvas');
        if (!video || !video.videoWidth) return null;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        const regions = [
            { x: canvas.width * 0.25, y: canvas.height * 0.25, size: 60 },
            { x: canvas.width * 0.5,  y: canvas.height * 0.5,  size: 80 },
            { x: canvas.width * 0.75, y: canvas.height * 0.75, size: 60 },
            { x: canvas.width * 0.5,  y: canvas.height * 0.25, size: 60 },
            { x: canvas.width * 0.25, y: canvas.height * 0.75, size: 60 }
        ];

        const samples = regions.map(region => {
            const data = ctx.getImageData(
                region.x - region.size / 2,
                region.y - region.size / 2,
                region.size, region.size
            ).data;
            let r = 0, g = 0, b = 0, count = 0;
            for (let i = 0; i < data.length; i += 4) {
                r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
            }
            return {
                r: Math.round(r / count),
                g: Math.round(g / count),
                b: Math.round(b / count)
            };
        });

        const avgR = samples.reduce((s, c) => s + c.r, 0) / samples.length;
        const avgG = samples.reduce((s, c) => s + c.g, 0) / samples.length;
        const avgB = samples.reduce((s, c) => s + c.b, 0) / samples.length;

        const variance = samples.reduce((s, c) =>
            s + Math.pow(c.r - avgR, 2) + Math.pow(c.g - avgG, 2) + Math.pow(c.b - avgB, 2), 0
        ) / samples.length;

        return {
            r: Math.round(avgR),
            g: Math.round(avgG),
            b: Math.round(avgB),
            variance,
            samples
        };
    }

    function doScan() {
        if (isScanning) return;
        isScanning = true;

        const btn = document.getElementById('defectScanActionBtn');
        if (btn) {
            btn.innerHTML = '<i class="bi bi-arrow-repeat"></i> ' + t('scanning');
            btn.disabled = true;
        }

        setTimeout(() => {
            const frameData = captureFrame();
            let results;

            if (frameData) {
                results = analyseFrame(frameData);
            } else {
                results = getFallbackResults();
            }

            if (btn) {
                btn.innerHTML = '<i class="bi bi-camera-fill"></i> ' + t('scanAgain');
                btn.disabled = false;
            }

            isScanning = false;
            displayResults(results);
        }, 800);
    }

    function analyseFrame(frameData) {
        const defects = DEFECTS_DATA[currentFruit][currentType];
        const { r, g, b, variance } = frameData;

        const scored = defects.map(defect => {
            let score = 0;
            const signatures = getDefectSignature(defect.id);
            if (!signatures) return { defect, score: Math.random() * 0.3 };

            signatures.forEach(sig => {
                const dist = colourDistance({ r, g, b }, sig.rgb);
                const maxDist = 441;
                const match = 1 - (dist / maxDist);
                score += match * sig.weight;
                if (sig.requiresVariance && variance > sig.varianceThreshold) {
                    score += 0.2;
                }
            });

            score = Math.max(0, Math.min(1, score));
            return { defect, score };
        });

        scored.sort((a, b) => b.score - a.score);

        const top = scored[0];
        const confidence = Math.round(50 + top.score * 45);
        const possibilities = scored.slice(1, 4).filter(s => s.score > 0.2);

        return { primary: top.defect, confidence, possibilities };
    }

    function getDefectSignature(defectId) {
        const signatures = {
            'ban_ext_01': [{ rgb: { r: 60,  g: 40,  b: 20  }, weight: 0.8, requiresVariance: true,  varianceThreshold: 800  }],
            'ban_ext_02': [{ rgb: { r: 80,  g: 70,  b: 30  }, weight: 0.7, requiresVariance: true,  varianceThreshold: 1200 }],
            'ban_ext_03': [{ rgb: { r: 70,  g: 80,  b: 60  }, weight: 0.9, requiresVariance: false, varianceThreshold: 0    }],
            'ban_ext_04': [{ rgb: { r: 130, g: 140, b: 60  }, weight: 0.7, requiresVariance: false, varianceThreshold: 0    }],
            'ban_ext_05': [{ rgb: { r: 50,  g: 40,  b: 20  }, weight: 0.8, requiresVariance: true,  varianceThreshold: 1500 }],
            'ban_ext_06': [{ rgb: { r: 80,  g: 60,  b: 20  }, weight: 0.6, requiresVariance: false, varianceThreshold: 0    }],
            'ban_ext_07': [{ rgb: { r: 100, g: 90,  b: 60  }, weight: 0.6, requiresVariance: true,  varianceThreshold: 600  }],
            'ban_ext_08': [{ rgb: { r: 180, g: 170, b: 80  }, weight: 0.5, requiresVariance: false, varianceThreshold: 0    }],
            'ban_ext_09': [{ rgb: { r: 50,  g: 30,  b: 10  }, weight: 0.9, requiresVariance: false, varianceThreshold: 0    }],
            'ban_ext_10': [{ rgb: { r: 60,  g: 50,  b: 30  }, weight: 0.9, requiresVariance: true,  varianceThreshold: 1000 }],
            'ban_int_01': [{ rgb: { r: 140, g: 100, b: 60  }, weight: 0.8, requiresVariance: false, varianceThreshold: 0    }],
            'ban_int_02': [{ rgb: { r: 80,  g: 50,  b: 20  }, weight: 0.9, requiresVariance: true,  varianceThreshold: 800  }],
            'ban_int_03': [{ rgb: { r: 220, g: 210, b: 150 }, weight: 0.6, requiresVariance: false, varianceThreshold: 0    }],
            'ban_int_04': [{ rgb: { r: 120, g: 80,  b: 40  }, weight: 0.8, requiresVariance: false, varianceThreshold: 0    }],
            'ban_int_05': [{ rgb: { r: 160, g: 120, b: 40  }, weight: 0.7, requiresVariance: false, varianceThreshold: 0    }],
            'ban_int_06': [{ rgb: { r: 40,  g: 30,  b: 20  }, weight: 0.9, requiresVariance: true,  varianceThreshold: 2000 }],
            'ban_int_07': [{ rgb: { r: 200, g: 180, b: 100 }, weight: 0.5, requiresVariance: false, varianceThreshold: 0    }],
            'man_ext_01': [{ rgb: { r: 60,  g: 40,  b: 20  }, weight: 0.7, requiresVariance: true,  varianceThreshold: 600  }],
            'man_ext_02': [{ rgb: { r: 80,  g: 60,  b: 40  }, weight: 0.8, requiresVariance: true,  varianceThreshold: 1000 }],
            'man_ext_03': [{ rgb: { r: 30,  g: 30,  b: 30  }, weight: 0.9, requiresVariance: true,  varianceThreshold: 800  }],
            'man_ext_04': [{ rgb: { r: 40,  g: 20,  b: 10  }, weight: 0.9, requiresVariance: false, varianceThreshold: 0    }],
            'man_ext_05': [{ rgb: { r: 150, g: 130, b: 60  }, weight: 0.5, requiresVariance: false, varianceThreshold: 0    }],
            'man_ext_06': [{ rgb: { r: 50,  g: 35,  b: 15  }, weight: 0.8, requiresVariance: true,  varianceThreshold: 1200 }],
            'man_ext_07': [{ rgb: { r: 180, g: 140, b: 60  }, weight: 0.5, requiresVariance: false, varianceThreshold: 0    }],
            'man_ext_08': [{ rgb: { r: 70,  g: 50,  b: 30  }, weight: 0.7, requiresVariance: true,  varianceThreshold: 500  }],
            'man_ext_09': [{ rgb: { r: 220, g: 200, b: 140 }, weight: 0.6, requiresVariance: false, varianceThreshold: 0    }],
            'man_ext_10': [{ rgb: { r: 160, g: 120, b: 60  }, weight: 0.7, requiresVariance: true,  varianceThreshold: 700  }],
            'man_int_01': [{ rgb: { r: 30,  g: 20,  b: 10  }, weight: 0.9, requiresVariance: true,  varianceThreshold: 2000 }],
            'man_int_02': [{ rgb: { r: 120, g: 80,  b: 30  }, weight: 0.8, requiresVariance: false, varianceThreshold: 0    }],
            'man_int_03': [{ rgb: { r: 200, g: 180, b: 100 }, weight: 0.6, requiresVariance: false, varianceThreshold: 0    }],
            'man_int_04': [{ rgb: { r: 80,  g: 50,  b: 20  }, weight: 0.9, requiresVariance: true,  varianceThreshold: 1000 }],
            'man_int_05': [{ rgb: { r: 210, g: 170, b: 80  }, weight: 0.5, requiresVariance: false, varianceThreshold: 0    }],
            'man_int_06': [{ rgb: { r: 230, g: 190, b: 90  }, weight: 0.5, requiresVariance: false, varianceThreshold: 0    }],
            'man_int_07': [{ rgb: { r: 200, g: 180, b: 90  }, weight: 0.6, requiresVariance: false, varianceThreshold: 0    }],
            'avo_ext_01': [{ rgb: { r: 30,  g: 25,  b: 15  }, weight: 0.8, requiresVariance: true,  varianceThreshold: 800  }],
            'avo_ext_02': [{ rgb: { r: 60,  g: 40,  b: 20  }, weight: 0.7, requiresVariance: false, varianceThreshold: 0    }],
            'avo_ext_03': [{ rgb: { r: 40,  g: 30,  b: 15  }, weight: 0.8, requiresVariance: true,  varianceThreshold: 1500 }],
            'avo_ext_04': [{ rgb: { r: 70,  g: 80,  b: 60  }, weight: 0.9, requiresVariance: false, varianceThreshold: 0    }],
            'avo_ext_05': [{ rgb: { r: 50,  g: 40,  b: 20  }, weight: 0.6, requiresVariance: true,  varianceThreshold: 400  }],
            'avo_ext_06': [{ rgb: { r: 90,  g: 70,  b: 40  }, weight: 0.6, requiresVariance: true,  varianceThreshold: 600  }],
            'avo_ext_07': [{ rgb: { r: 180, g: 140, b: 60  }, weight: 0.7, requiresVariance: false, varianceThreshold: 0    }],
            'avo_ext_08': [{ rgb: { r: 40,  g: 30,  b: 15  }, weight: 0.8, requiresVariance: true,  varianceThreshold: 1200 }],
            'avo_int_01': [{ rgb: { r: 100, g: 70,  b: 30  }, weight: 0.8, requiresVariance: false, varianceThreshold: 0    }],
            'avo_int_02': [{ rgb: { r: 110, g: 75,  b: 35  }, weight: 0.8, requiresVariance: false, varianceThreshold: 0    }],
            'avo_int_03': [{ rgb: { r: 70,  g: 80,  b: 60  }, weight: 0.9, requiresVariance: false, varianceThreshold: 0    }],
            'avo_int_04': [{ rgb: { r: 120, g: 120, b: 100 }, weight: 0.9, requiresVariance: false, varianceThreshold: 0    }],
            'avo_int_05': [{ rgb: { r: 80,  g: 55,  b: 25  }, weight: 0.8, requiresVariance: true,  varianceThreshold: 700  }],
            'avo_int_06': [{ rgb: { r: 160, g: 130, b: 80  }, weight: 0.6, requiresVariance: false, varianceThreshold: 0    }],
            'avo_int_07': [{ rgb: { r: 180, g: 160, b: 100 }, weight: 0.5, requiresVariance: false, varianceThreshold: 0    }],
            'avo_int_08': [{ rgb: { r: 140, g: 160, b: 80  }, weight: 0.6, requiresVariance: false, varianceThreshold: 0    }]
        };
        return signatures[defectId] || null;
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

    function getFallbackResults() {
        const defects = DEFECTS_DATA[currentFruit][currentType];
        const primary = defects[0];
        const possibilities = defects.slice(1, 4);
        return { primary, confidence: 55, possibilities: possibilities.map(d => ({ defect: d, score: 0.3 })) };
    }

    function getSeverityColor(severity) {
        if (severity === 'minor') return 'var(--pulp-lime)';
        if (severity === 'major') return 'var(--pulp-amber)';
        return 'var(--pulp-red)';
    }

    function displayResults(results) {
        const container = document.getElementById('defectScanResults');
        if (!container) return;

        const { primary, confidence, possibilities } = results;
        const severityColor = getSeverityColor(primary.severity);
        const severityLabel = t(primary.severity);

        let possibilitiesHtml = '';
        if (possibilities && possibilities.length > 0) {
            possibilitiesHtml = `
            <div style="margin-top:14px; padding-top:12px; border-top:1px solid var(--border-glass);">
                <div style="font-size:0.55rem; font-weight:900; color:var(--text-dim); text-transform:uppercase; letter-spacing:2px; margin-bottom:8px;">${t('otherPossibilities')}</div>
                ${possibilities.map(p => `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:7px 0; border-bottom:1px solid rgba(255,255,255,0.04);">
                        <span style="font-size:0.7rem; font-weight:700; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px;">${p.defect.name}</span>
                        <span class="severity-badge ${p.defect.severity}">${t(p.defect.severity)}</span>
                    </div>
                `).join('')}
            </div>`;
        }

        container.innerHTML = `
        <div style="background:var(--glass-card); border:1px solid ${severityColor}40; border-radius:24px; padding:18px; margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                <div style="font-size:1.1rem; font-weight:900; color:var(--text-main); text-transform:uppercase; letter-spacing:1px; flex:1;">${primary.name}</div>
                <span class="severity-badge ${primary.severity}" style="margin-left:10px; flex-shrink:0;">${severityLabel}</span>
            </div>
            <div style="font-size:0.68rem; color:var(--text-dim); line-height:1.5; margin-bottom:12px;">${primary.description}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-top:1px solid var(--border-glass);">
                <span style="font-size:0.55rem; font-weight:900; color:var(--text-dim); text-transform:uppercase; letter-spacing:2px;">${t('confidence')}</span>
                <span style="font-size:0.85rem; font-weight:900; color:${severityColor};">${confidence}%</span>
            </div>
            ${possibilitiesHtml}
        </div>
        <button onclick="DefectDetector.showMoreInfo('${primary.id}')" style="
            background:rgba(166,226,46,0.1); border:1px solid var(--pulp-lime);
            color:var(--pulp-lime); border-radius:100px; padding:13px;
            font-weight:900; width:100%; text-transform:uppercase;
            cursor:pointer; letter-spacing:1px; font-size:0.82rem;
            margin-bottom:10px;">
            <i class="bi bi-info-circle"></i> ${t('moreInfo')}
        </button>`;

        container.classList.remove('hidden');
    }

    function showMoreInfo(defectId) {
        const allDefects = DEFECTS_DATA[currentFruit][currentType];
        const defect = allDefects.find(d => d.id === defectId);
        if (!defect) return;

        const severityColor = getSeverityColor(defect.severity);

        document.getElementById('defectInfoContent').innerHTML = `
        <div style="margin-bottom:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <div style="font-size:1.2rem; font-weight:900; color:var(--text-main); text-transform:uppercase; letter-spacing:1px;">${defect.name}</div>
                <span class="severity-badge ${defect.severity}">${t(defect.severity)}</span>
            </div>
            <div style="font-size:0.6rem; font-weight:900; color:var(--pulp-lime); text-transform:uppercase; letter-spacing:2px;">${currentFruit.toUpperCase()} — ${t(currentType)}</div>
        </div>
        <div style="background:var(--glass-card); border:1px solid var(--border-glass); border-radius:20px; padding:16px; margin-bottom:12px;">
            <div style="font-size:0.55rem; font-weight:900; color:var(--text-dim); text-transform:uppercase; letter-spacing:2px; margin-bottom:8px;">${t('description')}</div>
            <div style="font-size:0.78rem; color:var(--text-main); line-height:1.6;">${defect.description}</div>
        </div>
        <div style="background:rgba(255,77,77,0.06); border:1px solid rgba(255,77,77,0.2); border-radius:20px; padding:16px; margin-bottom:12px;">
            <div style="font-size:0.55rem; font-weight:900; color:var(--pulp-red); text-transform:uppercase; letter-spacing:2px; margin-bottom:8px;">${t('severityLevel')}</div>
            <div style="font-size:0.78rem; color:var(--text-main); line-height:1.6; text-transform:capitalize;">${t(defect.severity)} — ${t(defect.severity + 'Explain')}</div>
        </div>
        <div style="background:rgba(166,226,46,0.06); border:1px solid rgba(166,226,46,0.2); border-radius:20px; padding:16px; margin-bottom:12px;">
            <div style="font-size:0.55rem; font-weight:900; color:var(--pulp-lime); text-transform:uppercase; letter-spacing:2px; margin-bottom:8px;">${t('recommendedAction')}</div>
            <div style="font-size:0.78rem; color:var(--text-main); line-height:1.6;">${defect.action}</div>
        </div>`;

        showDefectView('defect-info-view');
    }

    function resetScanUI() {
        const container = document.getElementById('defectScanResults');
        if (container) container.classList.add('hidden');
        const btn = document.getElementById('defectScanActionBtn');
        if (btn) btn.innerHTML = '<i class="bi bi-camera-fill"></i> ' + t('scan');
    }

    function showDefectView(viewId) {
        const views = [
            'defect-hub',
            'defect-type-view',
            'defect-scan-view',
            'defect-report-view',
            'defect-info-view'
        ];
        views.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
        const target = document.getElementById(viewId);
        if (target) target.classList.remove('hidden');
    }

    function close() {
        stopCamera();
        showHub();
    }

    return {
        init,
        selectFruit,
        selectType,
        doScan,
        showMoreInfo,
        showDefectView,
        stopCamera,
        close
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    DefectDetector.init();
});
