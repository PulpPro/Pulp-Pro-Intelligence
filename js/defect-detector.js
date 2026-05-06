const DefectDetector = (() => {
    let currentFruit = null;
    let currentType = null;
    let cameraStream = null;
    let checkedDefects = [];

    function init() {
        console.log('Defect Detector ready');
    }

    // Step 1 — open defect hub (handled by navigation.js)

    // Step 2 — user picks fruit, show internal/external choice
    function selectFruit(fruit) {
        currentFruit = fruit;
        checkedDefects = [];
        const fruitNames = { banana: 'Banana', mango: 'Mango', avocado: 'Avocado' };

        document.getElementById('defectTypeTitle').innerText = fruitNames[fruit] + ' — Select Type';
        document.getElementById('defectTypeDesc_external').innerText = getTypeDesc(fruit, 'external');
        document.getElementById('defectTypeDesc_internal').innerText = getTypeDesc(fruit, 'internal');

        showDefectView('defect-type-view');
    }

    // Type descriptions per fruit
    function getTypeDesc(fruit, type) {
        const desc = {
            banana: {
                external: 'Skin colour, bruising, splits, mould, scarring, tip & crown rot',
                internal: 'Flesh colour, internal rot, vascular browning, overripeness'
            },
            mango: {
                external: 'Skin blemishes, soft spots, anthracnose, stem rot, cuts',
                internal: 'Seed damage, flesh browning, internal breakdown, flavour'
            },
            avocado: {
                external: 'Skin bruising, cracking, mould, stem absence, scab',
                internal: 'Flesh browning, vascular browning, seed cavity mould, grey pulp'
            }
        };
        return desc[fruit][type];
    }

    // Step 3 — user picks external or internal, open camera + checklist
    async function selectType(type) {
        currentType = type;
        checkedDefects = [];

        const fruitNames = { banana: 'Banana', mango: 'Mango', avocado: 'Avocado' };
        const typeLabel = type === 'external' ? 'External' : 'Internal';
        document.getElementById('defectScanTitle').innerText = fruitNames[currentFruit] + ' — ' + typeLabel;
        document.getElementById('defectChecklistTitle').innerText = typeLabel + ' Defects';

        renderChecklist();
        showDefectView('defect-scan-view');
        await startCamera();
    }

    // Render checklist for current fruit + type
    function renderChecklist() {
        const defects = DEFECTS_DATA[currentFruit][currentType];
        const container = document.getElementById('defectChecklist');

        container.innerHTML = defects.map(d => `
            <div class="check-item" id="check_${d.id}" onclick="DefectDetector.toggleDefect('${d.id}')">
                <div class="check-box" id="box_${d.id}"></div>
                <span class="check-label">${d.name}</span>
                <span class="severity-badge ${d.severity}">${d.severity}</span>
            </div>
        `).join('');
    }

    // Toggle a defect on/off
    function toggleDefect(id) {
        const item = document.getElementById('check_' + id);
        const box = document.getElementById('box_' + id);
        const isChecked = item.classList.contains('checked');

        if (isChecked) {
            item.classList.remove('checked');
            box.innerText = '';
            checkedDefects = checkedDefects.filter(d => d !== id);
        } else {
            item.classList.add('checked');
            box.innerText = '✓';
            checkedDefects.push(id);
        }
    }

    // Camera
    async function startCamera() {
        try {
            if (cameraStream) stopCamera();
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            const video = document.getElementById('defectVideo');
            video.srcObject = cameraStream;
            await video.play();
        } catch (err) {
            document.getElementById('cameraPlaceholder').style.display = 'flex';
            document.getElementById('defectVideo').style.display = 'none';
            console.warn('Camera not available:', err);
        }
    }

    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(t => t.stop());
            cameraStream = null;
        }
    }

    // Capture photo from camera
    function capturePhoto() {
        const video = document.getElementById('defectVideo');
        const canvas = document.getElementById('defectCanvas');
        if (!video.srcObject) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        const btn = document.getElementById('captureBtn');
        btn.innerText = '✓ Captured';
        btn.style.background = '#a6e22e';
        btn.style.color = '#000';
        setTimeout(() => {
            btn.innerText = 'Capture';
            btn.style.background = '';
            btn.style.color = '';
        }, 2000);
    }

    // Generate report
    function generateReport() {
        if (checkedDefects.length === 0) {
            alert('Please select at least one defect or confirm no defects found.');
            return;
        }

        const allDefects = DEFECTS_DATA[currentFruit][currentType];
        const selected = allDefects.filter(d => checkedDefects.includes(d.id));

        const counts = { minor: 0, major: 0, critical: 0 };
        selected.forEach(d => counts[d.severity]++);

        const grade = calculateGrade(counts, allDefects.length);
        const status = getStatus(counts);

        renderReport(selected, counts, grade, status);
        showDefectView('defect-report-view');
        stopCamera();
    }

    function calculateGrade(counts, total) {
        const score = 100 - (counts.minor * 5) - (counts.major * 15) - (counts.critical * 40);
        const clamped = Math.max(0, score);
        if (clamped >= 90) return { letter: 'A', color: '#a6e22e' };
        if (clamped >= 75) return { letter: 'B', color: '#a6e22e' };
        if (clamped >= 60) return { letter: 'C', color: '#ff8c00' };
        if (clamped >= 40) return { letter: 'D', color: '#ff8c00' };
        return { letter: 'F', color: '#ff4d4d' };
    }

    function getStatus(counts) {
        if (counts.critical > 0) return { label: 'REJECT', color: '#ff4d4d' };
        if (counts.major >= 2) return { label: 'FAIL', color: '#ff4d4d' };
        if (counts.major === 1) return { label: 'ACCEPTABLE', color: '#ff8c00' };
        if (counts.minor > 0) return { label: 'PASS WITH NOTES', color: '#ff8c00' };
        return { label: 'PASS', color: '#a6e22e' };
    }

    function renderReport(selected, counts, grade, status) {
        const fruitNames = { banana: 'Banana', mango: 'Mango', avocado: 'Avocado' };
        const typeLabel = currentType === 'external' ? 'External' : 'Internal';
        const now = new Date();
        const timestamp = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
            + ' • ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        document.getElementById('reportGradeLetter').innerText = grade.letter;
        document.getElementById('reportGradeLetter').style.color = grade.color;
        document.getElementById('reportGradeCircle').style.borderColor = grade.color;

        document.getElementById('reportFruit').innerText = fruitNames[currentFruit] + ' — ' + typeLabel;
        document.getElementById('reportTimestamp').innerText = timestamp;
        document.getElementById('reportDefectCount').innerText = selected.length + ' of ' + DEFECTS_DATA[currentFruit][currentType].length;
        document.getElementById('reportSeverity').innerText =
            (counts.minor ? counts.minor + ' Minor ' : '') +
            (counts.major ? counts.major + ' Major ' : '') +
            (counts.critical ? counts.critical + ' Critical' : '');
        document.getElementById('reportStatus').innerText = status.label;
        document.getElementById('reportStatus').style.color = status.color;

        // Defect list
        document.getElementById('reportDefectList').innerHTML = selected.map(d => `
            <div style="padding:10px 12px; margin-bottom:8px; border-radius:14px;
                background:rgba(255,255,255,0.03); border-left:3px solid ${getSeverityColor(d.severity)};">
                <div style="font-weight:900; font-size:0.75rem; color:var(--text-main); text-transform:uppercase; letter-spacing:1px;">
                    ${d.name}
                    <span class="severity-badge ${d.severity}" style="margin-left:8px;">${d.severity}</span>
                </div>
                <div style="font-size:0.7rem; color:rgba(255,255,255,0.5); margin-top:4px;">${d.description}</div>
                <div style="font-size:0.7rem; color:${getSeverityColor(d.severity)}; margin-top:6px; font-weight:700;">
                    → ${d.action}
                </div>
            </div>
        `).join('');
    }

    function getSeverityColor(severity) {
        if (severity === 'minor') return '#a6e22e';
        if (severity === 'major') return '#ff8c00';
        return '#ff4d4d';
    }

    // Copy report to clipboard
    function copyReport() {
        const fruit = document.getElementById('reportFruit').innerText;
        const timestamp = document.getElementById('reportTimestamp').innerText;
        const grade = document.getElementById('reportGradeLetter').innerText;
        const count = document.getElementById('reportDefectCount').innerText;
        const severity = document.getElementById('reportSeverity').innerText;
        const status = document.getElementById('reportStatus').innerText;
        const appUrl = 'https://pulppro.github.io/Pulp-Pro-Intelligence/';

        const allDefects = DEFECTS_DATA[currentFruit][currentType];
        const selected = allDefects.filter(d => checkedDefects.includes(d.id));

        const defectLines = selected.map(d =>
            `• ${d.name} [${d.severity.toUpperCase()}]: ${d.action}`
        ).join('\n');

        const plainText =
            `Pulp Pro Intelligence: ${appUrl}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `DEFECT REPORT\n` +
            `Fruit: ${fruit}\n` +
            `Date: ${timestamp}\n` +
            `Grade: ${grade}\n` +
            `Defects Found: ${count}\n` +
            `Severity: ${severity}\n` +
            `Status: ${status}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `DEFECTS:\n${defectLines}`;

        navigator.clipboard.writeText(plainText).then(() => {
            const btn = document.getElementById('copyReportBtn');
            btn.innerText = '✓ Copied!';
            btn.style.background = '#a6e22e';
            btn.style.color = '#000';
            setTimeout(() => {
                btn.innerText = 'Copy Report';
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);
        });
    }

    // Show/hide defect views
    function showDefectView(viewId) {
        const views = [
            'defect-hub',
            'defect-type-view',
            'defect-scan-view',
            'defect-report-view'
        ];
        views.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
        const target = document.getElementById(viewId);
        if (target) target.classList.remove('hidden');
    }

    // Close and go home
    function close() {
        stopCamera();
        showHub();
    }

    return {
        init,
        selectFruit,
        selectType,
        toggleDefect,
        capturePhoto,
        generateReport,
        copyReport,
        close
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    DefectDetector.init();
});
