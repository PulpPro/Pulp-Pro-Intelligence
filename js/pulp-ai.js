// ── PULP AI ──────────────────────────────────────────────────────────────
const WORKER_URL = 'https://pulppro-access.pulpprobrain.workers.dev';

let pulpAIChats = [];         // all chat sessions
let currentChatId = null;     // active chat id
let pulpAIUsage = { personal: 0, personalLimit: 500, pool: 0, poolLimit: 5000, adminUsed: 0, adminLimit: 700 };
let isAIThinking = false;

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

// ── PERIMETER GLOW ───────────────────────────────────────────────────────
function startPerimeterGlow(canvas, getMode) {
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
        const mode = getMode();
        ctx.clearRect(0,0,W,H);
        if (mode === 'idle') {
            [[0,0],[W,0],[0,H],[W,H]].forEach(([cx,cy]) => {
                const pulse = 0.10 + Math.sin(t*0.7+cx*0.01)*0.04;
                const g = ctx.createRadialGradient(cx,cy,0,cx,cy,110);
                g.addColorStop(0,`rgba(166,226,46,${pulse})`);
                g.addColorStop(1,'rgba(166,226,46,0)');
                ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
            });
            const bg = ctx.createRadialGradient(W/2,H,0,W/2,H,150);
            bg.addColorStop(0,`rgba(166,226,46,${0.07+Math.sin(t*0.5)*0.03})`);
            bg.addColorStop(1,'rgba(166,226,46,0)');
            ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
        } else {
            // thinking — bright sweep
            const intensity = 0.45 + Math.sin(t*2.5)*0.2;
            const sweep = (Math.sin(t*1.8)+1)/2;
            // top edge
            const tg = ctx.createLinearGradient(0,0,W,0);
            tg.addColorStop(0,'rgba(166,226,46,0)');
            tg.addColorStop(sweep,`rgba(200,245,80,${intensity})`);
            tg.addColorStop(Math.min(sweep+0.3,1),`rgba(166,226,46,${intensity*0.3})`);
            tg.addColorStop(1,'rgba(166,226,46,0)');
            ctx.save(); ctx.fillStyle=tg; ctx.fillRect(0,0,W,50);
            const tmask=ctx.createLinearGradient(0,0,0,50);
            tmask.addColorStop(0,'rgba(0,0,0,0)'); tmask.addColorStop(1,'rgba(0,0,0,1)');
            ctx.fillStyle=tmask; ctx.globalCompositeOperation='destination-out'; ctx.fillRect(0,0,W,50); ctx.restore();
            // left edge
            const lsweep=(Math.sin(t*1.4+1)+1)/2;
            const lg=ctx.createLinearGradient(0,0,0,H);
            lg.addColorStop(0,'rgba(120,200,40,0)'); lg.addColorStop(lsweep,`rgba(120,200,40,${intensity*0.7})`); lg.addColorStop(1,'rgba(120,200,40,0)');
            ctx.save(); ctx.fillStyle=lg; ctx.fillRect(0,0,55,H);
            const lmask=ctx.createLinearGradient(0,0,55,0);
            lmask.addColorStop(0,'rgba(0,0,0,0)'); lmask.addColorStop(1,'rgba(0,0,0,1)');
            ctx.fillStyle=lmask; ctx.globalCompositeOperation='destination-out'; ctx.fillRect(0,0,55,H); ctx.restore();
            // right edge
            const rsweep=(Math.sin(t*1.6+2)+1)/2;
            const rg=ctx.createLinearGradient(0,0,0,H);
            rg.addColorStop(0,'rgba(190,235,50,0)'); rg.addColorStop(rsweep,`rgba(190,235,50,${intensity*0.65})`); rg.addColorStop(1,'rgba(190,235,50,0)');
            ctx.save(); ctx.fillStyle=rg; ctx.fillRect(W-55,0,55,H);
            const rmask=ctx.createLinearGradient(W-55,0,W,0);
            rmask.addColorStop(0,'rgba(0,0,0,1)'); rmask.addColorStop(1,'rgba(0,0,0,0)');
            ctx.fillStyle=rmask; ctx.globalCompositeOperation='destination-out'; ctx.fillRect(W-55,0,55,H); ctx.restore();
            // bottom bloom
            const bi=0.5+Math.sin(t*3)*0.2;
            const bsweep=(Math.sin(t*2.2)+1)/2;
            const bg2=ctx.createRadialGradient(W*(0.3+bsweep*0.4),H,0,W*(0.3+bsweep*0.4),H,170);
            bg2.addColorStop(0,`rgba(166,226,46,${bi})`); bg2.addColorStop(0.4,`rgba(166,226,46,${bi*0.3})`); bg2.addColorStop(1,'rgba(166,226,46,0)');
            ctx.fillStyle=bg2; ctx.fillRect(0,0,W,H);
            // corner sparks
            [[0,0],[W,0],[0,H],[W,H]].forEach(([cx,cy],idx) => {
                const cp=Math.max(0,Math.sin(t*2+idx*1.5))*intensity*0.45;
                const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,75);
                cg.addColorStop(0,`rgba(220,255,100,${cp})`); cg.addColorStop(1,'rgba(166,226,46,0)');
                ctx.fillStyle=cg; ctx.fillRect(0,0,W,H);
            });
        }
        requestAnimationFrame(draw);
    }
    draw();
}

// ── KV CHAT STORAGE ──────────────────────────────────────────────────────
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
    try {
        localStorage.setItem(getChatStorageKey(), JSON.stringify(pulpAIChats));
    } catch(e) {}
}

function newChat() {
    const id = 'chat_' + Date.now();
    pulpAIChats.unshift({ id, title: 'New conversation', messages: [], createdAt: new Date().toISOString() });
    saveChats();
    return id;
}

function getChatById(id) {
    return pulpAIChats.find(c => c.id === id);
}

// ── USAGE BAR ────────────────────────────────────────────────────────────
function updateUsageBar() {
    const isAdmin = localStorage.getItem('pulpProAdmin') === 'true';
    const bar = document.getElementById('pulpai-usage-bar');
    const label = document.getElementById('pulpai-usage-label');
    const count = document.getElementById('pulpai-usage-count');
    if (!bar) return;
    let used, limit;
    if (isAdmin) {
        used = pulpAIUsage.adminUsed;
        limit = pulpAIUsage.adminLimit;
    } else {
        used = pulpAIUsage.personal;
        limit = pulpAIUsage.personalLimit;
    }
    const pct = Math.min(100, Math.round((used / limit) * 100));
    const color = pct >= 90 ? '#ff5050' : pct >= 75 ? '#ff8c00' : '#a6e22e';
    bar.style.width = pct + '%';
    bar.style.background = color;
    if (count) count.innerText = used + ' / ' + limit;
    if (count) count.style.color = color;
    // Show warning at 75%+
    const warn = document.getElementById('pulpai-limit-warn');
    if (warn) {
        if (pct >= 75 && pct < 100) {
            warn.style.display = 'flex';
            warn.innerHTML = `<span style="font-size:10px;color:rgba(255,140,0,0.8);">⚡ ${limit - used} messages remaining this month · Resets 1st</span>`;
        } else if (pct >= 100) {
            warn.style.display = 'flex';
            warn.innerHTML = `<span style="font-size:10px;color:rgba(255,80,80,0.9);">🔒 Monthly limit reached · Resets 1st of next month</span>`;
        } else {
            warn.style.display = 'none';
        }
    }
}

async function fetchUsage() {
    try {
        const code = localStorage.getItem('pulpProAccessCode') || '';
        const res = await fetch(WORKER_URL + '/pulp-ai-usage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userCode: code })
        });
        const data = await res.json();
        pulpAIUsage = data;
        updateUsageBar();
    } catch(e) {}
}

// ── SEND MESSAGE ─────────────────────────────────────────────────────────
async function sendPulpAIMessage() {
    const input = document.getElementById('pulpai-input');
    const text = input.value.trim();
    if (!text || isAIThinking) return;
    const chat = getChatById(currentChatId);
    if (!chat) return;

    // Check limit
    const isAdmin = localStorage.getItem('pulpProAdmin') === 'true';
    const used = isAdmin ? pulpAIUsage.adminUsed : pulpAIUsage.personal;
    const limit = isAdmin ? pulpAIUsage.adminLimit : pulpAIUsage.personalLimit;
    if (used >= limit) {
        showPulpAILimitScreen();
        return;
    }

    input.value = '';
    isAIThinking = true;
    setGlowMode('thinking');

    // Add user message
    const userName = localStorage.getItem('pulpProUserName') || 'there';
    chat.messages.push({ role: 'user', content: text });
    if (chat.title === 'New conversation' && chat.messages.length === 1) {
        chat.title = text.length > 40 ? text.slice(0, 40) + '...' : text;
    }
    saveChats();
    renderChatMessages(currentChatId);
    scrollChatToBottom();

    // Show typing
    const typingEl = document.getElementById('pulpai-typing');
    if (typingEl) typingEl.style.display = 'flex';
    scrollChatToBottom();

    try {
        const code = localStorage.getItem('pulpProAccessCode') || '';
        const res = await fetch(WORKER_URL + '/pulp-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: chat.messages.map(m => ({ role: m.role, content: m.content })),
                userCode: code,
                isAdmin,
                userName
            })
        });
        const data = await res.json();
        if (typingEl) typingEl.style.display = 'none';

        if (data.error === 'monthly_limit_reached' || data.error === 'pool_limit_reached') {
            isAIThinking = false;
            setGlowMode('idle');
            showPulpAILimitScreen();
            return;
        }

        chat.messages.push({ role: 'assistant', content: data.reply });
        if (data.usage) { pulpAIUsage = data.usage; updateUsageBar(); }
        saveChats();
        renderChatMessages(currentChatId);
        scrollChatToBottom();

    } catch(e) {
        if (typingEl) typingEl.style.display = 'none';
        chat.messages.push({ role: 'assistant', content: 'Sorry, something went wrong. Please check your connection and try again.' });
        saveChats();
        renderChatMessages(currentChatId);
    }

    isAIThinking = false;
    setGlowMode('idle');
}

// ── GLOW MODE ────────────────────────────────────────────────────────────
let _glowMode = 'idle';
function setGlowMode(mode) { _glowMode = mode; }
function getGlowMode() { return _glowMode; }

// ── RENDER HELPERS ───────────────────────────────────────────────────────
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
    // Init orbs on new message bubbles
    container.querySelectorAll('.pulpai-orb-canvas').forEach(c => createAura(c, 20));
}

function renderChatList() {
    const container = document.getElementById('pulpai-chat-list');
    if (!container) return;
    if (pulpAIChats.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:32px 20px;font-size:12px;color:rgba(255,255,255,0.25);letter-spacing:normal;text-transform:none;">No chats yet. Start a conversation below.</div>`;
        return;
    }
    container.innerHTML = pulpAIChats.map(c => `
        <div class="pulpai-chat-item">
            <div class="pulpai-chat-icon" onclick="openChat('${c.id}')">💬</div>
            <div class="pulpai-chat-info" onclick="openChat('${c.id}')">
                <div class="pulpai-chat-title">${escapeHtml(c.title)}</div>
                <div class="pulpai-chat-preview">${c.messages.length > 0 ? escapeHtml(c.messages[c.messages.length-1].content).slice(0,50)+'...' : 'No messages yet'}</div>
            </div>
            <div class="pulpai-chat-delete" onclick="deleteChat('${c.id}')">✕</div>
            <div class="pulpai-chat-arrow" onclick="openChat('${c.id}')">›</div>
        </div>`).join('');
}

function escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatAIText(text) {
    // Bold **text**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Line breaks
    text = text.replace(/\n/g, '<br>');
    return text;
}

function scrollChatToBottom() {
    const msgs = document.getElementById('pulpai-messages');
    if (msgs) setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 50);
}

function showPulpAILimitScreen() {
    const messages = document.getElementById('pulpai-messages');
    if (!messages) return;
    messages.innerHTML += `<div style="text-align:center;padding:24px 16px;display:flex;flex-direction:column;align-items:center;gap:12px;">
        <div style="font-size:32px;">🔒</div>
        <div style="font-size:14px;font-weight:700;color:#fff;">Monthly limit reached</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.4);line-height:1.6;max-width:240px;">You've used all your messages for this month. Your limit resets on the 1st.</div>
    </div>`;
    const input = document.getElementById('pulpai-input');
    const sendBtn = document.getElementById('pulpai-send-btn');
    if (input) input.disabled = true;
    if (sendBtn) sendBtn.style.opacity = '0.3';
}

// ── NAVIGATION ───────────────────────────────────────────────────────────
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
    // Init chat orb and perimeter glow
    setTimeout(() => {
        const chatOrb = document.getElementById('pulpai-chat-orb');
        if (chatOrb) createAura(chatOrb, 28);
        const glowCanvas = document.getElementById('pulpai-glow-canvas');
        if (glowCanvas) startPerimeterGlow(glowCanvas, getGlowMode);
    }, 100);
    fetchUsage();
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
    _glowMode = 'idle';
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

// ── TILE AURA INIT ───────────────────────────────────────────────────────
function initPulpAITile() {
    const tileCanvas = document.getElementById('pulpai-tile-canvas');
    if (tileCanvas) {
        const tile = tileCanvas.parentElement;
        tileCanvas.width = tile.offsetWidth || 320;
        tileCanvas.height = tile.offsetHeight || 140;
        createAura(tileCanvas, Math.max(tileCanvas.width, tileCanvas.height));
    }
}

// ── ENTER KEY ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('pulpai-input');
    if (input) {
        input.addEventListener('keypress', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendPulpAIMessage();
            }
        });
    }
    setTimeout(initPulpAITile, 300);
});
