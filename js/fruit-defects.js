// ============================================================
// PULP PRO — FRUIT DEFECTS LIBRARY v2
// Triggered from Banana/Mango/Avocado → Defects button
// Does NOT affect defect-detector.js (camera feature)
// ============================================================

const FruitDefects = (() => {

    let activeFruit = null;
    let activeType  = null;
    let activeDefect = null;

    // ── HELPERS ───────────────────────────────────────────────
    function getLang() {
        if (typeof currentLang !== 'undefined') return currentLang;
        return localStorage.getItem('pulpLang') || 'en';
    }

    function sevColor(s) {
        if (s === 'critical') return '#ff4d4d';
        if (s === 'major')    return '#ff8c00';
        return '#78c830';
    }

    function sevLabel(s, nl) {
        if (s === 'critical') return nl ? 'Kritiek'  : 'Critical';
        if (s === 'major')    return nl ? 'Groot'    : 'Major';
        return nl ? 'Klein' : 'Minor';
    }

    function detectionLabel(d, nl) {
        if (d === 'hard')     return nl ? '🔴 Moeilijk te detecteren' : '🔴 Hard to detect';
        if (d === 'moderate') return nl ? '🟡 Matig detecteerbaar'    : '🟡 Moderate detection';
        return nl ? '🟢 Makkelijk te detecteren' : '🟢 Easy to detect';
    }

    function categoryColor(cat) {
        if (!cat) return 'rgba(255,255,255,0.08)';
        const c = cat.toLowerCase();
        if (c.includes('fungal') || c.includes('schimmel'))    return 'rgba(255,77,77,0.12)';
        if (c.includes('mechanic') || c.includes('mechanisch')) return 'rgba(255,140,0,0.12)';
        if (c.includes('temperature') || c.includes('temperatu')) return 'rgba(100,160,255,0.12)';
        if (c.includes('physiol') || c.includes('fysiolog'))   return 'rgba(166,226,46,0.10)';
        if (c.includes('field') || c.includes('veld'))         return 'rgba(100,220,160,0.10)';
        if (c.includes('packing') || c.includes('verpak'))     return 'rgba(200,150,255,0.10)';
        return 'rgba(255,255,255,0.08)';
    }

    // ── SHOW VIEW ─────────────────────────────────────────────
    function showView(id) {
        // Hide all nav views
        document.querySelectorAll('.nav-view').forEach(el => el.classList.add('hidden'));
        const target = document.getElementById(id);
        if (target) {
            target.classList.remove('hidden');
            window.scrollTo(0, 0);
        }
    }

    // ── OPEN DEFECT LIBRARY ───────────────────────────────────
    function open(fruit) {
        activeFruit = fruit;
        ensureViews();
        const lang = getLang();
        const nl = lang === 'nl';

        const fruitNames = {
            banana:  nl ? 'Banaan' : 'Banana',
            mango:   'Mango',
            avocado: 'Avocado'
        };
        const fruitEmojis = { banana: '🍌', mango: '🥭', avocado: '🥑' };

        const titleEl = document.getElementById('fd-type-title');
        if (titleEl) titleEl.innerText = fruitEmojis[fruit] + ' ' + (fruitNames[fruit] || fruit);

        const subEl = document.getElementById('fd-type-sub');
        if (subEl) subEl.innerText = nl ? 'Selecteer gebreken categorie' : 'Select defect category';

        // Count defects
        const data = FRUIT_DEFECTS[fruit] || {};
        const extCount = (data.external || []).length;
        const intCount = (data.internal || []).length;

        const extBtn = document.getElementById('fd-ext-btn');
        const intBtn = document.getElementById('fd-int-btn');

        if (extBtn) {
            extBtn.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px; padding:18px 20px;">
                <div style="font-size:1.8rem; width:44px; text-align:center; flex-shrink:0;">🔍</div>
                <div style="flex:1;">
                    <div style="font-size:0.88rem; font-weight:900; color:var(--text-main); margin-bottom:3px;">${nl ? 'Externe Gebreken' : 'External Defects'}</div>
                    <div style="font-size:0.6rem; color:var(--text-dim); font-weight:600;">${nl ? 'Schil, kneuzing, schimmel, veldschade' : 'Skin, bruising, fungal, field damage'}</div>
                </div>
                <div style="background:var(--pulp-lime); color:#000; font-size:0.65rem; font-weight:900; padding:4px 10px; border-radius:20px; flex-shrink:0;">${extCount}</div>
                <div style="color:var(--text-dim); font-size:1.2rem; flex-shrink:0;">›</div>
            </div>`;
        }

        if (intBtn) {
            intBtn.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px; padding:18px 20px;">
                <div style="font-size:1.8rem; width:44px; text-align:center; flex-shrink:0;">🔬</div>
                <div style="flex:1;">
                    <div style="font-size:0.88rem; font-weight:900; color:var(--text-main); margin-bottom:3px;">${nl ? 'Interne Gebreken' : 'Internal Defects'}</div>
                    <div style="font-size:0.6rem; color:var(--text-dim); font-weight:600;">${nl ? 'Vruchtvlees, vaatbundels, pit, verval' : 'Flesh, vascular, seed cavity, breakdown'}</div>
                </div>
                <div style="background:var(--pulp-lime); color:#000; font-size:0.65rem; font-weight:900; padding:4px 10px; border-radius:20px; flex-shrink:0;">${intCount}</div>
                <div style="color:var(--text-dim); font-size:1.2rem; flex-shrink:0;">›</div>
            </div>`;
        }

        showView('fd-type-view');
    }

    // ── SELECT TYPE ───────────────────────────────────────────
    function selectType(type) {
        activeType = type;
        const lang = getLang();
        const nl = lang === 'nl';
        const data = FRUIT_DEFECTS[activeFruit] || {};
        const defects = data[type] || [];

        const fruitNames = { banana: nl ? 'Banaan' : 'Banana', mango: 'Mango', avocado: 'Avocado' };
        const typeLabel = type === 'external'
            ? (nl ? 'Externe Gebreken' : 'External Defects')
            : (nl ? 'Interne Gebreken' : 'Internal Defects');

        const titleEl = document.getElementById('fd-list-title');
        if (titleEl) titleEl.innerText = (fruitNames[activeFruit] || activeFruit) + ' — ' + typeLabel;

        const container = document.getElementById('fd-list-container');
        if (!container) return;

        if (defects.length === 0) {
            container.innerHTML = `<div style="padding:40px; text-align:center; color:var(--text-dim); font-size:0.7rem;">${nl ? 'Binnenkort beschikbaar' : 'Coming soon'}</div>`;
        } else {
            // Group by category
            const byCategory = {};
            defects.forEach(def => {
                const d = def[lang] || def['en'];
                const cat = d.category || (lang === 'nl' ? 'Overig' : 'Other');
                if (!byCategory[cat]) byCategory[cat] = [];
                byCategory[cat].push(def);
            });

            container.innerHTML = Object.entries(byCategory).map(([cat, defs]) => `
            <div style="margin-bottom:12px;">
                <div style="font-size:0.48rem; font-weight:900; text-transform:uppercase; letter-spacing:2px; color:var(--text-dim); padding:8px 16px 6px; opacity:0.7;">${cat}</div>
                <div style="border-radius:16px; overflow:hidden; border:1px solid var(--border-glass);">
                ${defs.map((def, i) => {
                    const d = def[lang] || def['en'];
                    const col = sevColor(def.severity);
                    const sev = sevLabel(def.severity, nl);
                    const isLast = i === defs.length - 1;
                    return `
                    <div onclick="FruitDefects.openDefect('${def.id}')"
                        style="display:flex; align-items:center; gap:12px; padding:14px 16px; cursor:pointer; background:var(--glass-card); ${isLast ? '' : 'border-bottom:1px solid var(--border-glass);'} transition:background 0.15s;"
                        onmouseover="this.style.background='rgba(255,255,255,0.04)'"
                        onmouseout="this.style.background='var(--glass-card)'">
                        <div style="width:42px; height:42px; border-radius:10px; background:${col}18; border:1px solid ${col}30; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0;">${def.emoji}</div>
                        <div style="flex:1; min-width:0;">
                            <div style="font-size:0.82rem; font-weight:800; color:var(--text-main); margin-bottom:2px;">${d.name}</div>
                            <div style="font-size:0.6rem; color:var(--text-dim); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${d.shortDesc}</div>
                        </div>
                        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0;">
                            <div style="font-size:0.45rem; font-weight:900; text-transform:uppercase; letter-spacing:0.5px; padding:3px 8px; border-radius:8px; background:${col}18; color:${col}; white-space:nowrap;">${sev}</div>
                            <div style="color:var(--text-dim); font-size:1rem;">›</div>
                        </div>
                    </div>`;
                }).join('')}
                </div>
            </div>`).join('');
        }

        showView('fd-list-view');
    }

    // ── OPEN DEFECT DETAIL ────────────────────────────────────
    function openDefect(defectId) {
        const lang = getLang();
        const nl = lang === 'nl';
        const data = FRUIT_DEFECTS[activeFruit] || {};
        const allDefs = [...(data.external || []), ...(data.internal || [])];
        const def = allDefs.find(d => d.id === defectId);
        if (!def) return;

        activeDefect = def;
        const d = def[lang] || def['en'];
        const col = sevColor(def.severity);
        const sev = sevLabel(def.severity, nl);

        // ── Hero
        const hero = document.getElementById('fd-detail-hero');
        if (hero) {
            hero.style.background = `linear-gradient(135deg, ${col}30 0%, ${col}08 60%, transparent 100%)`;
            hero.innerHTML = `
            <div style="padding:20px 16px 16px;">
                <button onclick="FruitDefects.backToList()" style="background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.15); color:#fff; font-size:0.58rem; font-weight:900; text-transform:uppercase; letter-spacing:1px; padding:7px 16px; border-radius:20px; cursor:pointer; margin-bottom:16px; display:inline-block;">← ${nl ? 'Terug' : 'Back'}</button>
                <div style="display:flex; align-items:flex-start; gap:14px;">
                    <div style="font-size:2.8rem; line-height:1;">${def.emoji}</div>
                    <div style="flex:1;">
                        <div style="font-size:0.45rem; font-weight:900; text-transform:uppercase; letter-spacing:2px; color:${col}; margin-bottom:5px; opacity:0.9;">${d.category || ''}</div>
                        <div style="font-size:1.35rem; font-weight:900; color:var(--text-main); line-height:1.2; margin-bottom:6px;">${d.name}</div>
                        <div style="font-size:0.7rem; color:var(--text-dim); font-weight:600; line-height:1.4;">${d.shortDesc}</div>
                    </div>
                </div>
                <!-- Severity bar -->
                <div style="margin-top:14px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <span style="font-size:0.45rem; font-weight:900; text-transform:uppercase; letter-spacing:1px; color:var(--text-dim);">${nl ? 'Ernststniveau' : 'Severity level'}</span>
                        <span style="font-size:0.55rem; font-weight:900; color:${col}; text-transform:uppercase; letter-spacing:1px;">${sev}</span>
                    </div>
                    <div style="height:6px; background:rgba(255,255,255,0.08); border-radius:6px; overflow:hidden;">
                        <div style="height:100%; width:${(def.severityScore / 5) * 100}%; background:${col}; border-radius:6px; transition:width 0.5s ease;"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-top:3px;">
                        ${[1,2,3,4,5].map(i => `<div style="width:18%; height:2px; border-radius:2px; background:${i <= def.severityScore ? col : 'rgba(255,255,255,0.1)'};"></div>`).join('')}
                    </div>
                </div>
            </div>`;
        }

        // ── Quick Facts card
        const factsEl = document.getElementById('fd-quick-facts');
        if (factsEl) {
            factsEl.innerHTML = `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; padding:14px 16px;">
                <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-glass); border-radius:12px; padding:10px 12px;">
                    <div style="font-size:0.42rem; font-weight:900; text-transform:uppercase; letter-spacing:1px; color:var(--text-dim); margin-bottom:4px;">🌡️ ${nl ? 'Temperatuur' : 'Temperature'}</div>
                    <div style="font-size:0.65rem; font-weight:800; color:var(--text-main); line-height:1.3;">${def.tempRange || '—'}</div>
                </div>
                <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-glass); border-radius:12px; padding:10px 12px;">
                    <div style="font-size:0.42rem; font-weight:900; text-transform:uppercase; letter-spacing:1px; color:var(--text-dim); margin-bottom:4px;">📉 ${nl ? 'Houdbaarheid' : 'Shelf impact'}</div>
                    <div style="font-size:0.65rem; font-weight:800; color:var(--text-main); line-height:1.3;">${def.shelfImpact || '—'}</div>
                </div>
                <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-glass); border-radius:12px; padding:10px 12px; grid-column:1/-1;">
                    <div style="font-size:0.42rem; font-weight:900; text-transform:uppercase; letter-spacing:1px; color:var(--text-dim); margin-bottom:4px;">👁️ ${nl ? 'Detectie' : 'Detection difficulty'}</div>
                    <div style="font-size:0.65rem; font-weight:800; color:var(--text-main);">${detectionLabel(def.detection, nl)}</div>
                </div>
            </div>`;
        }

        // ── Images
        renderDetailImages(def.images || []);

        // ── Content sections
        renderSections(d, nl, col);

        showView('fd-detail-view');
    }

    // ── RENDER IMAGES ─────────────────────────────────────────
    function renderDetailImages(images) {
        const container = document.getElementById('fd-images-container');
        if (!container) return;

        const validImages = images.filter(src => src && src.trim() !== '');

        if (validImages.length === 0) {
            container.innerHTML = `
            <div style="margin:0 16px 16px; height:130px; background:var(--glass-card); border:1px dashed rgba(255,255,255,0.1); border-radius:16px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;">
                <span style="font-size:1.8rem; opacity:0.4;">📷</span>
                <span style="font-size:0.48rem; color:rgba(255,255,255,0.2); font-weight:700; text-transform:uppercase; letter-spacing:1px;">Add photos to images/defects/</span>
            </div>`;
            return;
        }

        if (validImages.length === 1) {
            container.innerHTML = `
            <div style="margin:0 16px 16px; border-radius:16px; overflow:hidden; background:var(--glass-card);">
                <img src="${validImages[0]}" alt="Defect photo" style="width:100%; display:block; object-fit:cover; max-height:220px; border-radius:16px;"
                    onerror="this.parentElement.innerHTML='<div style=\'height:110px;display:flex;align-items:center;justify-content:center;gap:8px;background:var(--glass-card);border-radius:16px\'><span style=\'font-size:1.5rem;opacity:0.3\'>📷</span><span style=\'font-size:0.46rem;color:rgba(255,255,255,0.2);text-transform:uppercase;letter-spacing:1px\'>Photo not found</span></div>'">
            </div>`;
        } else {
            // Horizontal scroll gallery
            container.innerHTML = `
            <div style="display:flex; gap:10px; overflow-x:auto; padding:0 16px 16px; scrollbar-width:none;">
                ${validImages.map((src, i) => `
                <div style="flex-shrink:0; width:${validImages.length === 2 ? 'calc(50% - 5px)' : '68%'}; border-radius:14px; overflow:hidden; background:var(--glass-card);">
                    <img src="${src}" alt="Defect photo ${i+1}" style="width:100%; height:180px; object-fit:cover; display:block; border-radius:14px;"
                        onerror="this.parentElement.innerHTML='<div style=\'height:180px;display:flex;align-items:center;justify-content:center;background:var(--glass-card);border-radius:14px\'><span style=\'font-size:0.46rem;color:rgba(255,255,255,0.2);text-transform:uppercase;letter-spacing:1px\'>Photo not found</span></div>'">
                </div>`).join('')}
            </div>`;
        }
    }

    // ── RENDER CONTENT SECTIONS ───────────────────────────────
    function renderSections(d, nl, col) {
        const container = document.getElementById('fd-sections-container');
        if (!container) return;

        const sections = [];

        // What is it
        if (d.whatIsIt) {
            sections.push({
                icon: '🔬',
                label: nl ? 'Wat is het?' : 'What is it?',
                content: renderText(d.whatIsIt)
            });
        }

        // How to identify
        if (d.howToIdentify) {
            sections.push({
                icon: '👁️',
                label: nl ? 'Hoe te herkennen' : 'How to identify',
                content: renderText(d.howToIdentify)
            });
        }

        // Causes — bullet list
        if (d.causes) {
            sections.push({
                icon: '⚙️',
                label: nl ? 'Oorzaken' : 'Causes',
                content: renderList(d.causes)
            });
        }

        // Shipment impact
        if (d.shipmentImpact) {
            sections.push({
                icon: '🚢',
                label: nl ? 'Impact op transport' : 'Shipment impact',
                content: renderText(d.shipmentImpact)
            });
        }

        // Temperature
        if (d.temperatureEffects) {
            sections.push({
                icon: '🌡️',
                label: nl ? 'Temperatuureffecten' : 'Temperature effects',
                content: renderText(d.temperatureEffects)
            });
        }

        // Accept / Reject — traffic light
        if (d.acceptReject) {
            sections.push({
                icon: '🚦',
                label: nl ? 'Accepteren / Afkeuren' : 'Accept / Reject guide',
                content: renderTrafficLight(d.acceptReject, nl)
            });
        }

        // Prevention — bullet list
        if (d.prevention) {
            sections.push({
                icon: '🛡️',
                label: nl ? 'Preventie' : 'Prevention',
                content: renderList(d.prevention)
            });
        }

        container.innerHTML = sections.map(sec => `
        <div style="margin-bottom:18px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid var(--border-glass);">
                <span style="font-size:1rem;">${sec.icon}</span>
                <span style="font-size:0.52rem; font-weight:900; color:var(--pulp-lime); text-transform:uppercase; letter-spacing:2px;">${sec.label}</span>
            </div>
            ${sec.content}
        </div>`).join('');
    }

    function renderText(text) {
        if (!text) return '';
        return `<p style="font-size:0.85rem; color:var(--text-dim); line-height:1.75; font-weight:500; margin:0;">${text}</p>`;
    }

    function renderList(items) {
        if (!items || !items.length) return '';
        if (typeof items === 'string') return renderText(items);
        return `<ul style="margin:0; padding-left:0; list-style:none; display:flex; flex-direction:column; gap:7px;">
            ${items.map(item => `
            <li style="display:flex; align-items:flex-start; gap:10px; font-size:0.83rem; color:var(--text-dim); line-height:1.55; font-weight:500;">
                <span style="color:var(--pulp-lime); font-size:0.6rem; margin-top:5px; flex-shrink:0;">●</span>
                <span>${item}</span>
            </li>`).join('')}
        </ul>`;
    }

    function renderTrafficLight(ar, nl) {
        if (!ar || typeof ar !== 'object') return renderText(ar);

        const rows = [
            { key: 'accept',    icon: '✅', color: '#78c830', label: nl ? 'Accepteren' : 'Accept',    text: ar.accept },
            { key: 'downgrade', icon: '🟡', color: '#ff8c00', label: nl ? 'Afwaarderen' : 'Downgrade', text: ar.downgrade },
            { key: 'reject',    icon: '❌', color: '#ff4d4d', label: nl ? 'Afkeuren' : 'Reject',      text: ar.reject },
        ].filter(r => r.text && r.text !== 'N/A' && r.text !== 'N/v.t.');

        return `<div style="display:flex; flex-direction:column; gap:8px;">
            ${rows.map(r => `
            <div style="display:flex; gap:12px; align-items:flex-start; padding:12px 14px; border-radius:12px; background:${r.color}12; border:1px solid ${r.color}28;">
                <span style="font-size:1.1rem; flex-shrink:0; margin-top:1px;">${r.icon}</span>
                <div>
                    <div style="font-size:0.48rem; font-weight:900; color:${r.color}; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:4px;">${r.label}</div>
                    <div style="font-size:0.82rem; color:var(--text-dim); font-weight:500; line-height:1.5;">${r.text}</div>
                </div>
            </div>`).join('')}
        </div>`;
    }

    // ── BACK NAVIGATION ───────────────────────────────────────
    function backToTypeView() {
        showView('fd-type-view');
    }

    function backToList() {
        selectType(activeType);
    }

    function backToMiddleHub() {
        ['fd-type-view','fd-list-view','fd-detail-view'].forEach(v => {
            const el = document.getElementById(v);
            if (el) el.classList.add('hidden');
        });
        const mh = document.getElementById('middle-hub');
        if (mh) mh.classList.remove('hidden');
    }

    // ── BUILD VIEWS ───────────────────────────────────────────
    function ensureViews() {
        if (!document.getElementById('fd-type-view'))   buildTypeView();
        if (!document.getElementById('fd-list-view'))   buildListView();
        if (!document.getElementById('fd-detail-view')) buildDetailView();
    }

    function buildTypeView() {
        const div = document.createElement('div');
        div.id = 'fd-type-view';
        div.className = 'nav-view hidden';
        div.innerHTML = `
        <div style="max-width:500px; margin:0 auto; padding:0 4px;">
            <div class="hub-title" id="fd-type-title"></div>
            <div id="fd-type-sub" style="text-align:center; font-size:0.55rem; font-weight:700; color:var(--text-dim); text-transform:uppercase; letter-spacing:2px; margin:-10px 0 24px;"></div>
            <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:24px;">
                <button id="fd-ext-btn" onclick="FruitDefects.selectType('external')"
                    style="width:100%; background:var(--glass-card); border:1px solid var(--border-glass); border-radius:18px; cursor:pointer; text-align:left; transition:background 0.15s;"
                    onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='var(--glass-card)'"></button>
                <button id="fd-int-btn" onclick="FruitDefects.selectType('internal')"
                    style="width:100%; background:var(--glass-card); border:1px solid var(--border-glass); border-radius:18px; cursor:pointer; text-align:left; transition:background 0.15s;"
                    onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='var(--glass-card)'"></button>
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
            <div class="hub-title" id="fd-list-title"></div>
            <div id="fd-list-container" style="margin-bottom:16px;"></div>
            <button class="btn-main btn-back" onclick="FruitDefects.backToTypeView()">← Back</button>
        </div>`;
        document.body.appendChild(div);
    }

    function buildDetailView() {
        const div = document.createElement('div');
        div.id = 'fd-detail-view';
        div.className = 'nav-view hidden';
        div.style.paddingBottom = '30px';
        div.innerHTML = `
        <div style="max-width:500px; margin:0 auto;">
            <!-- Hero with severity bar -->
            <div id="fd-detail-hero" style="border-radius:0 0 28px 28px; overflow:hidden; margin-bottom:2px;"></div>

            <!-- Quick facts -->
            <div id="fd-quick-facts" style="margin:0 16px 14px; background:var(--glass-card); border:1px solid var(--border-glass); border-radius:18px; overflow:hidden;"></div>

            <!-- Image gallery -->
            <div id="fd-images-container"></div>

            <!-- Sections -->
            <div id="fd-sections-container" style="padding:0 16px;"></div>

            <!-- Bottom back button -->
            <div style="padding:8px 16px 0;">
                <button class="btn-main btn-back" onclick="FruitDefects.backToList()">← Back</button>
            </div>
        </div>`;
        document.body.appendChild(div);
    }

    return { open, selectType, openDefect, backToTypeView, backToList, backToMiddleHub };
})();
