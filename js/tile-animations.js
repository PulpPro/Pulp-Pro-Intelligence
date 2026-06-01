// ── TILE ANIMATIONS ───────────────────────────────────────────────────────
// Handles canvas animations for Pulp AI, Reminders and Floor IQ tiles

document.addEventListener('DOMContentLoaded', () => {
    initRemTileCanvas();
    initIQTileCanvas();
    initAgeTileCanvas();
    initHolTileCanvas();
    initSwapTileCanvas();
    initHomeWelcome();
    // Pulp AI aurora — call after short delay to ensure canvas is sized
    setTimeout(() => {
        if (typeof initPulpAITile === 'function') initPulpAITile();
    }, 300);
});

// ── WELCOME MESSAGE ────────────────────────────────────────────────────────
function initHomeWelcome() {
    const el = document.getElementById('home-welcome');
    if (!el) return;
    const name = localStorage.getItem('pulpProUserName');
    if (!name) return;
    const firstName = name.split(' ')[0];
    const h = new Date().getHours();
    const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    el.innerHTML = `${greeting}, <em style="color:rgba(166,226,46,0.8);font-style:normal;">${firstName} 👋</em>`;
}

// ── BANANA AGE — cyan radar sweep ─────────────────────────────────────────
function initAgeTileCanvas() {
    const cv = document.getElementById('age-tile-canvas');
    if (!cv) return;
    const tile = cv.parentElement;
    cv.width = tile.offsetWidth || 350;
    cv.height = tile.offsetHeight || 148;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext('2d');
    const t0 = Date.now();
    const ox = W * 1.0, oy = H * 0.5, maxR = W * 0.9;
    const blips = [
        { angle: Math.PI * 1.08, r: maxR * 0.38, size: 3 },
        { angle: Math.PI * 1.22, r: maxR * 0.58, size: 2.5 },
        { angle: Math.PI * 0.95, r: maxR * 0.72, size: 2 },
    ];
    function draw() {
        const t = (Date.now() - t0) * 0.001;
        ctx.clearRect(0, 0, W, H);
        // dot grid
        ctx.fillStyle = 'rgba(34,211,238,0.05)';
        for (let x = 16; x < W; x += 22) for (let y = 12; y < H; y += 18) { ctx.beginPath(); ctx.arc(x, y, 0.8, 0, Math.PI * 2); ctx.fill(); }
        // arc rings
        [0.3, 0.55, 0.8].forEach(f => {
            ctx.beginPath(); ctx.arc(ox, oy, maxR * f, Math.PI * 0.7, Math.PI * 1.3);
            ctx.strokeStyle = 'rgba(34,211,238,0.06)'; ctx.lineWidth = 0.8; ctx.stroke();
        });
        // sweep
        const sa = Math.PI * 1.0 + (t * 0.8) % (Math.PI * 0.6) - Math.PI * 0.3;
        ctx.save(); ctx.beginPath(); ctx.moveTo(ox, oy);
        ctx.arc(ox, oy, maxR, sa - 0.35, sa, false); ctx.closePath();
        const sg = ctx.createRadialGradient(ox, oy, 0, ox, oy, maxR);
        sg.addColorStop(0, 'rgba(34,211,238,0.18)'); sg.addColorStop(0.6, 'rgba(34,211,238,0.06)'); sg.addColorStop(1, 'rgba(34,211,238,0)');
        ctx.fillStyle = sg; ctx.fill(); ctx.restore();
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + maxR * Math.cos(sa), oy + maxR * Math.sin(sa));
        ctx.strokeStyle = 'rgba(34,211,238,0.4)'; ctx.lineWidth = 1; ctx.stroke();
        // blips
        blips.forEach(b => {
            const bx = ox + b.r * Math.cos(b.angle), by = oy + b.r * Math.sin(b.angle);
            let diff = sa - b.angle; while (diff < 0) diff += Math.PI * 2; diff = diff % (Math.PI * 2);
            const fade = diff < Math.PI * 0.6 ? Math.max(0, 1 - diff / (Math.PI * 0.6)) : 0;
            if (fade > 0.01) {
                const glow = ctx.createRadialGradient(bx, by, 0, bx, by, 12);
                glow.addColorStop(0, `rgba(34,211,238,${0.6 * fade})`); glow.addColorStop(1, 'rgba(34,211,238,0)');
                ctx.beginPath(); ctx.arc(bx, by, 12, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill();
                ctx.beginPath(); ctx.arc(bx, by, b.size, 0, Math.PI * 2); ctx.fillStyle = `rgba(34,211,238,${fade})`; ctx.fill();
                const ch = 6; ctx.strokeStyle = `rgba(34,211,238,${fade * 0.6})`; ctx.lineWidth = 0.8;
                ctx.beginPath(); ctx.moveTo(bx - ch, by); ctx.lineTo(bx + ch, by); ctx.moveTo(bx, by - ch); ctx.lineTo(bx, by + ch); ctx.stroke();
            }
        });
        requestAnimationFrame(draw);
    }
    draw();
}

// ── HOLIDAY PLANNER — teal aurora orb ────────────────────────────────────
function initHolTileCanvas() {
    const cv = document.getElementById('hol-tile-canvas');
    if (!cv) return;
    const tile = cv.parentElement;
    cv.width = tile.offsetWidth || 350;
    cv.height = tile.offsetHeight || 148;
    const W = cv.width, H = cv.height, S = Math.max(W, H);
    const ctx = cv.getContext('2d');
    const off = document.createElement('canvas'); off.width = S; off.height = S;
    const oc = off.getContext('2d');
    const blobs = [
        { ax:0.6, ay:0.4, dx:0.15, dy:0.12, sx:0.0013, sy:0.001, ph:0, rx:0.7, ry:0.6, col:[52,211,153] },
        { ax:0.8, ay:0.6, dx:0.1, dy:0.14, sx:0.0011, sy:0.0013, ph:2, rx:0.55, ry:0.58, col:[16,185,129] },
        { ax:0.7, ay:0.25, dx:0.12, dy:0.1, sx:0.0012, sy:0.001, ph:4, rx:0.5, ry:0.48, col:[110,231,183] },
    ];
    const sm = blobs.map(b => ({ x:b.ax*S, y:b.ay*S, rx:b.rx*S, ry:b.ry*S }));
    const L = 0.07; const start = Date.now();
    function lerp(a, b, t) { return a + (b - a) * t; }
    function draw() {
        const t = (Date.now() - start) * 0.001;
        blobs.forEach((b, i) => {
            const tx = (b.ax + Math.sin(t*b.sx*1000+b.ph)*b.dx)*S;
            const ty = (b.ay + Math.cos(t*b.sy*1000+b.ph*1.3)*b.dy)*S;
            const trx = b.rx*S*(0.88+Math.sin(t*1.1+b.ph)*0.12);
            const try_ = b.ry*S*(0.88+Math.cos(t*0.9+b.ph)*0.12);
            sm[i].x=lerp(sm[i].x,tx,L); sm[i].y=lerp(sm[i].y,ty,L);
            sm[i].rx=lerp(sm[i].rx,trx,L); sm[i].ry=lerp(sm[i].ry,try_,L);
        });
        oc.clearRect(0,0,S,S); oc.save();
        oc.fillStyle='#030d08'; oc.fillRect(0,0,S,S);
        blobs.forEach((b,i) => {
            const{x:bx,y:by,rx:bRx,ry:bRy}=sm[i];
            const g=oc.createRadialGradient(bx,by,0,bx,by,Math.max(bRx,bRy));
            const[r,gr,bl]=b.col;
            g.addColorStop(0,`rgba(${r},${gr},${bl},0.45)`); g.addColorStop(0.4,`rgba(${r},${gr},${bl},0.18)`); g.addColorStop(1,`rgba(${r},${gr},${bl},0)`);
            oc.save(); oc.translate(bx,by); oc.scale(1,bRy/bRx); oc.translate(-bx,-by);
            oc.beginPath(); oc.arc(bx,by,bRx,0,Math.PI*2);
            oc.fillStyle=g; oc.globalCompositeOperation='screen'; oc.fill(); oc.restore();
        });
        const vig=oc.createRadialGradient(W/2,H/2,H*0.25,W/2,H/2,H*0.85);
        vig.addColorStop(0,'rgba(3,13,8,0)'); vig.addColorStop(0.6,'rgba(3,13,8,0.45)'); vig.addColorStop(1,'rgba(3,13,8,0.95)');
        oc.globalCompositeOperation='source-over'; oc.fillStyle=vig; oc.fillRect(0,0,S,S); oc.restore();
        const ctx2 = cv.getContext('2d');
        ctx2.clearRect(0,0,W,H); ctx2.drawImage(off,0,0,W,H);
        requestAnimationFrame(draw);
    }
    draw();
    // Populate this week's dates
    initHolTileDates();
}

function initHolTileDates() {
    const today = new Date();
    const dow = today.getDay() === 0 ? 6 : today.getDay() - 1; // 0=Mon
    const monday = new Date(today); monday.setDate(today.getDate() - dow);
    const days = ['Mon','Tue','Wed','Thu','Fri'];
    for (let i = 0; i < 5; i++) {
        const d = new Date(monday); d.setDate(monday.getDate() + i);
        const dEl = document.getElementById('hol-tile-d' + (i+1));
        const wEl = document.getElementById('hol-tile-w' + (i+1));
        if (dEl) dEl.textContent = d.getDate();
        if (wEl) wEl.textContent = days[i];
    }
}

// ── SHIFT SWAP — two card swap animation ─────────────────────────────────
function initSwapTileCanvas() {
    const cv = document.getElementById('swap-tile-canvas');
    if (!cv) return;
    const tile = cv.parentElement;
    cv.width = tile.offsetWidth || 350;
    cv.height = tile.offsetHeight || 148;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext('2d');
    const start = Date.now();
    const cards = [
        { label:'Mon', shift:'Morning', col:[136,153,255], x:W*0.58, y:H*0.28 },
        { label:'Wed', shift:'Afternoon', col:[180,130,255], x:W*0.82, y:H*0.55 },
    ];
    const fromA={x:cards[0].x,y:cards[0].y}, fromB={x:cards[1].x,y:cards[1].y};
    const toA={x:cards[1].x,y:cards[1].y}, toB={x:cards[0].x,y:cards[0].y};
    let phase=0, swapT=0, idleT=0;
    function ease(t){return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}
    function drawCard(x, y, label, shift, col, alpha) {
        const[r,g,b]=col, cw=62, ch=32;
        ctx.save(); ctx.globalAlpha=alpha;
        ctx.fillStyle=`rgba(${r},${g},${b},0.12)`; ctx.strokeStyle=`rgba(${r},${g},${b},0.3)`; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(x-cw/2,y-ch/2,cw,ch,8); ctx.fill(); ctx.stroke();
        ctx.fillStyle=`rgba(${r},${g},${b},0.9)`; ctx.font='900 10px -apple-system,sans-serif'; ctx.textAlign='center'; ctx.fillText(label,x,y-4);
        ctx.fillStyle=`rgba(${r},${g},${b},0.55)`; ctx.font='700 8px -apple-system,sans-serif'; ctx.fillText(shift,x,y+8);
        ctx.restore();
    }
    function draw() {
        const t = (Date.now() - start) * 0.001;
        ctx.clearRect(0, 0, W, H);
        const bg = ctx.createRadialGradient(W*0.75, H*0.4, 0, W*0.75, H*0.4, W*0.5);
        bg.addColorStop(0,'rgba(136,153,255,0.04)'); bg.addColorStop(1,'rgba(136,153,255,0)');
        ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
        idleT += 0.016;
        if (phase === 0 && idleT > 2.5) { phase=1; swapT=0; idleT=0; }
        if (phase === 1) {
            swapT = Math.min(swapT + 0.022, 1);
            const e = ease(swapT);
            cards[0].x=fromA.x+(toA.x-fromA.x)*e; cards[0].y=fromA.y+(toA.y-fromA.y)*e-Math.sin(swapT*Math.PI)*28;
            cards[1].x=fromB.x+(toB.x-fromB.x)*e; cards[1].y=fromB.y+(toB.y-fromB.y)*e+Math.sin(swapT*Math.PI)*28;
            if (swapT >= 1) { phase=0; idleT=0; cards[0].x=fromA.x; cards[0].y=fromA.y; cards[1].x=fromB.x; cards[1].y=fromB.y; }
        }
        const arrowA = 0.5 + 0.5 * Math.sin(t * 2.5);
        ctx.save(); ctx.globalAlpha=0.25+0.2*arrowA; ctx.strokeStyle='rgba(136,153,255,0.5)'; ctx.lineWidth=1; ctx.setLineDash([3,4]);
        ctx.beginPath(); ctx.moveTo(cards[0].x+31,cards[0].y); ctx.lineTo(cards[1].x-31,cards[1].y); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
        drawCard(cards[1].x,cards[1].y,cards[1].label,cards[1].shift,cards[1].col,0.85);
        drawCard(cards[0].x,cards[0].y,cards[0].label,cards[0].shift,cards[0].col,0.95);
        requestAnimationFrame(draw);
    }
    draw();
}

// ── REMINDERS TILE — animated clock ──────────────────────────────────────
function initRemTileCanvas() {
    const canvas = document.getElementById('rem-tile-canvas');
    if (!canvas) return;
    const S = 90;
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext('2d');
    const cx = S / 2, cy = S / 2, R = 34;
    const t0 = Date.now();

    function draw() {
        const t = (Date.now() - t0) / 1000;
        ctx.clearRect(0, 0, S, S);

        // Track ring
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(136,153,255,0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Sweeping arc
        const sweep = (t * 0.5) % 1;
        const start = -Math.PI / 2;
        const end = start + sweep * Math.PI * 2;
        const gr = ctx.createLinearGradient(cx - R, cy, cx + R, cy);
        gr.addColorStop(0, 'rgba(136,153,255,0)');
        gr.addColorStop(1, 'rgba(136,153,255,0.9)');
        ctx.beginPath();
        ctx.arc(cx, cy, R, start, end);
        ctx.strokeStyle = gr;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Glowing tip dot
        const tipX = cx + R * Math.cos(end);
        const tipY = cy + R * Math.sin(end);
        const glow = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 8);
        glow.addColorStop(0, 'rgba(136,153,255,0.9)');
        glow.addColorStop(1, 'rgba(136,153,255,0)');
        ctx.beginPath(); ctx.arc(tipX, tipY, 8, 0, Math.PI * 2);
        ctx.fillStyle = glow; ctx.fill();
        ctx.beginPath(); ctx.arc(tipX, tipY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(180,190,255,1)'; ctx.fill();

        // Minute hand
        const ma = -Math.PI / 2 + t * 0.8;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + 20 * Math.cos(ma), cy + 20 * Math.sin(ma));
        ctx.strokeStyle = 'rgba(136,153,255,0.5)'; ctx.lineWidth = 1.5;
        ctx.lineCap = 'round'; ctx.stroke();

        // Hour hand
        const ha = -Math.PI / 2 + t * 0.1;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + 14 * Math.cos(ha), cy + 14 * Math.sin(ha));
        ctx.strokeStyle = 'rgba(136,153,255,0.7)'; ctx.lineWidth = 2;
        ctx.lineCap = 'round'; ctx.stroke();

        // Center dot
        ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(136,153,255,0.9)'; ctx.fill();

        // Tick marks
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const inner = i % 3 === 0 ? R - 7 : R - 5;
            ctx.beginPath();
            ctx.moveTo(cx + inner * Math.cos(a), cy + inner * Math.sin(a));
            ctx.lineTo(cx + (R - 2) * Math.cos(a), cy + (R - 2) * Math.sin(a));
            ctx.strokeStyle = i % 3 === 0 ? 'rgba(136,153,255,0.5)' : 'rgba(136,153,255,0.2)';
            ctx.lineWidth = i % 3 === 0 ? 1.5 : 1;
            ctx.stroke();
        }

        requestAnimationFrame(draw);
    }
    draw();
}

// ── FLOOR IQ TILE — synapse network ──────────────────────────────────────
function initIQTileCanvas() {
    const canvas = document.getElementById('iq-tile-canvas');
    if (!canvas) return;
    const parent = canvas.parentElement;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
    const W = canvas.width, H = canvas.height;
    const ctx = canvas.getContext('2d');
    const t0 = Date.now();

    const nodes = [
        { x: W * 0.72, y: H * 0.22 }, { x: W * 0.88, y: H * 0.42 },
        { x: W * 0.74, y: H * 0.62 }, { x: W * 0.93, y: H * 0.70 },
        { x: W * 0.60, y: H * 0.42 }, { x: W * 0.84, y: H * 0.22 },
        { x: W * 0.66, y: H * 0.75 }, { x: W * 0.95, y: H * 0.30 },
    ];

    const edges = [[0,1],[1,2],[2,3],[0,5],[1,5],[1,4],[4,2],[2,6],[3,6],[5,7],[0,7]];

    const pulses = edges.map((_, i) => ({
        edge: i,
        progress: Math.random(),
        speed: 0.004 + Math.random() * 0.004,
        active: Math.random() > 0.4
    }));

    function draw() {
        const t = (Date.now() - t0) * 0.001;
        ctx.clearRect(0, 0, W, H);

        // Draw edges
        edges.forEach(([a, b]) => {
            const na = nodes[a], nb = nodes[b];
            ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y);
            ctx.strokeStyle = 'rgba(255,165,0,0.07)'; ctx.lineWidth = 0.8; ctx.stroke();
        });

        // Draw pulses
        pulses.forEach(p => {
            if (!p.active) return;
            p.progress += p.speed;
            if (p.progress >= 1) { p.progress = 0; p.active = Math.random() > 0.3; }
            const [a, b] = edges[p.edge];
            const na = nodes[a], nb = nodes[b];
            const px = na.x + (nb.x - na.x) * p.progress;
            const py = na.y + (nb.y - na.y) * p.progress;
            const gl = ctx.createRadialGradient(px, py, 0, px, py, 7);
            gl.addColorStop(0, 'rgba(255,165,0,0.85)');
            gl.addColorStop(1, 'rgba(255,165,0,0)');
            ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2);
            ctx.fillStyle = gl; ctx.fill();
            ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,200,80,1)'; ctx.fill();
        });

        // Randomly activate
        pulses.forEach(p => { if (!p.active && Math.random() < 0.004) p.active = true; });

        // Draw nodes
        nodes.forEach((n, i) => {
            const pulse = 0.5 + 0.5 * Math.sin(t * 2 + i * 0.8);
            const gl = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 10);
            gl.addColorStop(0, `rgba(255,165,0,${0.3 * pulse})`);
            gl.addColorStop(1, 'rgba(255,165,0,0)');
            ctx.beginPath(); ctx.arc(n.x, n.y, 10, 0, Math.PI * 2);
            ctx.fillStyle = gl; ctx.fill();
            ctx.beginPath(); ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,${150 + Math.round(50 * pulse)},50,${0.6 + 0.4 * pulse})`;
            ctx.fill();
        });

        requestAnimationFrame(draw);
    }
    draw();
}
