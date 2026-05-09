// ============================================================
// PULP PRO — FRUIT DEFECTS LIBRARY
// Triggered from Banana/Mango/Avocado → Defects button
// Does NOT affect defect-detector.js (camera feature)
// ============================================================

const FruitDefects = (() => {

    let activeFruit = null;
    let activeType = null;
    let activeDefect = null;

    // ── SEVERITY ─────────────────────────────────────────────
    function sevColor(s) {
        if (s === 'critical') return '#ff4d4d';
        if (s === 'major')    return '#ff8c00';
        return '#78c830';
    }

    function sevLabel(s) {
        const nl = getLang() === 'nl';
        if (s === 'critical') return nl ? 'Kritiek' : 'Critical';
        if (s === 'major')    return nl ? 'Groot'   : 'Major';
        return nl ? 'Klein' : 'Minor';
    }

    function getLang() {
        if (typeof currentLang !== 'undefined') return currentLang;
        return localStorage.getItem('pulpLang') || 'en';
    }

    // ── VIEW HELPER ───────────────────────────────────────────
    function showView(id) {
        ['fd-type-view','fd-list-view','fd-detail-view'].forEach(v => {
            const el = document.getElementById(v);
            if (el) el.classList.add('hidden');
        });
        const target = document.getElementById(id);
        if (target) target.classList.remove('hidden');

        // Hide all main nav views
        ['fruit-hub','middle-hub','brand-hub','appInterface',
         'defect-hub','news-view','colour-scanner-view'].forEach(v => {
            const el = document.getElementById(v);
            if (el) el.classList.add('hidden');
        });
    }

    // ── OPEN DEFECT LIBRARY ───────────────────────────────────
    function open(fruit) {
        activeFruit = fruit;
        ensureViews();
        const lang = getLang();
        const names = { banana: lang === 'nl' ? 'Banaan' : 'Banana', mango: 'Mango', avocado: 'Avocado' };

        // Update type view title and buttons
        const title = document.getElementById('fd-type-title');
        if (title) title.innerText = (names[fruit] || fruit) + ' — ' + (lang === 'nl' ? 'Gebreken' : 'Defects');

        const extBtn = document.getElementById('fd-ext-btn');
        const intBtn = document.getElementById('fd-int-btn');
        const extDesc = document.getElementById('fd-ext-desc');
        const intDesc = document.getElementById('fd-int-desc');

        const descs = {
            banana: {
                en: { ext: 'Skin, bruising, abrasions, chilling injury, crown rot, anthracnose', int: 'Flesh browning, vascular browning, finger drop' },
                nl: { ext: 'Schil, kneuzing, schuurwonden, kouschade, kroonrot, antracnose', int: 'Vruchtvlees bruinkleuring, vasculaire bruinkleuring, vingerval' }
            },
            mango: {
                en: { ext: 'Anthracnose, stem end rot, bruising, skin blemishes', int: 'Spongy tissue, internal breakdown' },
                nl: { ext: 'Antracnose, stengelrot, kneuzing, huidvlekken', int: 'Sponsachtig weefsel, interne afbraak' }
            },
            avocado: {
                en: { ext: 'Anthracnose, stem end rot, bruising, skin cracking', int: 'Flesh browning, vascular browning, seed cavity mould' },
                nl: { ext: 'Antracnose, stengeluiteinde rot, kneuzing, huidscheuren', int: 'Vruchtvlees bruinkleuring, vasculaire bruinkleuring, pitholte schimmel' }
            }
        };

        const d = descs[fruit]?.[lang] || descs[fruit]?.['en'] || { ext: '', int: '' };

        if (extBtn) extBtn.innerHTML = `<div style="font-size:0.9rem; font-weight:900;">${lang === 'nl' ? '🔍 Externe Gebreken' : '🔍 External Defects'}</div><div style="font-size:0.6rem; color:var(--text-dim); margin-top:4px;">${d.ext}</div>`;
        if (intBtn) intBtn.innerHTML = `<div style="font-size:0.9rem; font-weight:900;">${lang === 'nl' ? '🔬 Interne Gebreken' : '🔬 Internal Defects'}</div><div style="font-size:0.6rem; color:var(--text-dim); margin-top:4px;">${d.int}</div>`;

        showView('fd-type-view');
    }

    // ── SELECT TYPE ───────────────────────────────────────────
    function selectType(type) {
        activeType = type;
        const lang = getLang();
        const data = FRUIT_DEFECTS[activeFruit];
        if (!data) return;

        const defects = data[type] || [];
        const names = { banana: lang === 'nl' ? 'Banaan' : 'Banana', mango: 'Mango', avocado: 'Avocado' };
        const typeLabel = type === 'external'
            ? (lang === 'nl' ? 'Externe Gebreken' : 'External Defects')
            : (lang === 'nl' ? 'Interne Gebreken' : 'Internal Defects');

        const listTitle = document.getElementById('fd-list-title');
        if (listTitle) listTitle.innerText = (names[activeFruit] || activeFruit) + ' — ' + typeLabel;

        const container = document.getElementById('fd-list-container');
        if (!container) return;

        if (defects.length === 0) {
            container.innerHTML = `<div style="padding:40px; text-align:center; color:var(--text-dim); font-size:0.7rem;">${lang === 'nl' ? 'Binnenkort beschikbaar' : 'Coming soon'}</div>`;
        } else {
            container.innerHTML = defects.map(def => {
                const d = def[lang] || def['en'];
                const col = sevColor(def.severity);
                const sev = sevLabel(def.severity);
                return `
                <div onclick="FruitDefects.openDefect('${def.id}')" style="display:flex; align-items:center; gap:12px; padding:14px 16px; border-bottom:1px solid var(--border-glass); cursor:pointer; background:var(--glass-card); transition:background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.04)'" onmouseout="this.style.background='var(--glass-card)'">
                    <div style="width:42px; height:42px; border-radius:10px; background:${col}18; border:1px solid ${col}30; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0;">${def.emoji}</div>
                    <div style="flex:1; min-width:0;">
                        <div style="font-size:0.82rem; font-weight:800; color:var(--text-main); margin-bottom:2px;">${d.name}</div>
                        <div style="font-size:0.6rem; color:var(--text-dim); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${d.shortDesc}</div>
                    </div>
                    <div style="font-size:0.48rem; font-weight:900; text-transform:uppercase; letter-spacing:0.5px; padding:3px 9px; border-radius:8px; background:${col}18; color:${col}; flex-shrink:0;">${sev}</div>
                    <div style="color:var(--text-dim); font-size:1.1rem; flex-shrink:0; margin-left:2px;">›</div>
                </div>`;
            }).join('');
        }

        showView('fd-list-view');
    }

    // ── OPEN DEFECT DETAIL ────────────────────────────────────
    function openDefect(defectId) {
        const lang = getLang();
        const data = FRUIT_DEFECTS[activeFruit];
        if (!data) return;

        const allDefs = [...(data.external || []), ...(data.internal || [])];
        const def = allDefs.find(d => d.id === defectId);
        if (!def) return;

        activeDefect = def;
        const d = def[lang] || def['en'];
        const col = sevColor(def.severity);
        const sev = sevLabel(def.severity);

        // Hero background
        const hero = document.getElementById('fd-detail-hero');
        if (hero) hero.style.background = `linear-gradient(135deg, ${col}22 0%, ${col}08 100%)`;

        // Badge
        const badge = document.getElementById('fd-detail-badge');
        if (badge) {
            badge.innerText = sev;
            badge.style.background = col + '25';
            badge.style.borderColor = col + '60';
            badge.style.color = col;
        }

        // Title
        const titleEl = document.getElementById('fd-detail-title');
        if (titleEl) titleEl.innerText = d.name;
        const subtitleEl = document.getElementById('fd-detail-subtitle');
        if (subtitleEl) subtitleEl.innerText = d.category || '';

        // Images
        renderDetailImages(def.images || []);

        // Sections
        const sections = [
            { id: 'fd-s-what',       label: lang === 'nl' ? '🔬 Wat is het?'                : '🔬 What is it?',           content: d.whatIsIt },
            { id: 'fd-s-identify',   label: lang === 'nl' ? '👁️ Hoe te herkennen'           : '👁️ How to identify',       content: d.howToIdentify },
            { id: 'fd-s-causes',     label: lang === 'nl' ? '⚙️ Oorzaken'                   : '⚙️ Causes',               content: d.causes },
            { id: 'fd-s-shipment',   label: lang === 'nl' ? '🚢 Impact op transport'        : '🚢 Shipment impact',       content: d.shipmentImpact },
            { id: 'fd-s-temp',       label: lang === 'nl' ? '🌡️ Temperatuureffecten'        : '🌡️ Temperature effects',  content: d.temperatureEffects },
            { id: 'fd-s-decision',   label: lang === 'nl' ? '✅ Accepteren / Afkeuren'      : '✅ Accept / Reject guide', content: d.acceptReject },
            { id: 'fd-s-prevention', label: lang === 'nl' ? '🛡️ Preventie'                 : '🛡️ Prevention',           content: d.prevention },
        ];

        sections.forEach(sec => {
            const labelEl   = document.getElementById(sec.id + '-label');
            const contentEl = document.getElementById(sec.id + '-content');
            if (labelEl)   labelEl.innerText   = sec.label;
            if (contentEl) contentEl.innerText = sec.content || '';
        });

        showView('fd-detail-view');
    }

    // ── RENDER IMAGES ─────────────────────────────────────────
    function renderDetailImages(images) {
        const container = document.getElementById('fd-images-container');
        if (!container) return;

        if (!images || images.length === 0) {
            container.innerHTML = `
            <div style="width:100%; height:160px; background:var(--glass-card); border:1px dashed rgba(255,255,255,0.1); border-radius:16px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;">
                <span style="font-size:2rem;">📷</span>
                <span style="font-size:0.5rem; color:rgba(255,255,255,0.25); font-weight:700; text-transform:uppercase; letter-spacing:1px;">Add photo to images/defects/</span>
            </div>`;
            return;
        }

        // Show all images, stacked vertically for full quality
        container.innerHTML = images.map((src, i) => `
        <div style="position:relative; width:100%; margin-bottom:${i < images.length - 1 ? '8px' : '0'}; border-radius:14px; overflow:hidden; background:var(--glass-card);">
            <img src="${src}" alt="Defect photo ${i+1}" style="width:100%; display:block; border-radius:14px; object-fit:cover; max-height:280px;"
                onerror="this.parentElement.innerHTML='<div style=\'height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;border-radius:14px;background:var(--glass-card);border:1px dashed rgba(255,255,255,0.1)\'><span style=\'font-size:1.5rem\'>📷</span><span style=\'font-size:0.48rem;color:rgba(255,255,255,0.2);text-transform:uppercase;letter-spacing:1px\'>Photo not found — add to images/defects/</span></div>'">
        </div>`).join('');
    }

    // ── BACK NAVIGATION ───────────────────────────────────────
    function backToTypeView() {
        showView('fd-type-view');
    }

    function backToList() {
        selectType(activeType);
    }

    function backToMiddleHub() {
        // Hide all fd views
        ['fd-type-view','fd-list-view','fd-detail-view'].forEach(v => {
            const el = document.getElementById(v);
            if (el) el.classList.add('hidden');
        });
        // Show middle hub
        const mh = document.getElementById('middle-hub');
        if (mh) mh.classList.remove('hidden');
    }

    // ── BUILD VIEWS ───────────────────────────────────────────
    function ensureViews() {
        if (!document.getElementById('fd-type-view')) buildTypeView();
        if (!document.getElementById('fd-list-view')) buildListView();
        if (!document.getElementById('fd-detail-view')) buildDetailView();
    }

    function buildTypeView() {
        const div = document.createElement('div');
        div.id = 'fd-type-view';
        div.className = 'nav-view hidden';
        div.innerHTML = `
        <div style="max-width:500px; margin:0 auto; padding:0 4px;">
            <div class="hub-title" id="fd-type-title">Defects</div>
            <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:20px;">
                <button id="fd-ext-btn" onclick="FruitDefects.selectType('external')" class="list-btn" style="text-align:left; padding:18px 20px;"></button>
                <button id="fd-int-btn" onclick="FruitDefects.selectType('internal')" class="list-btn" style="text-align:left; padding:18px 20px;"></button>
            </div>
            <button class="btn-main btn-back" onclick="FruitDefects.backToMiddleHub()">← Back</button>
        </div>`;
        document.body.appendChild(div);
    }

    function buildListView() {
        const div = document.createElement('div');
        div.id = 'fd-list-view';
        div.className = 'nav-view hidden';
        div.innerHTML = `
        <div style="max-width:500px; margin:0 auto;">
            <div class="hub-title" id="fd-list-title">Defects</div>
            <div id="fd-list-container" style="border-radius:20px; overflow:hidden; border:1px solid var(--border-glass); margin-bottom:16px;"></div>
            <button class="btn-main btn-back" onclick="FruitDefects.backToTypeView()">← Back</button>
        </div>`;
        document.body.appendChild(div);
    }

    function buildDetailView() {
        const sectionIds = ['fd-s-what','fd-s-identify','fd-s-causes','fd-s-shipment','fd-s-temp','fd-s-decision','fd-s-prevention'];
        const div = document.createElement('div');
        div.id = 'fd-detail-view';
        div.className = 'nav-view hidden';
        div.innerHTML = `
        <div style="max-width:500px; margin:0 auto;">
            <!-- Hero -->
            <div id="fd-detail-hero" style="position:relative; width:100%; border-radius:0 0 28px 28px; overflow:hidden; min-height:180px; display:flex; align-items:center; justify-content:center; padding:20px;">
                <div style="text-align:center;">
                    <div id="fd-detail-title" style="font-size:1.5rem; font-weight:900; color:var(--text-main); line-height:1.2;"></div>
                    <div id="fd-detail-subtitle" style="font-size:0.55rem; font-weight:700; color:var(--text-dim); text-transform:uppercase; letter-spacing:2px; margin-top:6px;"></div>
                </div>
                <div style="position:absolute; top:14px; left:14px;">
                    <button onclick="FruitDefects.backToList()" style="background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.15); color:#fff; font-size:0.6rem; font-weight:900; text-transform:uppercase; letter-spacing:1px; padding:6px 14px; border-radius:20px; cursor:pointer;">← Back</button>
                </div>
                <div id="fd-detail-badge" style="position:absolute; bottom:14px; left:14px; font-size:0.48rem; font-weight:900; text-transform:uppercase; letter-spacing:1px; padding:4px 12px; border-radius:20px; border:1px solid;"></div>
            </div>

            <!-- Images -->
            <div id="fd-images-container" style="padding:14px 16px 0;"></div>

            <!-- Content -->
            <div style="padding:16px;">
                ${sectionIds.map(id => `
                <div style="margin-bottom:20px;">
                    <div id="${id}-label" style="font-size:0.55rem; font-weight:900; color:var(--pulp-lime); text-transform:uppercase; letter-spacing:2px; margin-bottom:8px; padding-bottom:4px; border-bottom:1px solid var(--border-glass);"></div>
                    <div id="${id}-content" style="font-size:0.88rem; color:var(--text-dim); line-height:1.8; font-weight:500;"></div>
                </div>`).join('')}
                <button class="btn-main btn-back" onclick="FruitDefects.backToList()">← Back</button>
            </div>
        </div>`;
        document.body.appendChild(div);
    }

    return { open, selectType, openDefect, backToTypeView, backToList, backToMiddleHub };
})();
