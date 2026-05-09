// ============================================================
// PULP PRO — FRUIT DEFECTS LIBRARY v2
// Triggered from Banana/Mango/Avocado → Defects button
// Does NOT affect defect-detector.js (camera feature)
// ============================================================

const FruitDefects = (() => {

    let activeFruit  = null;
    let activeType   = null;
    let activeDefect = null;

    // ── FULLSCREEN VIEWER ─────────────────────────────────────
    let fsImages      = [];
    let fsIndex       = 0;
    let fsTouchStartX = 0;

    function openFullscreen(images, index) {
        fsImages = images;
        fsIndex  = index;

        let overlay = document.getElementById('fd-fs-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'fd-fs-overlay';
            overlay.style.cssText = `
                position:fixed; inset:0; z-index:99999;
                background:#000; display:flex; flex-direction:column;
                touch-action:pan-y;
            `;
            overlay.addEventListener('touchstart', e => { fsTouchStartX = e.touches[0].clientX; }, { passive: true });
            overlay.addEventListener('touchend',   e => {
                const dx = e.changedTouches[0].clientX - fsTouchStartX;
                if (Math.abs(dx) > 50) dx < 0 ? fsNext() : fsPrev();
            }, { passive: true });
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        renderFsContent();
    }

    function renderFsContent() {
        const overlay = document.getElementById('fd-fs-overlay');
        if (!overlay) return;
        const src   = fsImages[fsIndex];
        const total = fsImages.length;

        overlay.innerHTML = `
        <div style="position:absolute; top:0; left:0; right:0; z-index:10;
            display:flex; align-items:center; justify-content:space-between;
            padding:max(env(safe-area-inset-top,14px),14px) 20px 14px;
            background:linear-gradient(to bottom,rgba(0,0,0,0.88) 0%,transparent 100%);">
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="edited-image.png" style="width:30px; height:30px; border-radius:8px; opacity:0.92;">
                <span style="font-size:0.68rem; font-weight:900; color:var(--pulp-lime); letter-spacing:3px; text-transform:uppercase;">PULP PRO</span>
            </div>
            ${total > 1 ? `<span style="font-size:0.62rem; font-weight:700; color:rgba(255,255,255,0.5); letter-spacing:1px;">${fsIndex + 1} / ${total}</span>` : ''}
            <button onclick="FruitDefects.closeFullscreen()"
                style="background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.22);
                color:#fff; font-size:1rem; width:36px; height:36px;
                border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;">✕</button>
        </div>

        <div style="flex:1; display:flex; align-items:center; justify-content:center; padding:70px 0 90px; overflow:hidden;">
            <img src="${src}" alt="Defect photo"
                style="max-width:100%; max-height:100%; object-fit:contain; display:block; user-select:none;"
                onerror="this.style.display='none'; document.getElementById('fd-fs-err').style.display='flex';">
            <div id="fd-fs-err" style="display:none; flex-direction:column; align-items:center; gap:12px; color:rgba(255,255,255,0.3);">
                <span style="font-size:3rem;">📷</span>
                <span style="font-size:0.65rem; text-transform:uppercase; letter-spacing:1px;">Photo not found</span>
            </div>
        </div>

        ${total > 1 ? `
        <div style="position:absolute; bottom:0; left:0; right:0; z-index:10;
            display:flex; align-items:center; justify-content:center; gap:20px;
            padding:16px 20px max(env(safe-area-inset-bottom,18px),18px);
            background:linear-gradient(to top,rgba(0,0,0,0.88) 0%,transparent 100%);">
            <button onclick="FruitDefects.fsPrev()"
                style="background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.22);
                color:#fff; font-size:1.3rem; width:50px; height:50px;
                border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;
                opacity:${fsIndex === 0 ? '0.2' : '1'};">‹</button>
            <div style="display:flex; gap:7px; align-items:center;">
                ${fsImages.map((_, i) => `
                <div style="width:${i === fsIndex ? '20px' : '7px'}; height:7px; border-radius:4px;
                    background:${i === fsIndex ? 'var(--pulp-lime)' : 'rgba(255,255,255,0.25)'};
                    transition:all 0.2s;"></div>`).join('')}
            </div>
            <button onclick="FruitDefects.fsNext()"
                style="background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.22);
                color:#fff; font-size:1.3rem; width:50px; height:50px;
                border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;
                opacity:${fsIndex === total - 1 ? '0.2' : '1'};">›</button>
        </div>` : `
        <div style="position:absolute; bottom:0; left:0; right:0; z-index:10; text-align:center;
            padding:14px 20px max(env(safe-area-inset-bottom,16px),16px);
            background:linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 100%);">
            <span style="font-size:0.55rem; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:1px;">Tap ✕ to close</span>
        </div>`}`;
    }

    function closeFullscreen() {
        const o = document.getElementById('fd-fs-overlay');
        if (o) o.style.display = 'none';
        document.body.style.overflow = '';
    }

    function fsNext() { if (fsIndex < fsImages.length - 1) { fsIndex++; renderFsContent(); } }
    function fsPrev() { if (fsIndex > 0)                   { fsIndex--; renderFsContent(); } }

    // ── HELPERS ───────────────────────────────────────────────
    function getLang() {
        if (typeof currentLang !== 'undefined') return currentLang;
        return localStorage.getItem('pulpLang') || 'en';
    }
    function isPC() { return window.innerWidth >= 900; }

    function sevColor(s) {
        if (s === 'critical') return '#ff4d4d';
        if (s === 'major')    return '#ff8c00';
        return '#78c830';
    }
    function sevLabel(s, nl) {
        if (s === 'critical') return nl ? 'Kritiek' : 'Critical';
        if (s === 'major')    return nl ? 'Groot'   : 'Major';
        return nl ? 'Klein' : 'Minor';
    }
    function detectionLabel(d, nl) {
        if (d === 'hard')     return nl ? '🔴 Moeilijk te detecteren' : '🔴 Hard to detect';
        if (d === 'moderate') return nl ? '🟡 Matig detecteerbaar'    : '🟡 Moderate detection';
        return nl ? '🟢 Makkelijk te detecteren' : '🟢 Easy to detect';
    }

    // ── SHOW VIEW ─────────────────────────────────────────────
    function showView(id) {
        document.querySelectorAll('.nav-view').forEach(el => el.classList.add('hidden'));
        const target = document.getElementById(id);
        if (target) { target.classList.remove('hidden'); window.scrollTo(0, 0); }
    }

    // ── OPEN DEFECT LIBRARY ───────────────────────────────────
    function open(fruit) {
        activeFruit = fruit;
        ensureViews();
        const lang = getLang();
        const nl   = lang === 'nl';
        const fruitNames  = { banana: nl ? 'Banaan' : 'Banana', mango: 'Mango', avocado: 'Avocado' };
        const fruitEmojis = { banana: '🍌', mango: '🥭', avocado: '🥑' };

        const titleEl = document.getElementById('fd-type-title');
        if (titleEl) titleEl.innerText = fruitEmojis[fruit] + ' ' + (fruitNames[fruit] || fruit);

        const subEl = document.getElementById('fd-type-sub');
        if (subEl) subEl.innerText = nl ? 'Selecteer gebreken categorie' : 'Select defect category';

        const data     = FRUIT_DEFECTS[fruit] || {};
        const extCount = (data.external || []).length;
        const intCount = (data.internal || []).length;

        const extBtn = document.getElementById('fd-ext-btn');
        const intBtn = document.getElementById('fd-int-btn');

        if (extBtn) extBtn.innerHTML = `
        <div style="display:flex; align-items:center; gap:14px; padding:20px 22px;">
            <div style="font-size:2rem; width:46px; text-align:center; flex-shrink:0;">🔍</div>
            <div style="flex:1;">
                <div style="font-size:0.95rem; font-weight:900; color:var(--text-main); margin-bottom:4px;">${nl ? 'Externe Gebreken' : 'External Defects'}</div>
                <div style="font-size:0.68rem; color:var(--text-dim); font-weight:600;">${nl ? 'Schil, kneuzing, schimmel, veldschade' : 'Skin, bruising, fungal, field damage'}</div>
            </div>
            <div style="background:var(--pulp-lime); color:#000; font-size:0.7rem; font-weight:900; padding:5px 12px; border-radius:20px; flex-shrink:0;">${extCount}</div>
            <div style="color:var(--text-dim); font-size:1.3rem; flex-shrink:0;">›</div>
        </div>`;

        if (intBtn) intBtn.innerHTML = `
        <div style="display:flex; align-items:center; gap:14px; padding:20px 22px;">
            <div style="font-size:2rem; width:46px; text-align:center; flex-shrink:0;">🔬</div>
            <div style="flex:1;">
                <div style="font-size:0.95rem; font-weight:900; color:var(--text-main); margin-bottom:4px;">${nl ? 'Interne Gebreken' : 'Internal Defects'}</div>
                <div style="font-size:0.68rem; color:var(--text-dim); font-weight:600;">${nl ? 'Vruchtvlees, vaatbundels, pit, verval' : 'Flesh, vascular, seed cavity, breakdown'}</div>
            </div>
            <div style="background:var(--pulp-lime); color:#000; font-size:0.7rem; font-weight:900; padding:5px 12px; border-radius:20px; flex-shrink:0;">${intCount}</div>
            <div style="color:var(--text-dim); font-size:1.3rem; flex-shrink:0;">›</div>
        </div>`;

        showView('fd-type-view');
    }

    // ── SELECT TYPE ───────────────────────────────────────────
    function selectType(type) {
        activeType = type;
        const lang    = getLang();
        const nl      = lang === 'nl';
        const data    = FRUIT_DEFECTS[activeFruit] || {};
        const defects = data[type] || [];
        const fruitNames = { banana: nl ? 'Banaan' : 'Banana', mango: 'Mango', avocado: 'Avocado' };
        const typeLabel  = type === 'external'
            ? (nl ? 'Externe Gebreken' : 'External Defects')
            : (nl ? 'Interne Gebreken' : 'Internal Defects');

        const titleEl = document.getElementById('fd-list-title');
        if (titleEl) titleEl.innerText = (fruitNames[activeFruit] || activeFruit) + ' — ' + typeLabel;

        const container = document.getElementById('fd-list-container');
        if (!container) return;

        if (defects.length === 0) {
            container.innerHTML = `<div style="padding:40px; text-align:center; color:var(--text-dim); font-size:0.82rem;">${nl ? 'Binnenkort beschikbaar' : 'Coming soon'}</div>`;
        } else {
            const byCategory = {};
            defects.forEach(def => {
                const d   = def[lang] || def['en'];
                const cat = d.category || (nl ? 'Overig' : 'Other');
                if (!byCategory[cat]) byCategory[cat] = [];
                byCategory[cat].push(def);
            });

            container.innerHTML = Object.entries(byCategory).map(([cat, defs]) => `
            <div style="margin-bottom:14px;">
                <div style="font-size:0.58rem; font-weight:900; text-transform:uppercase; letter-spacing:2px; color:var(--text-dim); padding:8px 16px 6px; opacity:0.7;">${cat}</div>
                <div style="border-radius:16px; overflow:hidden; border:1px solid var(--border-glass);">
                ${defs.map((def, i) => {
                    const d      = def[lang] || def['en'];
                    const col    = sevColor(def.severity);
                    const sev    = sevLabel(def.severity, nl);
                    const isLast = i === defs.length - 1;
                    return `
                    <div onclick="FruitDefects.openDefect('${def.id}')"
                        style="display:flex; align-items:center; gap:14px; padding:16px 18px; cursor:pointer;
                        background:var(--glass-card); ${isLast ? '' : 'border-bottom:1px solid var(--border-glass);'}
                        transition:background 0.15s;"
                        onmouseover="this.style.background='rgba(255,255,255,0.05)'"
                        onmouseout="this.style.background='var(--glass-card)'">
                        <div style="width:46px; height:46px; border-radius:12px; background:${col}18;
                            border:1px solid ${col}30; display:flex; align-items:center;
                            justify-content:center; font-size:1.4rem; flex-shrink:0;">${def.emoji}</div>
                        <div style="flex:1; min-width:0;">
                            <div style="font-size:0.92rem; font-weight:800; color:var(--text-main); margin-bottom:3px;">${d.name}</div>
                            <div style="font-size:0.7rem; color:var(--text-dim); font-weight:600;
                                white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${d.shortDesc}</div>
                        </div>
                        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:5px; flex-shrink:0;">
                            <div style="font-size:0.52rem; font-weight:900; text-transform:uppercase; letter-spacing:0.5px;
                                padding:4px 10px; border-radius:8px; background:${col}18; color:${col}; white-space:nowrap;">${sev}</div>
                            <div style="color:var(--text-dim); font-size:1.1rem;">›</div>
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
        const nl   = lang === 'nl';
        const data = FRUIT_DEFECTS[activeFruit] || {};
        const allDefs = [...(data.external || []), ...(data.internal || [])];
        const def = allDefs.find(d => d.id === defectId);
        if (!def) return;

        activeDefect = def;
        const d   = def[lang] || def['en'];
        const col = sevColor(def.severity);
        const sev = sevLabel(def.severity, nl);
        const pc  = isPC();

        // ── Hero
        const hero = document.getElementById('fd-detail-hero');
        if (hero) {
            hero.style.background = `linear-gradient(135deg, ${col}30 0%, ${col}08 60%, transparent 100%)`;
            hero.innerHTML = `
            <div style="padding:${pc ? '28px 32px 24px' : '20px 16px 18px'};">
                <button onclick="FruitDefects.backToList()"
                    style="background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.15);
                    color:#fff; font-size:${pc ? '0.7rem' : '0.64rem'}; font-weight:900;
                    text-transform:uppercase; letter-spacing:1px;
                    padding:${pc ? '9px 22px' : '8px 18px'}; border-radius:20px;
                    cursor:pointer; margin-bottom:${pc ? '24px' : '18px'}; display:inline-block;">← ${nl ? 'Terug' : 'Back'}</button>
                <div style="display:flex; align-items:flex-start; gap:${pc ? '20px' : '14px'};">
                    <div style="font-size:${pc ? '3.8rem' : '2.8rem'}; line-height:1;">${def.emoji}</div>
                    <div style="flex:1;">
                        <div style="font-size:${pc ? '0.62rem' : '0.48rem'}; font-weight:900; text-transform:uppercase;
                            letter-spacing:2px; color:${col}; margin-bottom:6px; opacity:0.9;">${d.category || ''}</div>
                        <div style="font-size:${pc ? '2.1rem' : '1.4rem'}; font-weight:900;
                            color:var(--text-main); line-height:1.15; margin-bottom:${pc ? '10px' : '7px'};">${d.name}</div>
                        <div style="font-size:${pc ? '0.92rem' : '0.75rem'}; color:var(--text-dim);
                            font-weight:600; line-height:1.5;">${d.shortDesc}</div>
                    </div>
                </div>
                <div style="margin-top:${pc ? '22px' : '16px'};">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span style="font-size:${pc ? '0.62rem' : '0.5rem'}; font-weight:900;
                            text-transform:uppercase; letter-spacing:1px; color:var(--text-dim);">${nl ? 'Ernstniveau' : 'Severity level'}</span>
                        <span style="font-size:${pc ? '0.72rem' : '0.58rem'}; font-weight:900;
                            color:${col}; text-transform:uppercase; letter-spacing:1px;">${sev}</span>
                    </div>
                    <div style="height:${pc ? '8px' : '6px'}; background:rgba(255,255,255,0.08); border-radius:6px; overflow:hidden;">
                        <div style="height:100%; width:${(def.severityScore / 5) * 100}%;
                            background:${col}; border-radius:6px; transition:width 0.5s ease;"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-top:4px;">
                        ${[1,2,3,4,5].map(i => `<div style="width:18%; height:3px; border-radius:2px;
                            background:${i <= def.severityScore ? col : 'rgba(255,255,255,0.1)'};"></div>`).join('')}
                    </div>
                </div>
            </div>`;
        }

        // ── Quick facts
        const factsEl = document.getElementById('fd-quick-facts');
        if (factsEl) {
            factsEl.innerHTML = `
            <div style="display:grid; grid-template-columns:${pc ? '1fr 1fr 1fr' : '1fr 1fr'}; gap:${pc ? '12px' : '8px'}; padding:${pc ? '18px 20px' : '14px 16px'};">
                <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-glass); border-radius:12px; padding:${pc ? '14px 16px' : '11px 13px'};">
                    <div style="font-size:${pc ? '0.56rem' : '0.46rem'}; font-weight:900; text-transform:uppercase;
                        letter-spacing:1px; color:var(--text-dim); margin-bottom:5px;">🌡️ ${nl ? 'Temperatuur' : 'Temperature'}</div>
                    <div style="font-size:${pc ? '0.88rem' : '0.7rem'}; font-weight:800; color:var(--text-main); line-height:1.3;">${def.tempRange || '—'}</div>
                </div>
                <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-glass); border-radius:12px; padding:${pc ? '14px 16px' : '11px 13px'};">
                    <div style="font-size:${pc ? '0.56rem' : '0.46rem'}; font-weight:900; text-transform:uppercase;
                        letter-spacing:1px; color:var(--text-dim); margin-bottom:5px;">📉 ${nl ? 'Houdbaarheid' : 'Shelf impact'}</div>
                    <div style="font-size:${pc ? '0.88rem' : '0.7rem'}; font-weight:800; color:var(--text-main); line-height:1.3;">${def.shelfImpact || '—'}</div>
                </div>
                <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-glass); border-radius:12px;
                    padding:${pc ? '14px 16px' : '11px 13px'}; ${pc ? '' : 'grid-column:1/-1;'}">
                    <div style="font-size:${pc ? '0.56rem' : '0.46rem'}; font-weight:900; text-transform:uppercase;
                        letter-spacing:1px; color:var(--text-dim); margin-bottom:5px;">👁️ ${nl ? 'Detectie' : 'Detection'}</div>
                    <div style="font-size:${pc ? '0.88rem' : '0.7rem'}; font-weight:800; color:var(--text-main);">${detectionLabel(def.detection, nl)}</div>
                </div>
            </div>`;
        }

        // ── Images + sections
        renderDetailImages(def.images || [], pc);
        renderSections(d, nl, col, pc);

        showView('fd-detail-view');
    }

    // ── RENDER IMAGES ─────────────────────────────────────────
    function renderDetailImages(images, pc) {
        const container = document.getElementById('fd-images-container');
        if (!container) return;

        const validImages = images.filter(src => src && src.trim() !== '');
        window._fdCurrentImages = validImages;

        if (validImages.length === 0) {
            container.innerHTML = `
            <div style="height:${pc ? '240px' : '130px'}; background:var(--glass-card);
                border:1px dashed rgba(255,255,255,0.1); border-radius:16px;
                display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px;
                margin-bottom:${pc ? '0' : '16px'};">
                <span style="font-size:2.2rem; opacity:0.3;">📷</span>
                <span style="font-size:${pc ? '0.62rem' : '0.5rem'}; color:rgba(255,255,255,0.2); font-weight:700; text-transform:uppercase; letter-spacing:1px;">Add photos to images/defects/</span>
            </div>`;
            return;
        }

        if (pc) {
            // PC: stack vertically in left sticky column
            container.innerHTML = validImages.map((src, i) => `
            <div style="border-radius:16px; overflow:hidden; background:var(--glass-card);
                cursor:pointer; position:relative; ${i > 0 ? 'margin-top:14px;' : ''}"
                onclick="FruitDefects.openFullscreen(window._fdCurrentImages, ${i})">
                <img src="${src}" alt="Defect photo ${i+1}"
                    style="width:100%; display:block; object-fit:cover; max-height:340px; border-radius:16px;"
                    onerror="this.parentElement.style.cursor='default'; this.parentElement.onclick=null;
                    this.parentElement.innerHTML='<div style=\'height:160px;display:flex;align-items:center;justify-content:center;background:var(--glass-card);border-radius:16px\'><span style=\'font-size:0.58rem;color:rgba(255,255,255,0.2);text-transform:uppercase;letter-spacing:1px\'>Photo not found</span></div>'">
                <div style="position:absolute; bottom:12px; right:12px; background:rgba(0,0,0,0.6);
                    border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:7px 12px;
                    font-size:0.85rem; pointer-events:none;">🔍</div>
            </div>`).join('');
        } else if (validImages.length === 1) {
            container.innerHTML = `
            <div style="margin:0 0 16px; border-radius:16px; overflow:hidden;
                background:var(--glass-card); cursor:pointer; position:relative;"
                onclick="FruitDefects.openFullscreen(window._fdCurrentImages, 0)">
                <img src="${validImages[0]}" alt="Defect photo"
                    style="width:100%; display:block; object-fit:cover; max-height:230px; border-radius:16px;"
                    onerror="this.parentElement.style.cursor='default'; this.parentElement.onclick=null;
                    this.parentElement.innerHTML='<div style=\'height:120px;display:flex;align-items:center;justify-content:center;gap:8px;background:var(--glass-card);border-radius:16px\'><span style=\'font-size:1.5rem;opacity:0.3\'>📷</span><span style=\'font-size:0.52rem;color:rgba(255,255,255,0.2);text-transform:uppercase;letter-spacing:1px\'>Photo not found</span></div>'">
                <div style="position:absolute; bottom:10px; right:10px; background:rgba(0,0,0,0.6);
                    border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:5px 10px;
                    font-size:0.78rem; pointer-events:none;">🔍</div>
            </div>`;
        } else {
            container.innerHTML = `
            <div style="display:flex; gap:10px; overflow-x:auto; padding:0 0 16px;
                scrollbar-width:none; -webkit-overflow-scrolling:touch;">
                ${validImages.map((src, i) => `
                <div style="flex-shrink:0; width:${validImages.length === 2 ? 'calc(50% - 5px)' : '70%'};
                    border-radius:14px; overflow:hidden; background:var(--glass-card);
                    cursor:pointer; position:relative;"
                    onclick="FruitDefects.openFullscreen(window._fdCurrentImages, ${i})">
                    <img src="${src}" alt="Defect photo ${i+1}"
                        style="width:100%; height:195px; object-fit:cover; display:block; border-radius:14px;"
                        onerror="this.parentElement.style.cursor='default'; this.parentElement.onclick=null;
                        this.parentElement.innerHTML='<div style=\'height:195px;display:flex;align-items:center;justify-content:center;background:var(--glass-card);border-radius:14px\'><span style=\'font-size:0.52rem;color:rgba(255,255,255,0.2);text-transform:uppercase;letter-spacing:1px\'>Photo not found</span></div>'">
                    <div style="position:absolute; bottom:8px; right:8px; background:rgba(0,0,0,0.6);
                        border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:4px 9px;
                        font-size:0.72rem; pointer-events:none;">🔍</div>
                </div>`).join('')}
            </div>`;
        }
    }

    // ── RENDER CONTENT SECTIONS ───────────────────────────────
    function renderSections(d, nl, col, pc) {
        const container = document.getElementById('fd-sections-container');
        if (!container) return;

        const sections = [];
        if (d.whatIsIt)           sections.push({ icon:'🔬', label: nl ? 'Wat is het?'           : 'What is it?',          content: renderText(d.whatIsIt, pc) });
        if (d.howToIdentify)      sections.push({ icon:'👁️', label: nl ? 'Hoe te herkennen'      : 'How to identify',      content: renderText(d.howToIdentify, pc) });
        if (d.causes)             sections.push({ icon:'⚙️', label: nl ? 'Oorzaken'              : 'Causes',               content: renderList(d.causes, pc) });
        if (d.shipmentImpact)     sections.push({ icon:'🚢', label: nl ? 'Impact op transport'   : 'Shipment impact',      content: renderText(d.shipmentImpact, pc) });
        if (d.temperatureEffects) sections.push({ icon:'🌡️', label: nl ? 'Temperatuureffecten'   : 'Temperature effects',  content: renderText(d.temperatureEffects, pc) });
        if (d.acceptReject)       sections.push({ icon:'🚦', label: nl ? 'Accepteren / Afkeuren' : 'Accept / Reject guide', content: renderTrafficLight(d.acceptReject, nl, pc) });
        if (d.prevention)         sections.push({ icon:'🛡️', label: nl ? 'Preventie'             : 'Prevention',           content: renderList(d.prevention, pc) });

        const labelFs   = pc ? '0.7rem'  : '0.58rem';
        const labelIcon = pc ? '1.25rem' : '1rem';
        const mb        = pc ? '30px'    : '20px';
        const pbHead    = pc ? '12px'    : '9px';
        const mbHead    = pc ? '16px'    : '11px';

        container.innerHTML = sections.map(sec => `
        <div style="margin-bottom:${mb};">
            <div style="display:flex; align-items:center; gap:9px; margin-bottom:${mbHead}; padding-bottom:${pbHead}; border-bottom:1px solid var(--border-glass);">
                <span style="font-size:${labelIcon};">${sec.icon}</span>
                <span style="font-size:${labelFs}; font-weight:900; color:var(--pulp-lime); text-transform:uppercase; letter-spacing:2px;">${sec.label}</span>
            </div>
            ${sec.content}
        </div>`).join('');
    }

    function renderText(text, pc) {
        if (!text) return '';
        const fs = pc ? '1.05rem' : '0.92rem';
        return `<p style="font-size:${fs}; color:var(--text-dim); line-height:1.85; font-weight:500; margin:0;">${text}</p>`;
    }

    function renderList(items, pc) {
        if (!items || !items.length) return '';
        if (typeof items === 'string') return renderText(items, pc);
        const fs  = pc ? '1.02rem' : '0.9rem';
        const gap = pc ? '12px'    : '8px';
        return `<ul style="margin:0; padding-left:0; list-style:none; display:flex; flex-direction:column; gap:${gap};">
            ${items.map(item => `
            <li style="display:flex; align-items:flex-start; gap:12px; font-size:${fs}; color:var(--text-dim); line-height:1.65; font-weight:500;">
                <span style="color:var(--pulp-lime); font-size:0.55rem; margin-top:${pc ? '7px' : '5px'}; flex-shrink:0;">●</span>
                <span>${item}</span>
            </li>`).join('')}
        </ul>`;
    }

    function renderTrafficLight(ar, nl, pc) {
        if (!ar || typeof ar !== 'object') return renderText(ar, pc);

        const rows = [
            { icon:'✅', color:'#78c830', label: nl ? 'Accepteren' : 'Accept',    text: ar.accept },
            { icon:'🟡', color:'#ff8c00', label: nl ? 'Afwaarderen': 'Downgrade', text: ar.downgrade },
            { icon:'❌', color:'#ff4d4d', label: nl ? 'Afkeuren'   : 'Reject',    text: ar.reject },
        ].filter(r => r.text && r.text !== 'N/A' && r.text !== 'N/v.t.');

        const pad    = pc ? '18px 22px' : '13px 15px';
        const iconFs = pc ? '1.4rem'    : '1.15rem';
        const labFs  = pc ? '0.62rem'   : '0.52rem';
        const txtFs  = pc ? '1rem'      : '0.88rem';
        const gap    = pc ? '14px'      : '9px';

        return `<div style="display:flex; flex-direction:column; gap:${gap};">
            ${rows.map(r => `
            <div style="display:flex; gap:14px; align-items:flex-start; padding:${pad}; border-radius:14px; background:${r.color}12; border:1px solid ${r.color}28;">
                <span style="font-size:${iconFs}; flex-shrink:0; margin-top:2px;">${r.icon}</span>
                <div>
                    <div style="font-size:${labFs}; font-weight:900; color:${r.color}; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:5px;">${r.label}</div>
                    <div style="font-size:${txtFs}; color:var(--text-dim); font-weight:500; line-height:1.65;">${r.text}</div>
                </div>
            </div>`).join('')}
        </div>`;
    }

    // ── BACK NAVIGATION ───────────────────────────────────────
    function backToTypeView() { showView('fd-type-view'); }
    function backToList()     { selectType(activeType); }

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
        <div style="max-width:520px; margin:0 auto; padding:0 8px;">
            <div class="hub-title" id="fd-type-title"></div>
            <div id="fd-type-sub" style="text-align:center; font-size:0.62rem; font-weight:700; color:var(--text-dim); text-transform:uppercase; letter-spacing:2px; margin:-10px 0 26px;"></div>
            <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:26px;">
                <button id="fd-ext-btn" onclick="FruitDefects.selectType('external')"
                    style="width:100%; background:var(--glass-card); border:1px solid var(--border-glass); border-radius:20px; cursor:pointer; text-align:left; transition:background 0.15s;"
                    onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='var(--glass-card)'"></button>
                <button id="fd-int-btn" onclick="FruitDefects.selectType('internal')"
                    style="width:100%; background:var(--glass-card); border:1px solid var(--border-glass); border-radius:20px; cursor:pointer; text-align:left; transition:background 0.15s;"
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
        <div style="max-width:620px; margin:0 auto;">
            <div class="hub-title" id="fd-list-title"></div>
            <div id="fd-list-container" style="margin-bottom:18px;"></div>
            <button class="btn-main btn-back" onclick="FruitDefects.backToTypeView()">← Back</button>
        </div>`;
        document.body.appendChild(div);
    }

    function buildDetailView() {
        // Inject responsive CSS once
        if (!document.getElementById('fd-detail-style')) {
            const style = document.createElement('style');
            style.id = 'fd-detail-style';
            style.textContent = `
                /* Mobile default */
                #fd-detail-inner { max-width: 520px; margin: 0 auto; padding: 0 16px; }
                #fd-detail-hero  { overflow: hidden; margin-bottom: 6px; }
                #fd-quick-facts  { margin: 0 0 16px; background: var(--glass-card); border: 1px solid var(--border-glass); border-radius: 18px; overflow: hidden; }
                #fd-pc-wrap      { display: block; }
                #fd-images-container { margin-bottom: 4px; }

                /* PC layout ≥ 900px */
                @media (min-width: 900px) {
                    #fd-detail-inner {
                        max-width: 100%;
                        padding: 0 32px;
                    }
                    #fd-detail-hero {
                        border-radius: 0 0 32px 32px;
                        margin-bottom: 8px;
                    }
                    #fd-quick-facts {
                        margin: 0 0 24px;
                    }
                    #fd-pc-wrap {
                        display: grid;
                        grid-template-columns: 420px 1fr;
                        gap: 36px;
                        align-items: start;
                    }
                    #fd-images-container {
                        position: sticky;
                        top: 24px;
                        margin-bottom: 0;
                    }
                    #fd-sections-container {
                        padding: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        const div = document.createElement('div');
        div.id = 'fd-detail-view';
        div.className = 'nav-view hidden';
        div.style.paddingBottom = '40px';
        div.innerHTML = `
        <div>
            <div id="fd-detail-hero"></div>
            <div id="fd-detail-inner">
                <div id="fd-quick-facts"></div>
                <div id="fd-pc-wrap">
                    <div id="fd-images-container"></div>
                    <div>
                        <div id="fd-sections-container"></div>
                        <button class="btn-main btn-back" onclick="FruitDefects.backToList()" style="margin-top:10px;">← Back</button>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.appendChild(div);
    }

    return { open, selectType, openDefect, backToTypeView, backToList, backToMiddleHub, openFullscreen, closeFullscreen, fsNext, fsPrev };
})();
