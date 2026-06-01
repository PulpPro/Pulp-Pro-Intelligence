// ── HOLIDAY PLANNER ───────────────────────────────────────────────────────
const HOL_WORKER = 'https://pulppro-access.pulpprobrain.workers.dev';

const HOL_COLOURS = [
  '#a6e22e','#34d399','#22d3ee','#8899ff','#f472b6',
  '#fb923c','#facc15','#e879f9','#4ade80','#60a5fa',
  '#f87171','#a78bfa','#2dd4bf','#fbbf24','#c084fc',
  '#86efac','#93c5fd','#fca5a5','#6ee7b7','#67e8f9'
];

let holYear = new Date().getFullYear();
let holMonth = new Date().getMonth();
let holMyEntries = [];     // current user's holiday entries
let holTeamData = [];      // all users' entries
let holNLHolidays = {};    // { 'YYYY-MM-DD': 'Holiday Name' }
let holUserCode = '';
let holUserName = '';
let holUserColour = '#a6e22e';

// ── OPEN / INIT ───────────────────────────────────────────────────────────
async function openHolidayPlanner() {
    document.getElementById('fruit-hub').classList.add('hidden');
    const view = document.getElementById('holiday-planner-view');
    view.classList.remove('hidden');
    const mt = document.getElementById('menu-trigger');
    if (mt) mt.style.display = 'none';

    holUserCode = localStorage.getItem('pulpProAdmin') === 'true' ? 'ADMIN' :
                  (localStorage.getItem('pulpProAccessCode') || '').toUpperCase();
    holUserName = (localStorage.getItem('pulpProUserName') || holUserCode.split('-')[0] || 'You');

    // Assign colour based on code
    const codeSum = holUserCode.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    holUserColour = HOL_COLOURS[codeSum % HOL_COLOURS.length];

    holYear = new Date().getFullYear();
    holMonth = new Date().getMonth();

    holRenderHeader();
    await holLoadData();
    holRenderCalendar();
}

function closeHolidayPlanner() {
    document.getElementById('holiday-planner-view').classList.add('hidden');
    document.getElementById('fruit-hub').classList.remove('hidden');
    const mt = document.getElementById('menu-trigger');
    if (mt) mt.style.display = '';
}

// ── LOAD DATA ─────────────────────────────────────────────────────────────
async function holLoadData() {
    try {
        // Load NL holidays
        const nlRes = await fetch(HOL_WORKER + '/nl-holidays', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ year: holYear })
        });
        const nlData = await nlRes.json();
        holNLHolidays = {};
        (Array.isArray(nlData) ? nlData : []).forEach(h => { holNLHolidays[h.date] = h.localName; });

        // Load team data
        const teamRes = await fetch(HOL_WORKER + '/holidays-all', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        const teamData = await teamRes.json();
        holTeamData = teamData.users || [];

        // Find my entries
        const me = holTeamData.find(u => u.userCode === holUserCode);
        holMyEntries = me ? me.entries : [];

    } catch(e) {
        console.error('Holiday load error:', e);
        holTeamData = [];
        holMyEntries = [];
    }
}

// ── SAVE MY ENTRIES ───────────────────────────────────────────────────────
async function holSave() {
    try {
        await fetch(HOL_WORKER + '/holidays-save', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userCode: holUserCode, entries: holMyEntries })
        });
        // Refresh team data
        await holLoadData();
        holRenderCalendar();
    } catch(e) { console.error('Holiday save error:', e); }
}

// ── HEADER ────────────────────────────────────────────────────────────────
function holRenderHeader() {
    const el = document.getElementById('hol-month-label');
    if (el) el.textContent = new Date(holYear, holMonth).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function holPrevMonth() {
    holMonth--;
    if (holMonth < 0) { holMonth = 11; holYear--; }
    holRenderHeader();
    holRenderCalendar();
}

function holNextMonth() {
    holMonth++;
    if (holMonth > 11) { holMonth = 0; holYear++; }
    holRenderHeader();
    holRenderCalendar();
}

// ── CALENDAR RENDER ───────────────────────────────────────────────────────
function holRenderCalendar() {
    const grid = document.getElementById('hol-grid');
    if (!grid) return;

    const firstDay = new Date(holYear, holMonth, 1);
    const lastDay = new Date(holYear, holMonth + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7; // Mon=0
    const today = new Date(); today.setHours(0,0,0,0);

    // Build lookup: date string → array of { name, colour, isMe, note }
    const dayMap = {};
    holTeamData.forEach(user => {
        const isMeUser = user.userCode === holUserCode;
        const codeSum = user.userCode.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const colour = isMeUser ? holUserColour : HOL_COLOURS[codeSum % HOL_COLOURS.length];
        (user.entries || []).forEach(entry => {
            const from = new Date(entry.from + 'T00:00:00');
            const to = new Date(entry.to + 'T00:00:00');
            for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
                const key = d.toISOString().split('T')[0];
                if (!dayMap[key]) dayMap[key] = [];
                dayMap[key].push({ name: user.name, colour, isMe: isMeUser, note: entry.note || '', entryId: entry.id });
            }
        });
    });

    // My reminders from localStorage
    const reminders = JSON.parse(localStorage.getItem('pulpProReminders') || '[]');
    const remMap = {};
    reminders.forEach(r => {
        if (!r.done) {
            const key = (r.datetime || '').split('T')[0];
            if (key) { if (!remMap[key]) remMap[key] = []; remMap[key].push(r); }
        }
    });

    let html = '';
    // Day headers
    ['Mo','Tu','We','Th','Fr','Sa','Su'].forEach(d => {
        html += `<div style="text-align:center;font-size:8px;font-weight:800;color:rgba(255,255,255,0.25);padding:5px 0 4px;letter-spacing:1px;height:22px;box-sizing:border-box;">${d}</div>`;
    });

    // Empty cells before first day
    for (let i = 0; i < startDow; i++) html += '<div></div>';

    // Day cells
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateStr = `${holYear}-${String(holMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const date = new Date(holYear, holMonth, day);
        const dow = date.getDay(); // 0=Sun,6=Sat
        const isWeekend = dow === 0 || dow === 6;
        const isToday = date.getTime() === today.getTime();
        const isNLHol = !!holNLHolidays[dateStr];
        const people = dayMap[dateStr] || [];
        const myRems = remMap[dateStr] || [];
        const hasMe = people.some(p => p.isMe);

        let bgColour = 'rgba(255,255,255,0.02)';
        let borderColour = 'rgba(255,255,255,0.06)';
        let dateColour = isWeekend ? 'rgba(255,100,100,0.7)' : 'rgba(255,255,255,0.7)';

        if (isNLHol) { bgColour = 'rgba(255,80,80,0.08)'; borderColour = 'rgba(255,80,80,0.2)'; dateColour = 'rgba(255,120,120,0.9)'; }
        if (hasMe) { bgColour = 'rgba(166,226,46,0.08)'; borderColour = `${holUserColour}44`; }
        if (isToday) { borderColour = 'rgba(255,255,255,0.3)'; }
        if (myRems.length) { borderColour = 'rgba(136,100,255,0.5)'; }

        // Trays — reminder first, then people (max 4 visible + overflow)
        let trays = '';
        if (isNLHol) {
            const short = holNLHolidays[dateStr].length > 8 ? holNLHolidays[dateStr].slice(0,7)+'…' : holNLHolidays[dateStr];
            trays += `<div style="font-size:6px;color:rgba(255,120,120,0.8);font-weight:700;line-height:1.2;margin-top:1px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">🇳🇱 ${short}</div>`;
        }
        if (myRems.length) {
            trays += `<div style="width:100%;height:3px;border-radius:2px;background:rgba(136,100,255,0.7);margin-top:1px;"></div>`;
        }
        const visible = people.slice(0, 4);
        const overflow = people.length - 4;
        visible.forEach(p => {
            trays += `<div style="width:100%;height:3px;border-radius:2px;background:${p.colour};margin-top:1px;opacity:${p.isMe?1:0.7};"></div>`;
        });
        if (overflow > 0) {
            trays += `<div style="font-size:5px;font-weight:800;color:#ffa500;margin-top:1px;">+${overflow}</div>`;
        }

        html += `<div onclick="holDayTap('${dateStr}')" style="
            background:${bgColour};border:1px solid ${borderColour};border-radius:6px;
            padding:3px;cursor:pointer;height:52px;max-height:52px;
            transition:background 0.15s;box-sizing:border-box;overflow:hidden;">
            <div style="font-size:9px;font-weight:${isToday?'900':'700'};color:${isToday?'#fff':dateColour};
                ${isToday?'background:rgba(255,255,255,0.15);border-radius:3px;width:16px;height:16px;display:flex;align-items:center;justify-content:center;':''}">
                ${day}
            </div>
            ${trays}
        </div>`;
    }

    grid.innerHTML = html;
}

// ── DAY TAP POPUP ─────────────────────────────────────────────────────────
function holDayTap(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const dateLabel = date.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    const dow = date.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const nlHol = holNLHolidays[dateStr];
    const reminders = JSON.parse(localStorage.getItem('pulpProReminders') || '[]');
    const myRems = reminders.filter(r => !r.done && (r.datetime||'').startsWith(dateStr));

    // People on this day
    const people = [];
    holTeamData.forEach(user => {
        const isMeUser = user.userCode === holUserCode;
        const codeSum = user.userCode.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const colour = isMeUser ? holUserColour : HOL_COLOURS[codeSum % HOL_COLOURS.length];
        (user.entries || []).forEach(entry => {
            const from = new Date(entry.from + 'T00:00:00');
            const to = new Date(entry.to + 'T00:00:00');
            if (date >= from && date <= to) {
                people.push({ name: user.name, colour, isMe: isMeUser, role: user.role, note: entry.note, entryId: entry.id });
            }
        });
    });

    const hasMe = people.some(p => p.isMe);

    let html = `
    <div style="padding:18px 18px 0;">
        <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.35);margin-bottom:4px;">${dateLabel}</div>`;

    if (nlHol) html += `<div style="background:rgba(255,80,80,0.1);border:1px solid rgba(255,80,80,0.25);border-radius:8px;padding:6px 10px;font-size:10px;font-weight:700;color:rgba(255,120,120,0.9);margin-bottom:8px;">🇳🇱 ${nlHol}</div>`;
    if (isWeekend) html += `<div style="font-size:9px;color:rgba(255,100,100,0.5);margin-bottom:6px;">Weekend</div>`;

    if (myRems.length) {
        html += `<div style="margin-bottom:8px;">`;
        myRems.forEach(r => {
            const time = (r.datetime||'').split('T')[1]?.slice(0,5) || '';
            html += `<div style="background:rgba(136,100,255,0.1);border:1px solid rgba(136,100,255,0.25);border-radius:8px;padding:6px 10px;font-size:10px;color:rgba(180,150,255,0.9);margin-bottom:4px;">🔔 ${time} — ${r.text}</div>`;
        });
        html += `</div>`;
    }

    // Team list
    if (people.length) {
        html += `<div style="font-size:8px;font-weight:800;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">Off this day</div>`;
        // Sort: me first, then by role
        const sorted = [...people].sort((a,b) => (b.isMe?1:0)-(a.isMe?1:0));
        sorted.forEach(p => {
            html += `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                <div style="width:28px;height:28px;border-radius:8px;background:${p.colour}22;border:1px solid ${p.colour}44;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:${p.colour};flex-shrink:0;">${p.name.slice(0,2).toUpperCase()}</div>
                <div style="flex:1;">
                    <div style="font-size:11px;font-weight:700;color:#fff;">${p.name}${p.isMe?' (you)':''}</div>
                    ${p.role?`<div style="font-size:8px;color:rgba(255,255,255,0.3);">${p.role}</div>`:''}
                    ${p.note?`<div style="font-size:9px;color:rgba(255,255,255,0.25);font-style:italic;">"${p.note}"</div>`:''}
                </div>
            </div>`;
        });
    } else {
        html += `<div style="font-size:11px;color:rgba(255,255,255,0.2);padding:8px 0;">No one off this day.</div>`;
    }

    html += `</div>
    <div style="padding:12px 18px 18px;display:flex;flex-direction:column;gap:8px;">
        <button onclick="holClosePopup();holOpenPlan('${dateStr}')" style="width:100%;background:#34d399;border:none;border-radius:12px;padding:13px;font-size:13px;font-weight:900;color:#000;cursor:pointer;font-family:-apple-system,sans-serif;">🏖️ Plan this day →</button>
        <button onclick="holClosePopup()" style="width:100%;background:transparent;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:10px;font-size:12px;font-weight:700;color:rgba(255,255,255,0.35);cursor:pointer;font-family:-apple-system,sans-serif;">Close</button>
    </div>`;

    document.getElementById('hol-popup-body').innerHTML = html;
    document.getElementById('hol-popup').classList.remove('hidden');
}

function holClosePopup() {
    document.getElementById('hol-popup').classList.add('hidden');
}

// ── PLAN FREE DAY ─────────────────────────────────────────────────────────
function holOpenPlan(prefillFrom) {
    const today = new Date().toISOString().split('T')[0];
    const from = prefillFrom || today;

    const html = `
    <div style="padding:16px 16px 0;">
        <div style="font-size:16px;font-weight:900;color:#fff;letter-spacing:-0.5px;margin-bottom:2px;">Plan free day/s</div>
        <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:12px;">Select your dates and add a note</div>
        <div style="font-size:8px;font-weight:800;color:rgba(52,211,153,0.6);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:5px;">From</div>
        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(52,211,153,0.2);border-radius:10px;padding:8px 12px;margin-bottom:8px;">
            <input type="date" id="hol-plan-from" value="${from}" style="width:100%;background:transparent;border:none;font-size:13px;font-weight:600;color:#fff;outline:none;color-scheme:dark;font-family:-apple-system,sans-serif;-webkit-appearance:none;">
        </div>
        <div style="font-size:8px;font-weight:800;color:rgba(52,211,153,0.6);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:5px;">To</div>
        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(52,211,153,0.2);border-radius:10px;padding:8px 12px;margin-bottom:8px;">
            <input type="date" id="hol-plan-to" value="${from}" style="width:100%;background:transparent;border:none;font-size:13px;font-weight:600;color:#fff;outline:none;color-scheme:dark;font-family:-apple-system,sans-serif;-webkit-appearance:none;">
        </div>
        <div style="font-size:8px;font-weight:800;color:rgba(52,211,153,0.6);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:5px;">Note <span style="color:rgba(255,255,255,0.2);font-weight:600;text-transform:none;letter-spacing:0;">(optional)</span></div>
        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(52,211,153,0.2);border-radius:10px;padding:8px 12px;margin-bottom:4px;">
            <input type="text" id="hol-plan-note" placeholder="e.g. Vacation, Doctor" style="width:100%;background:transparent;border:none;font-size:13px;color:#fff;outline:none;font-family:-apple-system,sans-serif;">
        </div>
    </div>
    <div style="padding:10px 16px 16px;display:flex;flex-direction:column;gap:8px;">
        <button onclick="holSavePlan()" style="width:100%;background:#34d399;border:none;border-radius:12px;padding:12px;font-size:13px;font-weight:900;color:#000;cursor:pointer;font-family:-apple-system,sans-serif;">Save →</button>
        <button onclick="holClosePopup()" style="width:100%;background:transparent;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:9px;font-size:12px;font-weight:700;color:rgba(255,255,255,0.35);cursor:pointer;font-family:-apple-system,sans-serif;">Cancel</button>
    </div>`;

    document.getElementById('hol-popup-body').innerHTML = html;
    document.getElementById('hol-popup').classList.remove('hidden');
}

async function holSavePlan() {
    const from = document.getElementById('hol-plan-from').value;
    const to = document.getElementById('hol-plan-to').value;
    const note = document.getElementById('hol-plan-note').value.trim();
    if (!from || !to) { alert('Please select dates'); return; }
    if (to < from) { alert('End date must be after start date'); return; }

    const entry = { id: 'hol_' + Date.now(), from, to, note };
    holMyEntries.push(entry);
    holClosePopup();
    await holSave();
    // Fire notification to team
    await holNotify('add', from, to);
}

// ── CANCEL HOLIDAY — shows all planned ranges ────────────────────────────
function holOpenCancel() {
    if (!holMyEntries.length) {
        // No entries at all
        const html = `<div style="padding:24px 18px;text-align:center;">
            <div style="font-size:32px;margin-bottom:10px;">🏖️</div>
            <div style="font-size:15px;font-weight:800;color:#fff;margin-bottom:6px;">No planned days</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-bottom:18px;">You haven't planned any free days yet.</div>
            <button onclick="holClosePopup()" style="width:100%;background:transparent;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:10px;font-size:12px;font-weight:700;color:rgba(255,255,255,0.35);cursor:pointer;font-family:-apple-system,sans-serif;">Close</button>
        </div>`;
        document.getElementById('hol-popup-body').innerHTML = html;
        document.getElementById('hol-popup').classList.remove('hidden');
        return;
    }

    let html = `<div style="padding:18px 18px 0;">
        <div style="font-size:18px;font-weight:900;color:#fff;letter-spacing:-0.5px;margin-bottom:4px;">Cancel free day/s</div>
        <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:14px;">Tap delete to remove a planned range</div>`;

    // Sort entries by date
    const sorted = [...holMyEntries].sort((a,b) => a.from.localeCompare(b.from));
    sorted.forEach(e => {
        const fromLabel = new Date(e.from + 'T00:00:00').toLocaleDateString('en-GB', { day:'numeric', month:'short' });
        const toLabel = new Date(e.to + 'T00:00:00').toLocaleDateString('en-GB', { day:'numeric', month:'short' });
        const days = Math.round((new Date(e.to + 'T00:00:00') - new Date(e.from + 'T00:00:00')) / 86400000) + 1;
        const sameDay = e.from === e.to;
        html += `<div style="background:rgba(255,77,77,0.05);border:1px solid rgba(255,77,77,0.15);border-radius:12px;padding:12px 14px;margin-bottom:8px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:${e.note?'4px':'0'};">
                <div>
                    <div style="font-size:13px;font-weight:800;color:#fff;">${sameDay ? fromLabel : fromLabel + ' → ' + toLabel}</div>
                    <div style="font-size:9px;color:rgba(255,255,255,0.3);margin-top:2px;">${days} day${days>1?'s':''}</div>
                </div>
                <button onclick="holDeleteEntry('${e.id}')" style="background:rgba(255,77,77,0.12);border:1px solid rgba(255,77,77,0.25);border-radius:8px;padding:6px 12px;font-size:10px;font-weight:700;color:rgba(255,100,100,0.9);cursor:pointer;font-family:-apple-system,sans-serif;flex-shrink:0;">Delete</button>
            </div>
            ${e.note?`<div style="font-size:9px;color:rgba(255,255,255,0.25);font-style:italic;">"${e.note}"</div>`:''}
        </div>`;
    });

    html += `</div><div style="padding:12px 18px 18px;">
        <button onclick="holClosePopup()" style="width:100%;background:transparent;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:10px;font-size:12px;font-weight:700;color:rgba(255,255,255,0.35);cursor:pointer;font-family:-apple-system,sans-serif;">Close</button>
    </div>`;

    document.getElementById('hol-popup-body').innerHTML = html;
    document.getElementById('hol-popup').classList.remove('hidden');
}

// Keep holCancelPrompt for legacy day-tap use
function holCancelPrompt(dateStr) {
    holOpenCancel();
}

async function holDeleteEntry(entryId) {
    const entry = holMyEntries.find(e => e.id === entryId);
    holMyEntries = holMyEntries.filter(e => e.id !== entryId);
    holClosePopup();
    await holSave();
    // Fire notification to team
    if (entry) await holNotify('cancel', entry.from, entry.to);
}

// ── SEND HOLIDAY NOTIFICATION ────────────────────────────────────────────
async function holNotify(action, fromDate, toDate) {
    try {
        const role = localStorage.getItem('pulpProUserRole') || '';
        await fetch(HOL_WORKER + '/holiday-notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                senderName: holUserName,
                senderRole: role,
                senderCode: holUserCode,
                action,
                fromDate,
                toDate
            })
        });
    } catch(e) { console.error('Holiday notify error:', e); }
}

// ── UPDATE TILE ───────────────────────────────────────────────────────────
function holUpdateTile() {
    const today = new Date(); today.setHours(0,0,0,0);
    const monday = new Date(today);
    const dow = today.getDay() === 0 ? 6 : today.getDay() - 1;
    monday.setDate(today.getDate() - dow);

    let offCount = 0;
    holTeamData.forEach(user => {
        if (user.userCode === holUserCode) return;
        (user.entries || []).forEach(e => {
            const from = new Date(e.from + 'T00:00:00');
            const to = new Date(e.to + 'T00:00:00');
            const friday = new Date(monday); friday.setDate(monday.getDate() + 4);
            if (from <= friday && to >= monday) offCount++;
        });
    });

    const el = document.getElementById('hol-tile-count');
    if (el) el.textContent = offCount + ' off';
}
