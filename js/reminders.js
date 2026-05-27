// ── REMINDERS ────────────────────────────────────────────────────────────
const REMINDERS_KEY = 'pulpai_reminders';

function loadReminders() {
    try {
        return JSON.parse(localStorage.getItem(REMINDERS_KEY) || '[]');
    } catch(e) { return []; }
}

function saveRemindersLocal(reminders) {
    try {
        localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
    } catch(e) {}
    syncRemindersToKV(reminders);
}

async function syncRemindersToKV(reminders) {
    try {
        const userCode = localStorage.getItem('pulpProAccessCode') || 'admin';
        await fetch('https://pulppro-access.pulpprobrain.workers.dev/reminders-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userCode, reminders })
        });
    } catch(e) {}
}

// Called from Pulp AI when AI sets a reminder
function saveReminderFromAI(data) {
    const reminders = loadReminders();
    const dt = data.datetime || '';
    const [datePart, timePart] = dt.split('T');
    const [y, mo, d] = datePart.split('-').map(Number);
    const [h, m] = (timePart || '00:00').split(':').map(Number);
    const datetime = new Date(y, mo - 1, d, h, m).toISOString();
    reminders.push({
        id: 'rem_' + Date.now(),
        text: data.text,
        datetime,
        source: 'ai',
        done: false,
        createdAt: new Date().toISOString()
    });
    saveRemindersLocal(reminders);
    renderReminderTilePreview();
}

// ── OPEN / CLOSE ──────────────────────────────────────────────────────────
function openReminders() {
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    document.getElementById('colour-scanner-view').classList.add('hidden');
    const pulpaiView = document.getElementById('pulpai-view');
    if (pulpaiView) pulpaiView.classList.add('hidden');
    document.getElementById('reminders-view').classList.remove('hidden');
    const menuTrigger = document.getElementById('menu-trigger');
    if (menuTrigger) menuTrigger.style.display = 'none';
    renderRemindersList();
    setTimeout(() => {
        if (typeof requestPushPermission === 'function') {
            if (Notification.permission === 'default') {
                requestPushPermission();
            }
        }
    }, 500);
}

function closeReminders() {
    document.getElementById('reminders-view').classList.add('hidden');
    document.getElementById('fruit-hub').classList.remove('hidden');
    const menuTrigger = document.getElementById('menu-trigger');
    if (menuTrigger) menuTrigger.style.display = '';
}

function scrollToNewReminder() {
    const input = document.getElementById('rem-text-input');
    if (input) { input.scrollIntoView({ behavior: 'smooth' }); input.focus(); }
}

// ── RENDER LIST ───────────────────────────────────────────────────────────
function renderRemindersList() {
    const reminders = loadReminders();
    const now = new Date();
    const upcoming = reminders.filter(r => !r.done && new Date(r.datetime) >= now);
    const overdue = reminders.filter(r => !r.done && new Date(r.datetime) < now);
    const done = reminders.filter(r => r.done);

    const container = document.getElementById('reminders-list');
    if (!container) return;

    const subEl = document.getElementById('reminders-header-sub');
    if (subEl) subEl.textContent = upcoming.length === 1 ? '1 upcoming' : upcoming.length > 0 ? `${upcoming.length} upcoming` : 'No upcoming';

    let html = '';

    if (upcoming.length === 0 && overdue.length === 0) {
        html += `<div style="text-align:center;padding:40px 20px;font-size:14px;color:rgba(255,255,255,0.25);font-weight:400;letter-spacing:normal;text-transform:none;">No reminders yet.<br>Add one below.</div>`;
    }

    if (overdue.length > 0) {
        html += `<div style="font-size:9px;font-weight:700;color:rgba(255,80,80,0.6);text-transform:uppercase;letter-spacing:2px;padding:4px 2px;margin-bottom:6px;">Overdue</div>`;
        overdue.forEach(r => { html += renderReminderCard(r, true, false); });
    }

    if (upcoming.length > 0) {
        html += `<div style="font-size:9px;font-weight:700;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:2px;padding:4px 2px;margin-bottom:6px;${overdue.length > 0 ? 'margin-top:12px;' : ''}">Upcoming</div>`;
        upcoming.forEach(r => { html += renderReminderCard(r, false, false); });
    }

    if (done.length > 0) {
        html += `<div style="font-size:9px;font-weight:700;color:rgba(255,255,255,0.2);text-transform:uppercase;letter-spacing:2px;padding:4px 2px;margin-top:12px;margin-bottom:6px;">Completed</div>`;
        done.slice(0, 5).forEach(r => { html += renderReminderCard(r, false, true); });
    }

    container.innerHTML = html;
}

function renderReminderCard(r, overdue, done) {
    const dt = new Date(r.datetime);
    const dateStr = dt.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' });
    const timeStr = dt.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
    const dotColor = done ? '#444' : overdue ? '#ff5050' : r.source === 'ai' ? '#8899ff' : '#a6e22e';
    const borderColor = done ? 'rgba(255,255,255,0.06)' : overdue ? 'rgba(255,80,80,0.2)' : 'rgba(136,153,255,0.25)';
    const bgColor = done ? 'rgba(255,255,255,0.02)' : overdue ? 'rgba(255,80,80,0.04)' : 'rgba(136,153,255,0.05)';
    const tagHtml = r.source === 'ai'
        ? `<span style="font-size:9px;font-weight:700;padding:2px 8px;border-radius:100px;background:rgba(136,153,255,0.12);color:#8899ff;border:1px solid rgba(136,153,255,0.2);text-transform:uppercase;letter-spacing:0.5px;">Via Pulp AI</span>`
        : `<span style="font-size:9px;font-weight:700;padding:2px 8px;border-radius:100px;background:rgba(166,226,46,0.08);color:#a6e22e;border:1px solid rgba(166,226,46,0.18);text-transform:uppercase;letter-spacing:0.5px;">Manual</span>`;

    const actionsHtml = !done ? `
        <div style="display:flex;gap:6px;padding-left:21px;margin-top:10px;">
            <div onclick="openEditReminder('${r.id}')" style="flex:1;padding:8px 10px;border-radius:9px;font-size:11px;font-weight:700;text-align:center;cursor:pointer;background:rgba(136,153,255,0.1);color:#8899ff;border:1px solid rgba(136,153,255,0.2);letter-spacing:0.3px;"><i class="bi bi-pencil" style="font-size:10px;margin-right:3px;"></i>Edit</div>
            <div onclick="markReminderDone('${r.id}')" style="flex:1;padding:8px 10px;border-radius:9px;font-size:11px;font-weight:700;text-align:center;cursor:pointer;background:rgba(166,226,46,0.08);color:#a6e22e;border:1px solid rgba(166,226,46,0.18);letter-spacing:0.3px;"><i class="bi bi-check-lg" style="font-size:10px;margin-right:3px;"></i>Done</div>
            <div onclick="deleteReminder('${r.id}')" style="padding:8px 12px;border-radius:9px;font-size:11px;cursor:pointer;background:rgba(255,77,77,0.07);color:rgba(255,77,77,0.6);border:1px solid rgba(255,77,77,0.15);"><i class="bi bi-trash" style="font-size:11px;"></i></div>
        </div>` : '';

    return `<div style="background:${bgColor};border:1px solid ${borderColor};border-radius:16px;padding:14px 15px;margin-bottom:8px;${done ? 'opacity:0.4;' : ''}">
        <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;">
            <div style="width:11px;height:11px;border-radius:50%;background:${dotColor};flex-shrink:0;margin-top:3px;"></div>
            <div style="font-size:14px;font-weight:700;color:${done ? 'rgba(255,255,255,0.4)' : '#fff'};line-height:1.3;flex:1;letter-spacing:normal;text-transform:none;${done ? 'text-decoration:line-through;' : ''}">${escapeHtmlRem(r.text)}</div>
            ${!done ? `<div style="font-size:14px;color:rgba(255,255,255,0.2);flex-shrink:0;margin-top:2px;"><i class="bi bi-chevron-right"></i></div>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-left:21px;">
            <div style="font-size:12px;color:rgba(255,255,255,0.35);display:flex;align-items:center;gap:4px;"><i class="bi bi-clock" style="font-size:11px;"></i> ${dateStr} · ${timeStr}</div>
            ${tagHtml}
        </div>
        ${actionsHtml}
    </div>`;
}

function escapeHtmlRem(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function markReminderDone(id) {
    const reminders = loadReminders();
    const r = reminders.find(r => r.id === id);
    if (r) r.done = true;
    saveRemindersLocal(reminders);
    renderRemindersList();
    renderReminderTilePreview();
}

function deleteReminder(id) {
    const reminders = loadReminders().filter(r => r.id !== id);
    saveRemindersLocal(reminders);
    renderRemindersList();
    renderReminderTilePreview();
}

// ── EDIT REMINDER ─────────────────────────────────────────────────────────
function openEditReminder(id) {
    const reminders = loadReminders();
    const r = reminders.find(r => r.id === id);
    if (!r) return;

    const dt = new Date(r.datetime);
    const dateVal = dt.toISOString().slice(0, 10);
    const timeVal = dt.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });

    const isOverdue = !r.done && dt < new Date();
    const statusLabel = r.done ? 'Completed' : isOverdue ? 'Overdue' : 'Upcoming';
    const statusColor = r.done ? 'rgba(255,255,255,0.4)' : isOverdue ? '#ff5050' : '#a6e22e';
    const statusBg = r.done ? 'rgba(255,255,255,0.06)' : isOverdue ? 'rgba(255,80,80,0.1)' : 'rgba(166,226,46,0.08)';
    const statusBorder = r.done ? 'rgba(255,255,255,0.1)' : isOverdue ? 'rgba(255,80,80,0.2)' : 'rgba(166,226,46,0.18)';

    const sourceHtml = r.source === 'ai'
        ? `<span style="font-size:11px;font-weight:700;padding:3px 9px;border-radius:100px;background:rgba(136,153,255,0.1);color:#8899ff;border:1px solid rgba(136,153,255,0.2);">Via Pulp AI</span>`
        : `<span style="font-size:11px;font-weight:700;padding:3px 9px;border-radius:100px;background:rgba(166,226,46,0.08);color:#a6e22e;border:1px solid rgba(166,226,46,0.18);">Manual</span>`;

    const panel = document.getElementById('reminders-edit-panel');
    if (!panel) return;

    panel.innerHTML = `
        <div style="padding:13px 16px;display:flex;align-items:center;gap:10px;background:#07070f;border-bottom:1px solid rgba(255,255,255,0.06);flex-shrink:0;">
            <div onclick="closeEditReminder()" style="width:32px;height:32px;border-radius:9px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;font-size:14px;color:rgba(255,255,255,0.5);cursor:pointer;flex-shrink:0;"><i class="bi bi-arrow-left"></i></div>
            <div style="flex:1;">
                <div style="font-size:16px;font-weight:800;color:#fff;">Edit Reminder</div>
                <div style="font-size:10px;color:rgba(136,153,255,0.6);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-top:1px;">Tap any field to change</div>
            </div>
        </div>
        <div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px;display:flex;flex-direction:column;gap:12px;">
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px;">
                <div style="font-size:9px;font-weight:700;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">Reminder text</div>
                <textarea id="edit-rem-text" rows="3" style="width:100%;background:transparent;border:none;font-size:15px;color:#fff;outline:none;font-weight:500;line-height:1.5;resize:none;font-family:-apple-system,sans-serif;letter-spacing:normal;text-transform:none;">${escapeHtmlRem(r.text)}</textarea>
            </div>
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px;">
                <div style="font-size:9px;font-weight:700;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">Schedule</div>
                <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <div style="font-size:13px;color:rgba(255,255,255,0.5);"><i class="bi bi-calendar3" style="font-size:14px;margin-right:6px;vertical-align:-2px;"></i>Date</div>
                    <input id="edit-rem-date" type="date" value="${dateVal}" style="background:transparent;border:none;font-size:13px;font-weight:600;color:#fff;outline:none;font-family:-apple-system,sans-serif;color-scheme:dark;">
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0 0;">
                    <div style="font-size:13px;color:rgba(255,255,255,0.5);"><i class="bi bi-clock" style="font-size:14px;margin-right:6px;vertical-align:-2px;"></i>Time</div>
                    <input id="edit-rem-time" type="time" value="${timeVal}" style="background:transparent;border:none;font-size:13px;font-weight:600;color:#fff;outline:none;font-family:-apple-system,sans-serif;color-scheme:dark;">
                </div>
            </div>
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px;">
                <div style="font-size:9px;font-weight:700;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">Details</div>
                <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <div style="font-size:13px;color:rgba(255,255,255,0.5);">Source</div>
                    ${sourceHtml}
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0 0;">
                    <div style="font-size:13px;color:rgba(255,255,255,0.5);">Status</div>
                    <span style="font-size:11px;font-weight:700;padding:3px 9px;border-radius:100px;background:${statusBg};color:${statusColor};border:1px solid ${statusBorder};">${statusLabel}</span>
                </div>
            </div>
        </div>
        <button onclick="saveEditReminder('${r.id}')" style="margin:0 16px 12px;background:#8899ff;border:none;border-radius:12px;padding:14px;font-size:14px;font-weight:700;color:#000;text-transform:uppercase;letter-spacing:1px;cursor:pointer;font-family:-apple-system,sans-serif;flex-shrink:0;">Save Changes</button>
        <button onclick="deleteReminderFromEdit('${r.id}')" style="margin:0 16px 20px;background:rgba(255,77,77,0.08);border:1px solid rgba(255,77,77,0.2);border-radius:12px;padding:13px;font-size:13px;font-weight:700;color:rgba(255,77,77,0.7);text-transform:uppercase;letter-spacing:1px;cursor:pointer;font-family:-apple-system,sans-serif;flex-shrink:0;"><i class="bi bi-trash" style="font-size:13px;margin-right:5px;"></i>Delete reminder</button>
    `;

    panel.style.display = 'flex';
}

function closeEditReminder() {
    const panel = document.getElementById('reminders-edit-panel');
    if (panel) panel.style.display = 'none';
}

function saveEditReminder(id) {
    const text = document.getElementById('edit-rem-text').value.trim();
    const date = document.getElementById('edit-rem-date').value;
    const time = document.getElementById('edit-rem-time').value;

    if (!text) { alert('Please enter a reminder.'); return; }
    if (!date || !time) { alert('Please set a date and time.'); return; }

    const reminders = loadReminders();
    const r = reminders.find(r => r.id === id);
    if (!r) return;

    r.text = text;
    r.datetime = new Date(`${date}T${time}`).toISOString();

    saveRemindersLocal(reminders);
    closeEditReminder();
    renderRemindersList();
    renderReminderTilePreview();
}

function deleteReminderFromEdit(id) {
    const reminders = loadReminders().filter(r => r.id !== id);
    saveRemindersLocal(reminders);
    closeEditReminder();
    renderRemindersList();
    renderReminderTilePreview();
}

// ── ADD REMINDER FORM ─────────────────────────────────────────────────────
function saveNewReminder() {
    const text = document.getElementById('rem-text-input').value.trim();
    const date = document.getElementById('rem-date-input').value;
    const time = document.getElementById('rem-time-input').value;

    if (!text) { alert('Please enter a reminder.'); return; }
    if (!date || !time) { alert('Please set a date and time.'); return; }

    const localDatetime = new Date(`${date}T${time}`);
    const datetime = localDatetime.toISOString();

    const reminders = loadReminders();
    reminders.push({
        id: 'rem_' + Date.now(),
        text,
        datetime,
        source: 'manual',
        done: false,
        createdAt: new Date().toISOString()
    });
    saveRemindersLocal(reminders);

    document.getElementById('rem-text-input').value = '';
    document.getElementById('rem-date-input').value = '';
    document.getElementById('rem-time-input').value = '';

    renderRemindersList();
    renderReminderTilePreview();
}

// ── MIC FOR REMINDERS ─────────────────────────────────────────────────────
let remMicActive = false;
let remRecognition = null;

function initRemMic() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const micBtn = document.getElementById('rem-mic-btn');
    if (!micBtn) return;
    if (!isAndroid || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        micBtn.style.display = 'none';
        return;
    }
    micBtn.style.display = 'flex';
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    remRecognition = new SpeechRecognition();
    const lang = localStorage.getItem('pulpai_lang') || 'nl-NL';
    remRecognition.lang = lang;
    remRecognition.continuous = false;
    remRecognition.interimResults = false;
    remRecognition.onstart = () => {
        remMicActive = true;
        micBtn.style.background = 'rgba(136,153,255,0.2)';
        micBtn.style.borderColor = 'rgba(136,153,255,0.5)';
        micBtn.style.color = '#8899ff';
    };
    remRecognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        const confidence = e.results[0][0].confidence;
        const input = document.getElementById('rem-text-input');
        if (input) {
            input.value = typeof applyVocabCorrections === 'function'
                ? applyVocabCorrections(transcript)
                : transcript;
            if (confidence < 0.7) {
                input.style.borderColor = 'rgba(255,140,0,0.5)';
                input.style.color = '#ffaa44';
                setTimeout(() => {
                    input.style.borderColor = '';
                    input.style.color = '';
                }, 3000);
            }
        }
    };
    remRecognition.onend = () => {
        remMicActive = false;
        micBtn.style.background = 'rgba(136,153,255,0.1)';
        micBtn.style.borderColor = 'rgba(136,153,255,0.2)';
        micBtn.style.color = 'rgba(136,153,255,0.7)';
    };
    remRecognition.onerror = () => {
        remMicActive = false;
        micBtn.style.background = 'rgba(136,153,255,0.1)';
        micBtn.style.borderColor = 'rgba(136,153,255,0.2)';
        micBtn.style.color = 'rgba(136,153,255,0.7)';
    };
}

function toggleRemMic() {
    if (!remRecognition) return;
    if (remMicActive) {
        remRecognition.stop();
    } else {
        remRecognition.start();
    }
}

// ── TILE PREVIEW ──────────────────────────────────────────────────────────
function renderReminderTilePreview() {
    const container = document.getElementById('rem-tile-preview');
    if (!container) return;
    const reminders = loadReminders();
    const now = new Date();
    const upcoming = reminders
        .filter(r => !r.done && new Date(r.datetime) >= now)
        .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
        .slice(0, 2);

    if (upcoming.length === 0) {
        container.innerHTML = `<div style="font-size:11px;color:rgba(255,255,255,0.25);letter-spacing:normal;text-transform:none;font-weight:400;">No upcoming reminders</div>`;
        return;
    }

    container.innerHTML = upcoming.map(r => {
        const dt = new Date(r.datetime);
        const dateStr = dt.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' });
        const timeStr = dt.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
        const dotColor = r.source === 'ai' ? '#8899ff' : '#a6e22e';
        return `<div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:7px 10px;margin-bottom:6px;">
            <div style="width:7px;height:7px;border-radius:50%;background:${dotColor};flex-shrink:0;"></div>
            <div style="flex:1;min-width:0;">
                <div style="font-size:11px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:normal;text-transform:none;">${escapeHtmlRem(r.text)}</div>
                <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-top:1px;"><i class="bi bi-clock" style="font-size:9px;"></i> ${dateStr} · ${timeStr}</div>
            </div>
        </div>`;
    }).join('');
}

// ── TILE MIC ──────────────────────────────────────────────────────────────
function initTileMic() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const tileMicBtn = document.getElementById('rem-tile-mic-btn');
    if (!tileMicBtn) return;
    if (!isAndroid || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        tileMicBtn.style.display = 'none';
        return;
    }
    tileMicBtn.style.display = 'flex';
}

function triggerTileMic() {
    openReminders();
    setTimeout(() => {
        initRemMic();
        if (remRecognition) {
            setTimeout(() => toggleRemMic(), 300);
        }
    }, 400);
}


// ── REMINDER NOTIFICATION SHEET ───────────────────────────────────────────
let _sheetReminderId = null;

function showReminderSheet(reminderId) {
    const reminders = loadReminders();
    let r = reminderId ? reminders.find(r => r.id === reminderId) : null;
    if (!r) {
        // Fall back to most recent overdue or upcoming
        const now = new Date();
        const overdue = reminders.filter(x => !x.done && new Date(x.datetime) < now);
        const upcoming = reminders.filter(x => !x.done && new Date(x.datetime) >= now);
        r = overdue.sort((a,b) => new Date(b.datetime)-new Date(a.datetime))[0]
            || upcoming.sort((a,b) => new Date(a.datetime)-new Date(b.datetime))[0];
    }
    if (!r) return;
    _sheetReminderId = r.id;

    const dt = new Date(r.datetime);
    const dateStr = dt.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' });
    const timeStr = dt.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
    const sourceStr = r.source === 'ai' ? ' · Via Pulp AI' : ' · Manual';

    document.getElementById('reminder-sheet-text').textContent = r.text;
    document.getElementById('reminder-sheet-meta').innerHTML = '<i class="bi bi-clock" style="font-size:10px;margin-right:3px;"></i>' + dateStr + ' · ' + timeStr + sourceStr;

    const overlay = document.getElementById('reminder-sheet-overlay');
    const sheet = document.getElementById('reminder-sheet');
    overlay.style.background = 'rgba(0,0,0,0.92)';
    overlay.style.display = 'flex';
    setTimeout(() => { sheet.style.transform = 'translateY(0)'; }, 10);
}


function showReminderSheetWithData(text, datetime, source, id) {
    // Shows the sheet with data passed directly — no localStorage needed
    // Used when Safari opens from notification tap (separate localStorage context)
    _sheetReminderId = id || null;

    const dt = datetime ? new Date(datetime) : null;
    const dateStr = dt ? dt.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' }) : '';
    const timeStr = dt ? dt.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }) : '';
    const sourceStr = source === 'ai' ? ' · Via Pulp AI' : ' · Manual';

    const textEl = document.getElementById('reminder-sheet-text');
    const metaEl = document.getElementById('reminder-sheet-meta');
    if (!textEl || !metaEl) return;

    textEl.textContent = text || 'You have a reminder due now.';
    metaEl.innerHTML = dt
        ? '<i class="bi bi-clock" style="font-size:10px;margin-right:3px;"></i>' + dateStr + ' · ' + timeStr + sourceStr
        : '<i class="bi bi-bell" style="font-size:10px;margin-right:3px;"></i>Due now';

    const overlay = document.getElementById('reminder-sheet-overlay');
    const sheet = document.getElementById('reminder-sheet');
    if (!overlay || !sheet) return;
    overlay.style.background = 'rgba(0,0,0,0.92)';
    overlay.style.display = 'flex';
    setTimeout(() => { sheet.style.transform = 'translateY(0)'; }, 10);
}

function hideReminderSheet() {
    const sheet = document.getElementById('reminder-sheet');
    const overlay = document.getElementById('reminder-sheet-overlay');
    sheet.style.transform = 'translateY(100%)';
    setTimeout(() => { overlay.style.display = 'none'; }, 300);
    _sheetReminderId = null;
}

function reminderSheetDone() {
    if (!_sheetReminderId) return;
    markReminderDone(_sheetReminderId);
    hideReminderSheet();
}

function reminderSheetDismiss() {
    hideReminderSheet();
}

function reminderSheetEdit() {
    if (!_sheetReminderId) return;
    const id = _sheetReminderId;
    hideReminderSheet();
    setTimeout(() => {
        openReminders();
        setTimeout(() => openEditReminder(id), 150);
    }, 320);
}

function reminderSheetSnooze(minutes) {
    if (!_sheetReminderId) return;
    const reminders = loadReminders();
    const r = reminders.find(r => r.id === _sheetReminderId);
    if (!r) return;
    const newTime = new Date(new Date().getTime() + minutes * 60000);
    r.datetime = newTime.toISOString();
    r.notified = false;
    saveRemindersLocal(reminders);
    renderReminderTilePreview();
    hideReminderSheet();
}

// ── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    renderReminderTilePreview();
    initTileMic();

    const input = document.getElementById('rem-text-input');
    if (input) {
        input.addEventListener('keypress', e => {
            if (e.key === 'Enter') saveNewReminder();
        });
    }

    const view = document.getElementById('reminders-view');
    if (view) {
        const observer = new MutationObserver(() => {
            if (!view.classList.contains('hidden')) {
                setTimeout(initRemMic, 100);
            }
        });
        observer.observe(view, { attributes: true, attributeFilter: ['class'] });
    }
});
