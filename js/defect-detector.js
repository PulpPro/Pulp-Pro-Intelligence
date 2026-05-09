const DefectDetector = (() => {

    let currentFruit = 'banana';
    let currentType = null;
    let currentDefect = null;

    // ── SEVERITY HELPERS ─────────────────────────────────────
    function severityColor(sev) {
        if (sev === 'critical') return '#ff4d4d';
        if (sev === 'major') return '#ff8c00';
        return '#78c830';
    }

    function severityLabel(sev) {
        const lang = typeof currentLang !== 'undefined' ? currentLang : 'en';
        if (sev === 'critical') return lang === 'nl' ? 'Kritiek' : 'Critical';
        if (sev === 'major') return lang === 'nl' ? 'Groot' : 'Major';
        return lang === 'nl' ? 'Klein' : 'Minor';
    }

    function t(key) {
        if (typeof TRANSLATIONS !== 'undefined' && typeof currentLang !== 'undefined') {
            return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['en']?.[key] || key;
        }
        return key;
    }

    // ── SHOW/HIDE VIEWS ───────────────────────────────────────
    function showDefectView(viewId) {
        const views = [
            'defect-hub', 'defect-type-view', 'defect-scan-view',
            'defect-info-view', 'defect-report-view',
            'defect-list-view', 'defect-detail-view'
        ];
        views.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
        const target = document.getElementById(viewId);
        if (target) target.classList.remove('hidden');
    }

    // ── SELECT FRUIT ──────────────────────────────────────────
    function selectFruit(fruit) {
        currentFruit = fruit;
        showDefectView('defect-type-view');
        const title = document.getElementById('defectTypeTitle');
        const names = { banana: t('banana'), mango: t('mango'), avocado: t('avocado') };
        if (title) title.innerText = (names[fruit] || fruit) + ' — ' + t('selectType');

        // Update descriptions
        const extDesc = document.getElementById('defectTypeDesc_external');
        const intDesc = document.getElementById('defectTypeDesc_internal');
        if (extDesc) extDesc.innerText = t(fruit + 'ExtDesc') || '';
        if (intDesc) intDesc.innerText = t(fruit + 'IntDesc') || '';
    }

    // ── SELECT TYPE (external/internal) ───────────────────────
    function selectType(type) {
        currentType = type;
        // For banana show the full defect library
        if (currentFruit === 'banana') {
            renderDefectList(type);
            showDefectView('defect-list-view');
        } else {
            // Other fruits still use the scan view
            showDefectView('defect-scan-view');
            const title = document.getElementById('defectScanTitle');
            if (title) {
                const names = { banana: t('banana'), mango: t('mango'), avocado: t('avocado') };
                const typeLabel = type === 'external' ? t('externalDefects') : t('internalDefects');
                title.innerText = (names[currentFruit] || currentFruit) + ' — ' + typeLabel;
            }
            startCamera();
        }
    }

    // ── RENDER DEFECT LIST ────────────────────────────────────
    function renderDefectList(type) {
        const lang = typeof currentLang !== 'undefined' ? currentLang : 'en';
        const data = DEFECTS_DATA[currentFruit];
        if (!data) return;

        // Get defects for this type
        let defects = [];
        let categoryLabel = '';

        if (type === 'external') {
            defects = [
                ...(data.external || []),
                ...(data.fungal || []),
            ];
            categoryLabel = lang === 'nl' ? 'Extern & Schimmel' : 'External & Fungal';
        } else {
            defects = [
                ...(data.internal || []),
                ...(data.physiological || []),
            ];
            categoryLabel = lang === 'nl' ? 'Intern & Fysiologisch' : 'Internal & Physiological';
        }

        // Build the view if it doesn't exist
        ensureDefectListView();
        ensureDefectDetailView();

        const container = document.getElementById('defectListContainer');
        const titleEl = document.getElementById('defectListTitle');
        if (titleEl) {
            const names = { banana: t('banana'), mango: t('mango'), avocado: t('avocado') };
            titleEl.innerText = (names[currentFruit] || currentFruit) + ' — ' + categoryLabel;
        }

        if (!container) return;

        container.innerHTML = defects.map(defect => {
            const d = defect[lang] || defect['en'];
            const col = severityColor(defect.severity);
            const sev = severityLabel(defect.severity);
            return `
            <div class="defect-list-item" onclick="DefectDetector.openDefect('${defect.id}', '${type}')">
                <div class="defect-list-icon" style="background:${col}18; border:1px solid ${col}30;">
                    <span style="font-size:1.2rem;">🍌</span>
                </div>
                <div class="defect-list-info">
                    <div class="defect-list-name">${d.name}</div>
                    <div class="defect-list-desc">${d.shortDesc}</div>
                </div>
                <div class="defect-list-severity" style="background:${col}18; color:${col};">${sev}</div>
                <div class="defect-list-chevron">›</div>
            </div>`;
        }).join('');
    }

    // ── OPEN DEFECT DETAIL ────────────────────────────────────
    function openDefect(defectId, type) {
        const lang = typeof currentLang !== 'undefined' ? currentLang : 'en';
        const data = DEFECTS_DATA[currentFruit];
        if (!data) return;

        // Find defect across all categories
        const allDefects = [
            ...(data.external || []),
            ...(data.fungal || []),
            ...(data.internal || []),
            ...(data.physiological || []),
        ];
        const defect = allDefects.find(d => d.id === defectId);
        if (!defect) return;

        currentDefect = defect;
        const d = defect[lang] || defect['en'];
        const col = severityColor(defect.severity);
        const sev = severityLabel(defect.severity);

        ensureDefectDetailView();

        // Hero
        const hero = document.getElementById('defectDetailHero');
        if (hero) hero.style.background = `linear-gradient(135deg, ${col}22, ${col}10)`;

        // Badge
        const badge = document.getElementById('defectDetailBadge');
        if (badge) {
            badge.innerText = sev;
            badge.style.background = col + '25';
            badge.style.borderColor = col + '50';
            badge.style.color = col;
        }

        // Image
        const img = document.getElementById('defectDetailImg');
        const imgPlaceholder = document.getElementById('defectDetailImgPlaceholder');
        if (img && imgPlaceholder) {
            img.onerror = () => { img.style.display = 'none'; imgPlaceholder.style.display = 'flex'; };
            img.onload = () => { img.style.display = 'block'; imgPlaceholder.style.display = 'none'; };
            img.src = defect.image;
            img.style.display = 'block';
            imgPlaceholder.style.display = 'none';
        }

        // Title
        const titleEl = document.getElementById('defectDetailTitle');
        if (titleEl) titleEl.innerText = d.name;
        const subtitleEl = document.getElementById('defectDetailSubtitle');
        if (subtitleEl) subtitleEl.innerText = d.category;

        // Content sections
        const sections = [
            { id: 'defectSectionWhat', label: lang === 'nl' ? '🔬 Wat is het?' : '🔬 What is it?', content: d.whatIsIt },
            { id: 'defectSectionIdentify', label: lang === 'nl' ? '👁️ Hoe te herkennen' : '👁️ How to identify', content: d.howToIdentify },
            { id: 'defectSectionCauses', label: lang === 'nl' ? '⚙️ Oorzaken' : '⚙️ Causes', content: d.causes },
            { id: 'defectSectionShipment', label: lang === 'nl' ? '🚢 Impact op transport' : '🚢 Shipment impact', content: d.shipmentImpact },
            { id: 'defectSectionTemp', label: lang === 'nl' ? '🌡️ Temperatuureffecten' : '🌡️ Temperature effects', content: d.temperatureEffects },
            { id: 'defectSectionDecision', label: lang === 'nl' ? '✅ Accepteren / Afkeuren' : '✅ Accept / Reject guide', content: d.acceptReject },
            { id: 'defectSectionPrevention', label: lang === 'nl' ? '🛡️ Preventie' : '🛡️ Prevention', content: d.prevention },
        ];

        sections.forEach(sec => {
            const labelEl = document.getElementById(sec.id + 'Label');
            const contentEl = document.getElementById(sec.id + 'Content');
            if (labelEl) labelEl.innerText = sec.label;
            if (contentEl) contentEl.innerText = sec.content || '';
        });

        showDefectView('defect-detail-view');
    }

    // ── ENSURE DEFECT LIST VIEW EXISTS ────────────────────────
    function ensureDefectListView() {
        if (document.getElementById('defect-list-view')) return;
        const div = document.createElement('div');
        div.id = 'defect-list-view';
        div.className = 'nav-view hidden';
        div.innerHTML = `
        <div style="max-width:500px; margin:0 auto;">
            <div class="hub-title" id="defectListTitle">Banana Defects</div>
            <div id="defectListContainer" style="display:flex; flex-direction:column; gap:0;"></div>
            <button class="btn-main btn-back" style="margin-top:14px;" onclick="DefectDetector.backToTypeView()">← ${typeof t !== 'undefined' ? t('back') : 'Back'}</button>
        </div>`;
        document.body.appendChild(div);
    }

    // ── ENSURE DEFECT DETAIL VIEW EXISTS ─────────────────────
    function ensureDefectDetailView() {
        if (document.getElementById('defect-detail-view')) return;
        const div = document.createElement('div');
        div.id = 'defect-detail-view';
        div.className = 'nav-view hidden';
        div.innerHTML = `
        <div style="max-width:500px; margin:0 auto;">
            <!-- Hero -->
            <div id="defectDetailHero" style="position:relative; width:100%; border-radius:0 0 28px 28px; overflow:hidden; margin-bottom:0; min-height:200px; display:flex; align-items:center; justify-content:center;">
                <img id="defectDetailImg" src="" alt="" style="width:100%; max-height:280px; object-fit:cover; display:none; border-radius:0 0 28px 28px;">
                <div id="defectDetailImgPlaceholder" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:40px; min-height:200px;">
                    <span style="font-size:3rem;">🍌</span>
                    <span style="font-size:0.5rem; font-weight:700; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:2px;">Add photo: images/defects/</span>
                </div>
                <div style="position:absolute; top:14px; left:14px;">
                    <button onclick="DefectDetector.backToList()" style="background:rgba(0,0,0,0.55); border:1px solid rgba(255,255,255,0.15); color:#fff; font-size:0.6rem; font-weight:900; text-transform:uppercase; letter-spacing:1px; padding:6px 14px; border-radius:20px; cursor:pointer;">← Back</button>
                </div>
                <div id="defectDetailBadge" style="position:absolute; bottom:14px; left:14px; font-size:0.48rem; font-weight:900; text-transform:uppercase; letter-spacing:1px; padding:4px 12px; border-radius:20px;"></div>
            </div>

            <!-- Body -->
            <div style="padding:18px 16px;">
                <div id="defectDetailTitle" style="font-size:1.4rem; font-weight:900; color:var(--text-main); margin-bottom:3px;"></div>
                <div id="defectDetailSubtitle" style="font-size:0.55rem; font-weight:700; color:var(--text-dim); text-transform:uppercase; letter-spacing:2px; margin-bottom:18px;"></div>

                ${[
                    ['defectSectionWhat', 'What is it?', 'Wat is het?'],
                    ['defectSectionIdentify', 'How to identify', 'Hoe te herkennen'],
                    ['defectSectionCauses', 'Causes', 'Oorzaken'],
                    ['defectSectionShipment', 'Shipment impact', 'Impact op transport'],
                    ['defectSectionTemp', 'Temperature effects', 'Temperatuureffecten'],
                    ['defectSectionDecision', 'Accept / Reject guide', 'Accepteren / Afkeuren'],
                    ['defectSectionPrevention', 'Prevention', 'Preventie'],
                ].map(([id]) => `
                <div style="margin-bottom:18px;">
                    <div id="${id}Label" style="font-size:0.55rem; font-weight:900; color:var(--pulp-lime); text-transform:uppercase; letter-spacing:2px; margin-bottom:7px;"></div>
                    <div id="${id}Content" style="font-size:0.88rem; color:var(--text-dim); line-height:1.75; font-weight:500;"></div>
                </div>`).join('')}

                <button class="btn-main btn-back" onclick="DefectDetector.backToList()">← Back</button>
            </div>
        </div>`;
        document.body.appendChild(div);
    }

    // ── BACK NAVIGATION ───────────────────────────────────────
    function backToList() {
        renderDefectList(currentType);
        showDefectView('defect-list-view');
    }

    function backToTypeView() {
        showDefectView('defect-type-view');
    }

    // ── CAMERA (legacy scan view for non-banana) ──────────────
    let cameraStream = null;

    function startCamera() {
        const video = document.getElementById('defectVideo');
        const placeholder = document.getElementById('cameraPlaceholder');
        if (!video) return;
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
                cameraStream = stream;
                video.srcObject = stream;
                video.style.display = 'block';
                if (placeholder) placeholder.style.display = 'none';
                video.play();
            })
            .catch(() => {
                if (placeholder) placeholder.style.display = 'flex';
            });
    }

    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(t => t.stop());
            cameraStream = null;
        }
        const video = document.getElementById('defectVideo');
        if (video) { video.srcObject = null; video.style.display = 'none'; }
        const placeholder = document.getElementById('cameraPlaceholder');
        if (placeholder) placeholder.style.display = 'flex';
    }

    function doScan() {
        const btn = document.getElementById('defectScanActionBtn');
        if (btn) btn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Scanning...';
        setTimeout(() => {
            if (btn) btn.innerHTML = '<i class="bi bi-camera-fill"></i> Scan';
            const results = document.getElementById('defectScanResults');
            if (results) {
                results.classList.remove('hidden');
                results.innerHTML = `<div style="padding:16px; text-align:center; color:var(--text-dim); font-size:0.7rem;">Camera scan coming soon for this fruit type.</div>`;
            }
        }, 1000);
    }

    return {
        selectFruit,
        selectType,
        openDefect,
        backToList,
        backToTypeView,
        showDefectView,
        stopCamera,
        doScan,
    };
})();
