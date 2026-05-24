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
    // Sync to KV for push notification cron
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
    reminders.push({
        id: 'rem_' + Date.now(),
        text: data.text,
        datetime: data.datetime,
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
    // Request push permission via OneSignal when user opens reminders
    setTimeout(() => {
        if (window.OneSignal) {
            OneSignal.Notifications.requestPermission();
        }
    }, 500);
}

function closeReminders() {
    document.getElementById('reminders-view').classList.add('hidden');
    document.getElementById('fruit-hub').classList.remove('hidden');
    const menuTrigger = document.getElementById('menu-trigger');
    if (menuTrigger) menuTrigger.style.display = '';
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

    let html = '';

    if (upcoming.length === 0 && overdue.length === 0) {
        html += `<div style="text-align:center;padding:40px 20px;font-size:14px;color:rgba(255,255,255,0.25);font-weight:400;letter-spacing:normal;text-transform:none;">No reminders yet.<br>Add one below.</div>`;
    }

    if (overdue.length > 0) {
        html += `<div style="font-size:9px;font-weight:700;color:rgba(255,80,80,0.6);text-transform:uppercase;letter-spacing:2px;padding:4px 2px;margin-bottom:6px;">Overdue</div>`;
        overdue.forEach(r => { html += renderReminderCard(r, true); });
    }

    if (upcoming.length > 0) {
        html += `<div style="font-size:9px;font-weight:700;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:2px;padding:4px 2px;margin-bottom:6px;${overdue.length > 0 ? 'margin-top:12px;' : ''}">Upcoming</div>`;
        upcoming.forEach(r => { html += renderReminderCard(r, false); });
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
    const dotColor = done ? '#555' : overdue ? '#ff5050' : r.source === 'ai' ? '#8899ff' : '#a6e22e';
    const borderColor = done ? 'rgba(255,255,255,0.04)' : overdue ? 'rgba(255,80,80,0.15)' : 'rgba(255,255,255,0.06)';
    const bgColor = done ? 'rgba(255,255,255,0.01)' : overdue ? 'rgba(255,80,80,0.03)' : 'rgba(255,255,255,0.03)';
    const tagHtml = r.source === 'ai'
        ? `<span style="font-size:8px;font-weight:700;padding:2px 7px;border-radius:100px;background:rgba(136,153,255,0.1);color:#8899ff;border:1px solid rgba(136,153,255,0.2);text-transform:uppercase;letter-spacing:0.5px;">Via Pulp AI</span>`
        : `<span style="font-size:8px;font-weight:700;padding:2px 7px;border-radius:100px;background:rgba(166,226,46,0.08);color:#a6e22e;border:1px solid rgba(166,226,46,0.2);text-transform:uppercase;letter-spacing:0.5px;">Manual</span>`;

    return `<div style="display:flex;align-items:center;gap:10px;padding:12px 13px;background:${bgColor};border:1px solid ${borderColor};border-radius:14px;margin-bottom:8px;${done ? 'opacity:0.45;' : ''}">
        <div style="width:10px;height:10px;border-radius:50%;background:${dotColor};flex-shrink:0;"></div>
        <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:700;color:${done ? 'rgba(255,255,255,0.4)' : '#fff'};margin-bottom:3px;letter-spacing:normal;text-transform:none;${done ? 'text-decoration:line-through;' : ''}">${escapeHtmlRem(r.text)}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.3);display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <i class="bi bi-clock" style="font-size:10px;"></i> ${dateStr} · ${timeStr}
                ${tagHtml}
            </div>
        </div>
        ${!done ? `<div onclick="markReminderDone('${r.id}')" style="width:26px;height:26px;border-radius:8px;background:rgba(166,226,46,0.07);border:1px solid rgba(166,226,46,0.15);display:flex;align-items:center;justify-content:center;font-size:12px;color:rgba(166,226,46,0.5);cursor:pointer;flex-shrink:0;"><i class="bi bi-check-lg"></i></div>` : ''}
        <div onclick="deleteReminder('${r.id}')" style="width:26px;height:26px;border-radius:8px;background:rgba(255,77,77,0.07);border:1px solid rgba(255,77,77,0.15);display:flex;align-items:center;justify-content:center;font-size:12px;color:rgba(255,77,77,0.5);cursor:pointer;flex-shrink:0;"><i class="bi bi-trash"></i></div>
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

// ── ADD REMINDER FORM ─────────────────────────────────────────────────────
function saveNewReminder() {
    const text = document.getElementById('rem-text-input').value.trim();
    const date = document.getElementById('rem-date-input').value;
    const time = document.getElementById('rem-time-input').value;

    if (!text) { alert('Please enter a reminder.'); return; }
    if (!date || !time) { alert('Please set a date and time.'); return; }

    const datetime = `${date}T${time}`;
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

    // Reset form
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
            // Apply vocab corrections
            input.value = typeof applyVocabCorrections === 'function'
                ? applyVocabCorrections(transcript)
                : transcript;
            // Highlight orange if low confidence
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

// ── TILE MIC (Android quick mic on tile) ──────────────────────────────────
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
    // Open reminders screen and auto-trigger mic
    openReminders();
    setTimeout(() => {
        initRemMic();
        if (remRecognition) {
            setTimeout(() => toggleRemMic(), 300);
        }
    }, 400);
}

// ── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    renderReminderTilePreview();
    initTileMic();

    // Enter key on reminder text input
    const input = document.getElementById('rem-text-input');
    if (input) {
        input.addEventListener('keypress', e => {
            if (e.key === 'Enter') saveNewReminder();
        });
    }

    // Init mic when reminders view is opened
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
