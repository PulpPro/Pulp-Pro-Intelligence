// ── HOLIDAY PLANNER — exact v8 layout ─────────────────────────────────────
const HOL_WORKER = 'https://pulppro-access.pulpprobrain.workers.dev';
const HOL_MN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const HOL_DN = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const HOL_COLS = [
  '#a6e22e','#ffa500','#8899ff','#ff6eb4','#ffd700','#4ecdc4','#ff6b6b','#c084fc','#22d3ee','#f472b6',
  '#60a5fa','#fb923c','#86efac','#facc15','#e879f9','#4ade80','#93c5fd','#fca5a5','#6ee7b7','#67e8f9',
  '#f59e0b','#34d399','#818cf8','#f43f5e','#a78bfa','#2dd4bf','#fbbf24','#e11d48','#38bdf8','#84cc16',
  '#d946ef','#0ea5e9','#f97316','#10b981','#6366f1','#ec4899','#14b8a6','#eab308','#8b5cf6','#06b6d4',
  '#ef4444','#22c55e','#3b82f6','#f59e0b','#a855f7','#0891b2','#65a30d','#db2777','#0284c7','#7c3aed'
];
const HOL_NL = {
  '2026-01-01':'Nieuwjaarsdag','2026-04-03':'Goede Vrijdag','2026-04-05':'1e Paasdag',
  '2026-04-06':'2e Paasdag','2026-04-27':'Koningsdag','2026-05-05':'Bevrijdingsdag',
  '2026-05-14':'Hemelvaartsdag','2026-05-24':'1e Pinksterdag','2026-05-25':'2e Pinksterdag',
  '2026-12-25':'1e Kerstdag','2026-12-26':'2e Kerstdag'
};

let holCY = 2026, holCM = new Date().getMonth();
let holTeam = {};
let holMyCode = '';
let holEditIdx = null;

// ── HISTORY API INTEGRATION ───────────────────────────────────────────────
// Tracks which Holiday Planner sub-screen is open. Stack contains
// 'calendar', 'day', 'plan', 'cancel', or 'edit' in order opened.
let _holStack = [];
let _holSuppressPush = false;

function _pushHolState(level) {
    if (_holSuppressPush) return;
    _holStack.push(level);
    history.pushState({ pulpHolLevel: level }, '');
}

const _HOL_LEVEL_MAP = {
    'hol-ov-day':    'day',
    'hol-ov-plan':   'plan',
    'hol-ov-cancel': 'cancel',
    'hol-ov-edit':   'edit'
};

function _closeHolViewDOM() {
    document.getElementById('holiday-planner-view').classList.add('hidden');
    document.getElementById('fruit-hub').classList.remove('hidden');
    const mt = document.getElementById('menu-trigger');
    if (mt) mt.style.display = '';
}

function _closeHolOverlayDOM(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('show');
}

window.addEventListener('popstate', (e) => {
    if (_holStack.length === 0) return;

    _holSuppressPush = true;
    const level = _holStack.pop();
    switch (level) {
        case 'calendar': _closeHolViewDOM(); break;
        case 'day':      _closeHolOverlayDOM('hol-ov-day'); break;
        case 'plan':     _closeHolOverlayDOM('hol-ov-plan'); break;
        case 'cancel':   _closeHolOverlayDOM('hol-ov-cancel'); break;
        case 'edit':     _closeHolOverlayDOM('hol-ov-edit'); break;
    }
    _holSuppressPush = false;
});

// ── LOCAL DATE HELPER — never use toISOString() (UTC bug) ───────────────
function holLocalDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

// ── OPEN ──────────────────────────────────────────────────────────────────
async function holInitTile() {
    try {
        const res = await fetch(HOL_WORKER + '/holidays-all', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        const data = await res.json();
        holTeam = {};
        (data.users || []).forEach((u, i) => {
            const colour = u.userCode === 'ADMIN' ? '#a6e22e' : HOL_COLS[i % HOL_COLS.length];
            holTeam[u.userCode] = { name: u.name || u.userCode, colour, role: u.role || '', country: u.country || '', entries: u.entries || [] };
        });
        holUpdateTile();
    } catch(e) {}
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', holInitTile);
} else {
    holInitTile();
}

async function openHolidayPlanner() {
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('holiday-planner-view').classList.remove('hidden');
    const mt = document.getElementById('menu-trigger');
    if (mt) mt.style.display = 'none';

    holMyCode = localStorage.getItem('pulpProAdmin') === 'true' ? 'ADMIN' :
                (localStorage.getItem('pulpProAccessCode') || '').toUpperCase();
    holCY = new Date().getFullYear();
    holCM = new Date().getMonth();

    await holLoadTeam();
    holRender();

    if (!_holStack.includes('calendar')) {
        _pushHolState('calendar');
    }
}

function closeHolidayPlanner() {
    if (_holSuppressPush) {
        _closeHolViewDOM();
        return;
    }
    if (_holStack.length > 0) {
        const depth = _holStack.length;
        history.go(-depth);
    } else {
        _closeHolViewDOM();
    }
}

// ── LOAD ──────────────────────────────────────────────────────────────────
async function holLoadTeam() {
    try {
        const nlRes = await fetch(HOL_WORKER + '/nl-holidays', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ year: holCY })
        });
        if (nlRes.ok) {
            const nlData = await nlRes.json();
            if (Array.isArray(nlData)) {
                nlData.forEach(h => { HOL_NL[h.date] = h.localName; });
            }
        }
    } catch(e) {}

    try {
        const res = await fetch(HOL_WORKER + '/holidays-all', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        const data = await res.json();
        holTeam = {};
        (data.users || []).forEach((u, i) => {
            const colour = u.userCode === 'ADMIN' ? '#a6e22e' : HOL_COLS[i % HOL_COLS.length];
            holTeam[u.userCode] = { name: u.name || u.userCode, colour, role: u.role || '', country: u.country || '', entries: u.entries || [] };
        });
        if (!holTeam[holMyCode]) {
            const myName = localStorage.getItem('pulpProUserName') || holMyCode;
            holTeam[holMyCode] = { name: myName.split(' ')[0], colour: '#a6e22e', role: localStorage.getItem('pulpProUserRole') || '', entries: [] };
        }
        holUpdateTile();
    } catch(e) {
        console.error('Holiday load error:', e);
    }
}

async function holSave() {
    try {
        const me = holTeam[holMyCode];
        const entries = me ? me.entries : [];
        fetch(HOL_WORKER + '/holidays-save', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userCode: holMyCode, entries })
        }).catch(e => console.error('Holiday save error:', e));
        holRender();
    } catch(e) { console.error('Holiday save error:', e); }
}

// ── DATE HELPERS ──────────────────────────────────────────────────────────
function holDR(f, t) {
    const d = []; let c = new Date(f + 'T00:00:00'); const e = new Date(t + 'T00:00:00');
    while (c <= e) { d.push(holLocalDate(c)); c.setDate(c.getDate() + 1); }
    return d;
}
function holFR(f, t) {
    const o = { day: 'numeric', month: 'short' };
    const fd = new Date(f + 'T00:00:00'), td = new Date(t + 'T00:00:00');
    return f === t ? fd.toLocaleDateString('en-GB', o) : fd.toLocaleDateString('en-GB', o) + ' → ' + td.toLocaleDateString('en-GB', o);
}
function holADM() {
    const m = {};
    const myCountry = localStorage.getItem('pulpProUserCountry') || (holTeam[holMyCode]?.country || '');
    const myRole = localStorage.getItem('pulpProUserRole') || (holTeam[holMyCode]?.role || '');
    Object.entries(holTeam).forEach(([code, u]) => {
        u.entries.forEach(e => {
            holDR(e.from, e.to).forEach(d => {
                if (!m[d]) m[d] = [];
                m[d].push({ code, name: u.name, color: u.colour || u.color || '#a6e22e', country: u.country || '', role: u.role || '', from: e.from, to: e.to, note: e.note || '' });
            });
        });
    });
    Object.keys(m).forEach(d => {
        m[d].sort((a, b) => {
            const ac = holTeam[a.code]?.country || a.country || '';
            const bc = holTeam[b.code]?.country || b.country || '';
            const ar = holTeam[a.code]?.role || a.role || '';
            const br = holTeam[b.code]?.role || b.role || '';
            const aMyC = ac === myCountry ? 0 : 1;
            const bMyC = bc === myCountry ? 0 : 1;
            if (aMyC !== bMyC) return aMyC - bMyC;
            const aMyR = (myRole && ar === myRole) ? 0 : 1;
            const bMyR = (myRole && br === myRole) ? 0 : 1;
            return aMyR - bMyR;
        });
    });
    return m;
}

// ── RENDER CALENDAR ───────────────────────────────────────────────────────
function holRender() {
    const grid = document.getElementById('hol-cal');
    if (!grid) return;
    grid.innerHTML = '';
    const mlbl = document.getElementById('hol-mlbl');
    if (mlbl) mlbl.textContent = HOL_MN[holCM] + ' ' + holCY;

    const fd = new Date(holCY, holCM, 1).getDay();
    const off = fd === 0 ? 6 : fd - 1;
    const dim = new Date(holCY, holCM + 1, 0).getDate();
    const today = holLocalDate(new Date());
    const dm = holADM();
    const allRems = JSON.parse(localStorage.getItem('pulpai_reminders') || '[]');
    const remDayMap = {};
    allRems.filter(r => !r.done).forEach(r => {
        const day = r.datetime ? holLocalDate(new Date(r.datetime)) : '';
        if (day) { if (!remDayMap[day]) remDayMap[day] = []; remDayMap[day].push(r); }
    });
    const rows = Math.ceil((off + dim) / 7);
    grid.style.gridTemplateRows = `repeat(${rows},1fr)`;

    for (let i = 0; i < off; i++) {
        const c = document.createElement('div'); c.className = 'hol-cell empty'; grid.appendChild(c);
    }

    for (let d = 1; d <= dim; d++) {
        const ds = `${holCY}-${String(holCM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const people = dm[ds] || [];
        const isMe = people.some(p => p.code === holMyCode);
        const isToday = ds === today;
        const dow = (off + d - 1) % 7;
        const isWknd = dow >= 5;
        const hasMore = people.length >= 5;
        const pubHol = HOL_NL[ds] || null;

        const cell = document.createElement('div');
        cell.className = 'hol-cell' +
            (isToday ? ' hol-today' : '') +
            (people.length > 0 ? ' hol-hasp' : '') +
            (isWknd ? ' hol-wknd' : '') +
            (pubHol ? ' hol-pubhol' : '');

        const hr = document.createElement('div'); hr.className = 'hol-hlabel';
        if (pubHol) { const hn = document.createElement('div'); hn.className = 'hol-hname'; hn.textContent = pubHol; hr.appendChild(hn); }
        cell.appendChild(hr);

        const dayRems = remDayMap[ds] || [];
        const hasRem = dayRems.length > 0;
        const dn = document.createElement('div'); dn.className = 'hol-cdate';
        dn.textContent = d;
        if (isToday && hasRem) {
            const dot = document.createElement('span');
            dot.style.cssText = 'display:inline-block;width:4px;height:4px;border-radius:50%;background:rgba(180,150,255,0.9);margin-left:2px;vertical-align:middle;';
            dn.appendChild(dot);
        } else if (hasRem) {
            dn.style.background = 'rgba(136,100,255,0.85)';
            dn.style.color = '#fff';
            dn.style.borderRadius = '3px';
            dn.style.padding = '0 2px';
        } else if (isMe && !isToday) {
            dn.style.color = '#a6e22e';
            dn.style.fontWeight = '900';
        }
        cell.appendChild(dn);

        for (let t = 0; t < 4; t++) {
            const tray = document.createElement('div');
            if (people[t]) {
                tray.className = 'hol-tray hol-filled';
                tray.style.background = people[t].color;
                const s = document.createElement('div'); s.className = 'hol-tname'; s.textContent = people[t].name.split(' ')[0]; tray.appendChild(s);
            } else { tray.className = 'hol-tray hol-empty-slot'; }
            cell.appendChild(tray);
        }

        const mt = document.createElement('div'); mt.className = 'hol-tray hol-more' + (hasMore ? ' hol-more-active' : '');
        const ms = document.createElement('div'); ms.className = 'hol-mtext'; ms.textContent = hasMore ? `+${people.length - 4} more` : '';
        mt.appendChild(ms); cell.appendChild(mt);

        cell.onclick = () => holOpenDay(ds, people, d, pubHol);
        grid.appendChild(cell);
    }
}

// ── MONTH NAV ─────────────────────────────────────────────────────────────
async function holChM(dir) {
    const prevYear = holCY;
    holCM += dir;
    if (holCM > 11) { holCM = 0; holCY++; }
    if (holCM < 0) { holCM = 11; holCY--; }
    if (holCY !== prevYear) {
        try {
            const nlRes = await fetch(HOL_WORKER + '/nl-holidays', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year: holCY })
            });
            if (nlRes.ok) {
                const nlData = await nlRes.json();
                if (Array.isArray(nlData)) {
                    nlData.forEach(h => { HOL_NL[h.date] = h.localName; });
                }
            }
        } catch(e) {}
    }
    holRender();
}

// ── DAY POPUP ─────────────────────────────────────────────────────────────
function holOpenDay(ds, people, day, pubHol) {
    const d = new Date(ds + 'T00:00:00');
    const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
    document.getElementById('hol-dp-date').textContent = HOL_DN[dow] + ', ' + d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    document.getElementById('hol-dp-sub').textContent = people.length === 0 ? 'Nobody is off this day' : people.length + ' team member' + (people.length !== 1 ? 's' : '') + ' off';
    const hw = document.getElementById('hol-dp-holwrap');
    hw.innerHTML = pubHol ? `<div class="hol-pop-banner"><span style="font-size:18px;">🇳🇱</span><div><div style="font-size:13px;font-weight:800;color:#f87171;">${pubHol}</div><div style="font-size:10px;color:rgba(255,255,255,0.3);margin-top:2px;">Nederlandse feestdag</div></div></div>` : '';

    const reminders = JSON.parse(localStorage.getItem('pulpai_reminders') || '[]');
    const myRems = reminders.filter(r => !r.done && r.datetime && holLocalDate(new Date(r.datetime)) === ds);
    const rw = document.getElementById('hol-dp-remwrap');
    rw.innerHTML = myRems.length ? myRems.map(r => {
        const localTime = r.datetime ? new Date(r.datetime).toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'}) : '';
        return `<div class="hol-rem-banner">🔔 ${localTime} — ${r.text}</div>`;
    }).join('') : '';

    const myCountry = localStorage.getItem('pulpProUserCountry') || '';
    const myRole = localStorage.getItem('pulpProUserRole') || '';
    const sortedPeople = [...people].sort((a, b) => {
        const ac = holTeam[a.code]?.country || '';
        const bc = holTeam[b.code]?.country || '';
        const ar = holTeam[a.code]?.role || '';
        const br = holTeam[b.code]?.role || '';
        const aMyC = ac === myCountry ? 0 : 1;
        const bMyC = bc === myCountry ? 0 : 1;
        if (aMyC !== bMyC) return aMyC - bMyC;
        const aMyR = (myRole && ar === myRole) ? 0 : 1;
        const bMyR = (myRole && br === myRole) ? 0 : 1;
        return aMyR - bMyR;
    });

    document.getElementById('hol-dp-list').innerHTML = sortedPeople.length === 0
        ? '<div style="text-align:center;padding:20px 0;font-size:12px;color:rgba(255,255,255,0.2);">No team members off this day</div>'
        : sortedPeople.map(p => {
            const pCountry = holTeam[p.code]?.country || '';
            const countryLabel = pCountry ? ` (${pCountry})` : '';
            return `<div class="hol-pop-person">
                <div class="hol-pop-avatar" style="background:${p.color};">${p.name.slice(0, 2).toUpperCase()}</div>
                <div style="flex:1;"><div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:2px;">${p.name}${countryLabel}</div><div style="font-size:10px;color:rgba(255,255,255,0.35);">🏖️ ${holFR(p.from, p.to)}${p.note ? ' · ' + p.note : ''}</div></div>
                ${p.code === holMyCode ? '<div class="hol-pop-you">You</div>' : ''}
            </div>`;
        }).join('');

    const amOff = people.some(p => p.code === holMyCode);
    document.getElementById('hol-dp-action').innerHTML = amOff
        ? `<button class="hol-btn-ghost" style="color:rgba(255,100,100,0.7);border-color:rgba(255,77,77,0.2);" onclick="holQuickRemove('${ds}')">✕ Remove my holiday on this day</button>`
        : `<button class="hol-btn-primary" onclick="_holDayToPlan('${ds}')">🏖️ Mark as my holiday</button>`;

    holOpenOv('hol-ov-day');

    if (_holStack[_holStack.length - 1] !== 'day') {
        _pushHolState('day');
    }
}

// Transition helper: cleanly swap day popup with plan popup in history.
// The original onclick did `holCloseOv('hol-ov-day');holOpenPlan(ds)` which
// would have left a stale 'day' history entry. This replaces the top of
// the stack instead.
function _holDayToPlan(ds) {
    if (_holStack[_holStack.length - 1] === 'day') {
        _holStack[_holStack.length - 1] = 'plan';
        _holSuppressPush = true;
        history.replaceState({ pulpHolLevel: 'plan' }, '');
        _closeHolOverlayDOM('hol-ov-day');
        holOpenPlan(ds);
        _holSuppressPush = false;
    } else {
        _closeHolOverlayDOM('hol-ov-day');
        holOpenPlan(ds);
    }
}

function holQuickRemove(ds) {
    const me = holTeam[holMyCode]; if (!me) return;
    const ne = [];
    me.entries.forEach(e => {
        const dates = holDR(e.from, e.to); const idx = dates.indexOf(ds);
        if (idx === -1) { ne.push(e); return; }
        const b = dates.slice(0, idx), a = dates.slice(idx + 1);
        if (b.length) ne.push({ from: b[0], to: b[b.length - 1], note: e.note });
        if (a.length) ne.push({ from: a[0], to: a[a.length - 1], note: e.note });
    });
    me.entries = ne;
    holCloseOv('hol-ov-day');
    holSave();
}

// ── PLAN POPUP ────────────────────────────────────────────────────────────
function holSetDropdowns(prefix, dateStr) {
    if (!dateStr) return;
    const [y, m, d] = dateStr.split('-');
    document.getElementById(prefix + '-d').value = d;
    document.getElementById(prefix + '-m').value = m;
    document.getElementById(prefix + '-y').value = y;
}

function holGetDropdowns(prefix) {
    const d = document.getElementById(prefix + '-d').value;
    const m = document.getElementById(prefix + '-m').value;
    const y = document.getElementById(prefix + '-y').value;
    if (!d || !m || !y) return '';
    return `${y}-${m}-${d}`;
}

function holOpenPlan(prefill) {
    const now = new Date();
    const localToday = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const today = prefill || localToday;
    holSetDropdowns('hol-plan-from', today);
    holSetDropdowns('hol-plan-to', today);
    document.getElementById('hol-plan-note').value = '';
    holOpenOv('hol-ov-plan');

    if (_holStack[_holStack.length - 1] !== 'plan') {
        _pushHolState('plan');
    }
}

async function holSavePlan() {
    const f = holGetDropdowns('hol-plan-from');
    const t = holGetDropdowns('hol-plan-to');
    const n = document.getElementById('hol-plan-note').value.trim();
    if (!f || !t) { alert('Please select a day, month and year for both dates'); return; }
    if (t < f) { alert('End date must be after start date'); return; }
    const existingKey = Object.keys(holTeam).find(k => k.toUpperCase() === holMyCode.toUpperCase());
    if (!existingKey) {
        const myName = localStorage.getItem('pulpProUserName') || holMyCode;
        holTeam[holMyCode] = {
            name: myName.split(' ')[0],
            colour: '#a6e22e',
            role: localStorage.getItem('pulpProUserRole') || '',
            entries: []
        };
    }
    const me = holTeam[existingKey || holMyCode];
    me.entries.push({ from: f, to: t, note: n, id: 'hol_' + Date.now() });
    holMergeMine();
    holCloseOv('hol-ov-plan');
    await holSave();
}

// ── CANCEL POPUP ──────────────────────────────────────────────────────────
function holOpenCancel() {
    holRenderCancelList();
    holOpenOv('hol-ov-cancel');

    if (_holStack[_holStack.length - 1] !== 'cancel') {
        _pushHolState('cancel');
    }
}

function holRenderCancelList() {
    const list = document.getElementById('hol-cancel-list');
    const meKey = Object.keys(holTeam).find(k => k.toUpperCase() === holMyCode.toUpperCase()) || holMyCode;
    const me = holTeam[meKey];
    const entries = me ? me.entries.filter(e => new Date(e.to + 'T00:00:00') >= new Date()) : [];
    if (!entries.length) {
        list.innerHTML = '<div class="hol-no-holidays">No upcoming holidays planned</div>'; return;
    }
    list.innerHTML = entries.map((e, i) => `
        <div class="hol-htray">
            <div class="hol-htray-bar" style="background:${holTeam[holMyCode]?.colour || '#a6e22e'};"></div>
            <div class="hol-htray-info">
                <div class="hol-htray-range">🏖️ ${holFR(e.from, e.to)}</div>
                ${e.note ? `<div class="hol-htray-note">${e.note}</div>` : '<div class="hol-htray-note" style="color:rgba(255,255,255,0.15);">No note</div>'}
            </div>
            <div class="hol-htray-acts">
                <div class="hol-tact hol-tact-edit" onclick="holOpenEdit(${i})" title="Edit">✏️</div>
                <div class="hol-tact hol-tact-del" onclick="holDeleteEntry(${i})" title="Delete">🗑️</div>
            </div>
        </div>`).join('');
}

async function holDeleteEntry(idx) {
    if (!confirm('Delete this holiday?')) return;
    const meKey = Object.keys(holTeam).find(k => k.toUpperCase() === holMyCode.toUpperCase()) || holMyCode;
    const me = holTeam[meKey]; if (!me) return;
    const entry = me.entries[idx];
    me.entries.splice(idx, 1);
    holRenderCancelList();
    await holSave();
}

// ── EDIT POPUP ────────────────────────────────────────────────────────────
function holOpenEdit(idx) {
    holEditIdx = idx;
    const me = holTeam[holMyCode]; if (!me) return;
    const e = me.entries[idx];
    holSetDropdowns('hol-edit-from', e.from);
    holSetDropdowns('hol-edit-to', e.to);
    document.getElementById('hol-edit-note').value = e.note || '';
    holOpenOv('hol-ov-edit');

    if (_holStack[_holStack.length - 1] !== 'edit') {
        _pushHolState('edit');
    }
}

async function holSaveEdit() {
    const f = holGetDropdowns('hol-edit-from');
    const t = holGetDropdowns('hol-edit-to');
    const n = document.getElementById('hol-edit-note').value.trim();
    if (!f || !t) { alert('Please select both dates'); return; }
    if (t < f) { alert('End date must be after start date'); return; }
    const me = holTeam[holMyCode]; if (!me) return;
    me.entries[holEditIdx] = { from: f, to: t, note: n, id: me.entries[holEditIdx]?.id || 'hol_' + Date.now() };
    holCloseOv('hol-ov-edit');
    holRenderCancelList();
    await holSave();
}

// ── MERGE ENTRIES ─────────────────────────────────────────────────────────
function holMergeMine() {
    const me = holTeam[holMyCode]; if (!me) return;
    const all = new Set();
    me.entries.forEach(e => holDR(e.from, e.to).forEach(d => all.add(d)));
    const s = [...all].sort(); if (!s.length) { me.entries = []; return; }
    const noteMap = {};
    me.entries.forEach(e => holDR(e.from, e.to).forEach(d => noteMap[d] = e.note || ''));
    const r = []; let st = s[0], p = s[0];
    for (let i = 1; i < s.length; i++) {
        const pv = new Date(p + 'T00:00:00'); pv.setDate(pv.getDate() + 1);
        if (holLocalDate(pv) === s[i]) p = s[i];
        else { r.push({ from: st, to: p, note: noteMap[st] || '', id: 'hol_' + st }); st = s[i]; p = s[i]; }
    }
    r.push({ from: st, to: p, note: noteMap[st] || '', id: 'hol_' + st });
    me.entries = r;
}

// ── OVERLAY HELPERS ───────────────────────────────────────────────────────
function holOpenOv(id) { document.getElementById(id).classList.add('show'); }
function holCloseOv(id, e) {
    // Only close if either no event, or clicked on backdrop (matches original behaviour)
    if (e && e.target !== document.getElementById(id)) return;

    // If we're responding to a popstate, just close DOM
    if (_holSuppressPush) {
        _closeHolOverlayDOM(id);
        return;
    }

    // Route through history.back so popstate keeps the stack in sync
    const expectedLevel = _HOL_LEVEL_MAP[id];
    if (expectedLevel && _holStack[_holStack.length - 1] === expectedLevel) {
        history.back();
    } else {
        _closeHolOverlayDOM(id);
    }
}

// ── TILE UPDATE ───────────────────────────────────────────────────────────
function holUpdateTile() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const monday = new Date(today);
    const dow = today.getDay() === 0 ? 6 : today.getDay() - 1;
    monday.setDate(today.getDate() - dow);
    const friday = new Date(monday); friday.setDate(monday.getDate() + 4);
    const offPeople = new Set();
    Object.entries(holTeam).forEach(([code, u]) => {
        u.entries.forEach(e => {
            const from = new Date(e.from + 'T00:00:00'), to = new Date(e.to + 'T00:00:00');
            if (from <= friday && to >= monday) offPeople.add(code);
        });
    });
    const el = document.getElementById('hol-tile-count');
    if (el) el.textContent = offPeople.size + ' off this week';
}
