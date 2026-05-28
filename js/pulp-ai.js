// ── PULP AI ──────────────────────────────────────────────────────────────
const WORKER_URL = 'https://pulppro-access.pulpprobrain.workers.dev';
let pulpAIChats = [];
let currentChatId = null;
let pulpAIUsage = { used: 0, limit: 1000 };
let isAIThinking = false;
let pulpAIMicActive = false;
let pulpAIRecognition = null;

// ── AURA ENGINE ──────────────────────────────────────────────────────────
function createAura(canvas, size) {
    if (!canvas) return;
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    const cx = size / 2, cy = size / 2;
    const off = document.createElement('canvas');
    off.width = size; off.height = size;
    const oc = off.getContext('2d');
    const blobs = [
        { ax:0.38, ay:0.38, dx:0.12, dy:0.11, sx:0.00144, sy:0.00104, ph:0.0, rx:0.68, ry:0.62, col:[160,222,40] },
        { ax:0.62, ay:0.32, dx:0.11, dy:0.13, sx:0.00112, sy:0.00128, ph:1.8, rx:0.58, ry:0.60, col:[128,210,34] },
        { ax:0.55, ay:0.68, dx:0.13, dy:0.10, sx:0.00128, sy:0.00096, ph:3.5, rx:0.54, ry:0.52, col:[192,236,54] },
        { ax:0.28, ay:0.62, dx:0.10, dy:0.12, sx:0.00096, sy:0.00144, ph:5.2, rx:0.46, ry:0.50, col:[144,214,36] },
        { ax:0.68, ay:0.60, dx:0.11, dy:0.11, sx:0.00120, sy:0.00112, ph:2.6, rx:0.44, ry:0.46, col:[172,228,44] },
    ];
    const sm = blobs.map(b => ({ x: b.ax*size, y: b.ay*size, rx: b.rx*size, ry: b.ry*size }));
    const L = 0.08;
    function lerp(a, b, t) { return a + (b-a)*t; }
    const start = Date.now();
    function draw() {
        const t = (Date.now()-start)*0.001;
        blobs.forEach((b, i) => {
            const tx = (b.ax + Math.sin(t*b.sx*1000+b.ph)*b.dx)*size;
            const ty = (b.ay + Math.cos(t*b.sy*1000+b.ph*1.3)*b.dy)*size;
            const trx = b.rx*size*(0.86+Math.sin(t*1.2+b.ph)*0.14);
            const try_ = b.ry*size*(0.86+Math.cos(t*1.0+b.ph)*0.14);
            sm[i].x = lerp(sm[i].x, tx, L); sm[i].y = lerp(sm[i].y, ty, L);
            sm[i].rx = lerp(sm[i].rx, trx, L); sm[i].ry = lerp(sm[i].ry, try_, L);
        });
        oc.clearRect(0,0,size,size);
        oc.save(); oc.beginPath(); oc.arc(cx,cy,size/2,0,Math.PI*2); oc.clip();
        oc.fillStyle='#040904'; oc.fillRect(0,0,size,size);
        blobs.forEach((b,i) => {
            const { x:bx, y:by, rx:bRx, ry:bRy } = sm[i];
            const g = oc.createRadialGradient(bx,by,0,bx,by,Math.max(bRx,bRy));
            const [r,g2,bl] = b.col;
            g.addColorStop(0,   `rgba(${r},${g2},${bl},0.52)`);
            g.addColorStop(0.3, `rgba(${r},${g2},${bl},0.24)`);
            g.addColorStop(0.6, `rgba(${r},${g2},${bl},0.08)`);
            g.addColorStop(1,   `rgba(${r},${g2},${bl},0)`);
            oc.save(); oc.translate(bx,by); oc.scale(1,bRy/bRx); oc.translate(-bx,-by);
            oc.beginPath(); oc.arc(bx,by,bRx,0,Math.PI*2);
            oc.fillStyle=g; oc.globalCompositeOperation='screen'; oc.fill(); oc.restore();
        });
        const vig = oc.createRadialGradient(cx,cy,size*0.42,cx,cy,size/2);
        vig.addColorStop(0,'rgba(4,9,4,0)'); vig.addColorStop(0.7,'rgba(4,9,4,0.35)'); vig.addColorStop(1,'rgba(4,9,4,0.95)');
        oc.globalCompositeOperation='source-over'; oc.fillStyle=vig; oc.fillRect(0,0,size,size);
        oc.restore();
        ctx.clearRect(0,0,size,size); ctx.drawImage(off,0,0);
        requestAnimationFrame(draw);
    }
    draw();
}

// ── PERIMETER GLOW ────────────────────────────────────────────────────────
function startPerimeterGlow(canvas) {
    const parent = canvas.parentElement;
    function resize() {
        canvas.width = parent.offsetWidth || 390;
        canvas.height = parent.offsetHeight || 600;
    }
    resize();
    const ctx = canvas.getContext('2d');
    const start = Date.now();
    function draw() {
        const W = canvas.width, H = canvas.height;
        const t = (Date.now()-start)*0.001;
        ctx.clearRect(0,0,W,H);
        const isThinking = isAIThinking;
        const baseIntensity = isThinking ? 0.28 : 0.13;
        const speed = isThinking ? 2.5 : 0.5;
        [[0,0],[W,0],[0,H],[W,H]].forEach(([cx,cy],i) => {
            const p = baseIntensity + Math.sin(t*speed+i*0.8)*0.06;
            const g = ctx.createRadialGradient(cx,cy,0,cx,cy,130);
            g.addColorStop(0,`rgba(166,226,46,${p})`);
            g.addColorStop(0.5,`rgba(166,226,46,${p*0.35})`);
            g.addColorStop(1,'rgba(166,226,46,0)');
            ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
        });
        const lp = (isThinking ? 0.18 : 0.07) + Math.sin(t*(isThinking?1.8:0.6))*0.04;
        const lg = ctx.createLinearGradient(0,0,55,0);
        lg.addColorStop(0,`rgba(166,226,46,${lp})`);
        lg.addColorStop(1,'rgba(166,226,46,0)');
        ctx.fillStyle=lg; ctx.fillRect(0,0,55,H);
        const rg = ctx.createLinearGradient(W-55,0,W,0);
        rg.addColorStop(0,'rgba(166,226,46,0)');
        rg.addColorStop(1,`rgba(166,226,46,${lp})`);
        ctx.fillStyle=rg; ctx.fillRect(W-55,0,55,H);
        const bp = (isThinking ? 0.22 : 0.09) + Math.sin(t*(isThinking?3:0.4))*0.04;
        const bsweep = isThinking ? (Math.sin(t*2.2)+1)/2 : 0.5;
        const bg = ctx.createRadialGradient(W*(0.3+bsweep*0.4),H,0,W*(0.3+bsweep*0.4),H,170);
        bg.addColorStop(0,`rgba(166,226,46,${bp})`);
        bg.addColorStop(1,'rgba(166,226,46,0)');
        ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
        if (isThinking) {
            const sweep = (Math.sin(t*1.8)+1)/2;
            const tg = ctx.createLinearGradient(0,0,W,0);
            tg.addColorStop(0,'rgba(166,226,46,0)');
            tg.addColorStop(sweep,`rgba(200,245,80,0.45)`);
            tg.addColorStop(Math.min(sweep+0.3,1),'rgba(166,226,46,0.15)');
            tg.addColorStop(1,'rgba(166,226,46,0)');
            ctx.save(); ctx.fillStyle=tg; ctx.fillRect(0,0,W,50);
            const tmask=ctx.createLinearGradient(0,0,0,50);
            tmask.addColorStop(0,'rgba(0,0,0,0)'); tmask.addColorStop(1,'rgba(0,0,0,1)');
            ctx.fillStyle=tmask; ctx.globalCompositeOperation='destination-out'; ctx.fillRect(0,0,W,50);
            ctx.restore();
        }
        requestAnimationFrame(draw);
    }
    draw();
}

// ── CHAT STORAGE ─────────────────────────────────────────────────────────
function getChatStorageKey() {
    const code = localStorage.getItem('pulpProAccessCode') || 'admin';
    return `pulpai_chats_${code}`;
}
function loadChats() {
    try {
        const stored = localStorage.getItem(getChatStorageKey());
        pulpAIChats = stored ? JSON.parse(stored) : [];
    } catch(e) { pulpAIChats = []; }
}
function saveChats() {
    try { localStorage.setItem(getChatStorageKey(), JSON.stringify(pulpAIChats)); } catch(e) {}
}
function newChat() {
    const id = 'chat_' + Date.now();
    pulpAIChats.unshift({ id, title: 'New conversation', messages: [], createdAt: new Date().toISOString() });
    saveChats();
    return id;
}
function getChatById(id) { return pulpAIChats.find(c => c.id === id); }

// ── USAGE BAR ─────────────────────────────────────────────────────────────
function updateUsageBar() {
    const used = pulpAIUsage.used || 0;
    const limit = pulpAIUsage.limit || 1000;
    const pct = Math.min(100, Math.round((used / limit) * 100));
    const color = pct >= 90 ? '#ff5050' : pct >= 75 ? '#ff8c00' : '#a6e22e';

    ['pulpai-usage-bar','pulpai-usage-bar-chat'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.style.width = pct + '%'; el.style.background = color; }
    });
    ['pulpai-usage-count','pulpai-usage-count-chat'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.innerText = `${used} / ${limit}`; el.style.color = color; }
    });

    const warn = document.getElementById('pulpai-limit-warn');
    if (warn) {
        if (pct >= 90) {
            warn.style.display = 'flex';
            warn.innerHTML = `<span style="font-size:10px;color:rgba(255,80,80,0.9);">Monthly limit almost reached · ${limit - used} messages left</span>`;
        } else if (pct >= 75) {
            warn.style.display = 'flex';
            warn.innerHTML = `<span style="font-size:10px;color:rgba(255,140,0,0.8);">${limit - used} messages remaining today · Resets midnight UTC</span>`;
        } else {
            warn.style.display = 'none';
        }
    }
}

async function fetchUsage() {
    try {
        const res = await fetch(WORKER_URL + '/pulp-ai-usage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        const data = await res.json();
        pulpAIUsage = data;
        updateUsageBar();
    } catch(e) {}
}

// ── MIC ───────────────────────────────────────────────────────────────────
function initMic() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const micBtn = document.getElementById('pulpai-mic-btn');
    if (!micBtn) return;
    if (!isAndroid || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        micBtn.style.display = 'none';
        return;
    }
    micBtn.style.display = 'flex';
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    pulpAIRecognition = new SpeechRecognition();
    const lang = localStorage.getItem('pulpai_lang') || 'nl-NL';
    pulpAIRecognition.lang = lang;
    pulpAIRecognition.continuous = false;
    pulpAIRecognition.interimResults = true;
    pulpAIRecognition.onstart = () => {
        pulpAIMicActive = true;
        micBtn.style.background = 'rgba(166,226,46,0.2)';
        micBtn.style.borderColor = 'rgba(166,226,46,0.5)';
    };
    pulpAIRecognition.onresult = (e) => {
        let transcript = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
            transcript += e.results[i][0].transcript;
        }
        const input = document.getElementById('pulpai-input');
        if (input) input.value = applyVocabCorrections(transcript);
    };
    pulpAIRecognition.onend = () => {
        pulpAIMicActive = false;
        micBtn.style.background = 'rgba(166,226,46,0.07)';
        micBtn.style.borderColor = 'rgba(166,226,46,0.15)';
    };
    pulpAIRecognition.onerror = () => {
        pulpAIMicActive = false;
        micBtn.style.background = 'rgba(166,226,46,0.07)';
        micBtn.style.borderColor = 'rgba(166,226,46,0.15)';
    };
}

function toggleMic() {
    if (!pulpAIRecognition) return;
    if (pulpAIMicActive) {
        pulpAIRecognition.stop();
    } else {
        pulpAIRecognition.start();
    }
}

// ── VOCAB CORRECTIONS ─────────────────────────────────────────────────────
function applyVocabCorrections(text) {
    const corrections = {
        '\\bsell\\b': 'cel', '\\bcell\\b': 'cel', '\\bsale\\b': 'cel', '\\bsel\\b': 'cel',
        '\\bselle\\b': 'cel', '\\bcelle\\b': 'cel',
        '\\bfusearium\\b': 'Fusarium', '\\bfusareum\\b': 'Fusarium', '\\bfuzarium\\b': 'Fusarium',
        '\\betheline\\b': 'ethylene', '\\bethiline\\b': 'ethylene', '\\bethyleen\\b': 'ethyleen',
        '\\bcheckita\\b': 'Chiquita', '\\bchiquetta\\b': 'Chiquita', '\\bshikita\\b': 'Chiquita',
        '\\bcrown rot\\b': 'crown rot', '\\bcrownrot\\b': 'crown rot',
        '\\bkroonrot\\b': 'kroonrot', '\\bkroon rot\\b': 'kroonrot',
        '\\bripening\\b': 'ripening', '\\brijping\\b': 'rijping',
        '\\bkolkrot\\b': 'kolkrot', '\\bcolk rot\\b': 'kolkrot',
    };
    let result = text;
    Object.entries(corrections).forEach(([pattern, replacement]) => {
        result = result.replace(new RegExp(pattern, 'gi'), replacement);
    });
    result = result.replace(/\b(?:sell|cell|sale|sel|selle|celle)\s*(\d+)/gi, 'cel $1');
    return result;
}

// ── SEND MESSAGE ─────────────────────────────────────────────────────────
async function sendPulpAIMessage() {
    const input = document.getElementById('pulpai-input');
    const text = input.value.trim();
    if (!text || isAIThinking) return;
    const chat = getChatById(currentChatId);
    if (!chat) return;

    if (pulpAIUsage.used >= pulpAIUsage.limit) {
        showPulpAILimitScreen();
        return;
    }

    input.value = '';
    isAIThinking = true;

    chat.messages.push({ role: 'user', content: text });
    saveChats();
    renderChatMessages(currentChatId);
    scrollChatToBottom();

    const typingEl = document.getElementById('pulpai-typing');
    if (typingEl) typingEl.style.display = 'flex';
    scrollChatToBottom();

    try {
        const code = localStorage.getItem('pulpProAccessCode') || '';
        const isAdmin = localStorage.getItem('pulpProAdmin') === 'true';

        const now = new Date();
        const clientDatetime = now.toLocaleString('en-GB', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false,
            timeZoneName: 'short'
        });
        const pad = n => String(n).padStart(2, '0');
        const clientDatetimeISO = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        // Pass current reminders so AI can answer questions about them
        let currentReminders = [];
        try { currentReminders = JSON.parse(localStorage.getItem('pulpai_reminders') || '[]'); } catch(e) {}

        const res = await fetch(WORKER_URL + '/pulp-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: chat.messages.map(m => ({ role: m.role, content: m.content })),
                userCode: code,
                isAdmin,
                clientDatetime,
                clientDatetimeISO,
                reminders: currentReminders
            })
        });
        const data = await res.json();
        if (typingEl) typingEl.style.display = 'none';

        if (data.error === 'monthly_limit_reached') {
            isAIThinking = false;
            showPulpAILimitScreen();
            return;
        }

        let reply = data.reply;

        chat.messages.push({ role: 'assistant', content: reply });
        if (data.usage) { pulpAIUsage = data.usage; updateUsageBar(); }

        if (chat.title === 'New conversation' && chat.messages.filter(m => m.role === 'assistant').length === 1) {
            const words = reply.replace(/[*#\n<>]/g, ' ').split(' ').filter(w => w.length > 3);
            chat.title = words.slice(0, 5).join(' ').slice(0, 45) || 'New conversation';
        }
        saveChats();
        renderChatMessages(currentChatId);
        scrollToLastAIMessage();

    } catch(e) {
        if (typingEl) typingEl.style.display = 'none';
        chat.messages.push({ role: 'assistant', content: 'Sorry, something went wrong. Please check your connection and try again.' });
        saveChats();
        renderChatMessages(currentChatId);
    }

    isAIThinking = false;
}

// ── PHOTO ANALYSIS ────────────────────────────────────────────────────────
function togglePhotoPopup() {
    const popup = document.getElementById('pulpai-photo-popup');
    if (!popup) return;
    popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
}

function triggerCamera() {
    document.getElementById('pulpai-camera-input').click();
}

function triggerGallery() {
    document.getElementById('pulpai-gallery-input').click();
}

async function handlePhotoSelected(file) {
    if (!file) return;
    const fruitText = (document.getElementById('pulpai-fruit-input') || {}).value || '';
    if (!fruitText.trim()) {
        alert('Please type the fruit or vegetable name first.');
        return;
    }
    const popup = document.getElementById('pulpai-photo-popup');
    if (popup) popup.style.display = 'none';

    const chat = getChatById(currentChatId);
    if (!chat) return;
    if (pulpAIUsage.used >= pulpAIUsage.limit) { showPulpAILimitScreen(); return; }

    isAIThinking = true;

    const userMsg = `[Photo: ${fruitText}] Please analyse this ${fruitText} for defects and quality.`;
    chat.messages.push({ role: 'user', content: userMsg });
    saveChats();
    renderChatMessages(currentChatId);
    scrollChatToBottom();

    const typingEl = document.getElementById('pulpai-typing');
    if (typingEl) typingEl.style.display = 'flex';

    try {
        const base64 = await fileToBase64(file);
        const code = localStorage.getItem('pulpProAccessCode') || '';
        const isAdmin = localStorage.getItem('pulpProAdmin') === 'true';
        const res = await fetch(WORKER_URL + '/pulp-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: `Analyse this ${fruitText}` }],
                userCode: code,
                isAdmin,
                imageBase64: base64,
                imageFruit: fruitText
            })
        });
        const data = await res.json();
        if (typingEl) typingEl.style.display = 'none';
        const reply = data.error ? `Could not analyse the image. ${data.detail || ''}`.trim() : (data.reply || 'Could not analyse the image.');
        chat.messages.push({ role: 'assistant', content: reply });
        if (data.usage) { pulpAIUsage = data.usage; updateUsageBar(); }
        saveChats();
        renderChatMessages(currentChatId);
        scrollToLastAIMessage();
    } catch(e) {
        if (typingEl) typingEl.style.display = 'none';
        chat.messages.push({ role: 'assistant', content: 'Could not analyse the image. Please try again.' });
        saveChats();
        renderChatMessages(currentChatId);
    }
    isAIThinking = false;
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = (e) => {
            img.onload = () => {
                const MAX = 1024;
                let w = img.width, h = img.height;
                if (w > MAX || h > MAX) {
                    if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
                    else { w = Math.round(w * MAX / h); h = MAX; }
                }
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
                resolve(base64);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function renderChatMessages(chatId) {
    const chat = getChatById(chatId);
    const container = document.getElementById('pulpai-messages');
    if (!chat || !container) return;
    container.innerHTML = chat.messages.map(m => {
        if (m.role === 'user') {
            return `<div class="pulpai-msg-u"><div class="pulpai-bub-u">${escapeHtml(m.content)}</div></div>`;
        } else {
            return `<div class="pulpai-msg-a">
                <div class="pulpai-avatar"><canvas class="pulpai-orb-canvas" width="20" height="20"></canvas></div>
                <div><div class="pulpai-msg-name">Pulp AI</div><div class="pulpai-bub-a">${formatAIText(m.content)}</div></div>
            </div>`;
        }
    }).join('');
    container.querySelectorAll('.pulpai-orb-canvas').forEach(c => createAura(c, 20));
}

function renderChatList() {
    const container = document.getElementById('pulpai-chat-list');
    if (!container) return;
    if (pulpAIChats.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:40px 20px;font-size:15px;color:rgba(255,255,255,0.25);letter-spacing:normal;text-transform:none;font-weight:400;">No chats yet.<br>Start a conversation below.</div>`;
        return;
    }
    container.innerHTML = pulpAIChats.map(c => {
        const preview = c.messages.length > 0
            ? escapeHtml(c.messages[c.messages.length-1].content).slice(0, 60) + '...'
            : 'No messages yet';
        return `<div style="display:flex;align-items:center;gap:12px;padding:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;margin-bottom:10px;cursor:pointer;" onmouseenter="this.style.borderColor='rgba(166,226,46,0.25)'" onmouseleave="this.style.borderColor='rgba(255,255,255,0.07)'">
            <div onclick="openChat('${c.id}')" style="width:42px;height:42px;border-radius:13px;background:rgba(166,226,46,0.07);border:1px solid rgba(166,226,46,0.12);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:rgba(166,226,46,0.6);font-size:18px;">
                <i class="bi bi-chat-text"></i>
            </div>
            <div onclick="openChat('${c.id}')" style="flex:1;min-width:0;">
                <div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:normal;text-transform:none;">${escapeHtml(c.title)}</div>
                <div style="font-size:13px;color:rgba(255,255,255,0.35);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:normal;text-transform:none;">${preview}</div>
            </div>
            <div onclick="deleteChat('${c.id}')" style="width:32px;height:32px;border-radius:9px;background:rgba(255,77,77,0.08);border:1px solid rgba(255,77,77,0.2);display:flex;align-items:center;justify-content:center;font-size:14px;color:rgba(255,77,77,0.6);cursor:pointer;flex-shrink:0;">
                <i class="bi bi-x"></i>
            </div>
            <div onclick="openChat('${c.id}')" style="font-size:18px;color:rgba(255,255,255,0.2);flex-shrink:0;">
                <i class="bi bi-chevron-right"></i>
            </div>
        </div>`;
    }).join('');
}

function escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatAIText(text) {
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    if (text.includes('|')) {
        const lines = text.split('\n');
        let inTable = false;
        let tableHtml = '';
        let output = [];
        lines.forEach((line, idx) => {
            if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
                if (!inTable) {
                    inTable = true;
                    tableHtml = '<table class="pulpai-table">';
                }
                if (line.replace(/[\s|:-]/g,'').length === 0) return;
                const cells = line.split('|').filter(c => c.trim() !== '');
                const tag = (idx === 0 || lines[idx-1]?.replace(/[\s|:-]/g,'').length === 0) ? 'th' : 'td';
                tableHtml += '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
            } else {
                if (inTable) {
                    tableHtml += '</table>';
                    output.push(tableHtml);
                    tableHtml = '';
                    inTable = false;
                }
                output.push(line);
            }
        });
        if (inTable) { tableHtml += '</table>'; output.push(tableHtml); }
        text = output.join('\n');
    }
    text = text.replace(/^[•\-\*]\s+(.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    text = text.replace(/\n/g, '<br>');
    return text;
}

function scrollChatToBottom() {
    const msgs = document.getElementById('pulpai-messages');
    if (msgs) setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 50);
}

function openPulpAI() {
    loadChats();
    fetchUsage();
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    document.getElementById('colour-scanner-view').classList.add('hidden');
    document.getElementById('pulpai-view').classList.remove('hidden');
    const menuTrigger = document.getElementById('menu-trigger');
    if (menuTrigger) menuTrigger.style.display = 'none';
    renderChatList();
    setTimeout(() => {
        const menuOrb = document.getElementById('pulpai-menu-orb');
        if (menuOrb) createAura(menuOrb, 42);
    }, 100);
}

function openChat(chatId) {
    currentChatId = chatId;
    document.getElementById('pulpai-list-screen').classList.add('hidden');
    document.getElementById('pulpai-chat-screen').classList.remove('hidden');
    const chat = getChatById(chatId);
    const titleEl = document.getElementById('pulpai-chat-title');
    if (titleEl && chat) titleEl.innerText = chat.title;
    renderChatMessages(chatId);
    scrollChatToBottom();
    setTimeout(() => {
        const chatOrb = document.getElementById('pulpai-chat-orb');
        if (chatOrb) createAura(chatOrb, 28);
        const glowCanvas = document.getElementById('pulpai-glow-canvas');
        if (glowCanvas) startPerimeterGlow(glowCanvas);
        initMic();
        // Wire up photo input listeners
        const camInput = document.getElementById('pulpai-camera-input');
        const galInput = document.getElementById('pulpai-gallery-input');
        if (camInput && !camInput._pulpWired) {
            camInput._pulpWired = true;
            camInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) handlePhotoSelected(e.target.files[0]);
                e.target.value = '';
            });
        }
        if (galInput && !galInput._pulpWired) {
            galInput._pulpWired = true;
            galInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) handlePhotoSelected(e.target.files[0]);
                e.target.value = '';
            });
        }
    }, 100);
    fetchUsage();
    const popup = document.getElementById('pulpai-photo-popup');
    if (popup) popup.style.display = 'none';
}

function newPulpAIChat() {
    const id = newChat();
    openChat(id);
}

function deleteChat(chatId) {
    pulpAIChats = pulpAIChats.filter(c => c.id !== chatId);
    saveChats();
    renderChatList();
}

function backToChatList() {
    currentChatId = null;
    isAIThinking = false;
    document.getElementById('pulpai-chat-screen').classList.add('hidden');
    document.getElementById('pulpai-list-screen').classList.remove('hidden');
    renderChatList();
}

function closePulpAI() {
    document.getElementById('pulpai-view').classList.add('hidden');
    document.getElementById('fruit-hub').classList.remove('hidden');
    const menuTrigger = document.getElementById('menu-trigger');
    if (menuTrigger) menuTrigger.style.display = '';
}

function initPulpAITile() {
    const tileCanvas = document.getElementById('pulpai-tile-canvas');
    if (tileCanvas) {
        const tile = tileCanvas.parentElement;
        tileCanvas.width = tile.offsetWidth || 320;
        tileCanvas.height = tile.offsetHeight || 140;
        createAura(tileCanvas, Math.max(tileCanvas.width, tileCanvas.height));
    }
}

function scrollToLastAIMessage() {
    const msgs = document.getElementById('pulpai-messages');
    if (!msgs) return;
    setTimeout(() => {
        const aiMessages = msgs.querySelectorAll('.pulpai-msg-a');
        if (aiMessages.length > 0) {
            const last = aiMessages[aiMessages.length - 1];
            last.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 80);
}

function showPulpAILimitScreen() {
    const messages = document.getElementById('pulpai-messages');
    if (!messages) return;
    messages.innerHTML += `<div style="text-align:center;padding:24px 16px;display:flex;flex-direction:column;align-items:center;gap:12px;">
        <i class="bi bi-lock-fill" style="font-size:28px;color:rgba(255,80,80,0.7)"></i>
        <div style="font-size:15px;font-weight:700;color:#fff;letter-spacing:normal;text-transform:none;">Monthly limit reached</div>
    </div>`;
}
