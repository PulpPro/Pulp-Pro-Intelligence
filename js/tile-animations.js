// ── TILE ANIMATIONS ───────────────────────────────────────────────────────
// Handles canvas animations for Pulp AI, Reminders and Floor IQ tiles

document.addEventListener('DOMContentLoaded', () => {
    initRemTileCanvas();
    initIQTileCanvas();
    initAgeTileCanvas();
    initHolTileCanvas();
    initOriginTileCanvas();
    initDagrapportTileCanvas();
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
    // Try saved name first, then fallback for admin
    let name = localStorage.getItem('pulpProUserName');
    const isAdmin = localStorage.getItem('pulpProAdmin') === 'true';
    if (!name && isAdmin) name = 'Akash';
    if (!name) {
        // Try parsing from access code
        const code = localStorage.getItem('pulpProAccessCode');
        if (code) {
            const parts = code.toUpperCase().split('-');
            const raw = parts[0] || '';
            name = raw.charAt(0) + raw.slice(1).toLowerCase();
        }
    }
    if (!name) return;
    const h = new Date().getHours();
    const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    el.innerHTML = `${greeting}, <em style="color:rgba(166,226,46,0.8);font-style:normal;">${name} 👋</em>`;
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

// ── ORIGIN REPORT TILE — blue rotating dot globe ──────────────────────────
// Land dots precomputed offline (lon,lat integer pairs) — no CDN, works offline.
const ORIGIN_LAND_DOTS = "-70,-55,-73,-52,-75,-49,-70,-49,-72,-46,-68,-46,170,-46,-69,-43,-65,-43,173,-43,-70,-40,-66,-40,-63,-40,176,-40,-71,-37,-67,-37,-64,-37,-60,-37,143,-37,147,-37,-71,-34,-68,-34,-64,-34,-61,-34,-57,-34,19,-34,117,-34,138,-34,142,-34,146,-34,149,-34,-72,-31,-68,-31,-65,-31,-61,-31,-58,-31,-54,-31,19,-31,23,-31,26,-31,30,-31,117,-31,121,-31,124,-31,128,-31,131,-31,135,-31,138,-31,142,-31,145,-31,149,-31,152,-31,-68,-28,-64,-28,-61,-28,-58,-28,-54,-28,-51,-28,17,-28,20,-28,24,-28,27,-28,31,-28,116,-28,119,-28,122,-28,126,-28,129,-28,133,-28,136,-28,139,-28,143,-28,146,-28,150,-28,153,-28,-67,-25,-64,-25,-61,-25,-58,-25,-54,-25,-51,-25,15,-25,19,-25,22,-25,25,-25,29,-25,32,-25,45,-25,115,-25,118,-25,121,-25,125,-25,128,-25,131,-25,134,-25,138,-25,141,-25,144,-25,148,-25,151,-25,-70,-22,-67,-22,-64,-22,-60,-22,-57,-22,-54,-22,-51,-22,-47,-22,-44,-22,17,-22,21,-22,24,-22,27,-22,30,-22,34,-22,46,-22,118,-22,121,-22,124,-22,127,-22,131,-22,134,-22,137,-22,140,-22,144,-22,147,-22,166,-22,-69,-19,-66,-19,-63,-19,-59,-19,-56,-19,-53,-19,-50,-19,-47,-19,-44,-19,-40,-19,14,-19,17,-19,20,-19,23,-19,26,-19,29,-19,33,-19,45,-19,48,-19,125,-19,128,-19,131,-19,134,-19,137,-19,140,-19,144,-19,-74,-16,-71,-16,-68,-16,-65,-16,-61,-16,-58,-16,-55,-16,-52,-16,-49,-16,-46,-16,-43,-16,-40,-16,13,-16,17,-16,20,-16,23,-16,26,-16,29,-16,32,-16,35,-16,38,-16,48,-16,126,-16,129,-16,132,-16,135,-16,141,-16,145,-16,-75,-13,-72,-13,-69,-13,-66,-13,-63,-13,-60,-13,-57,-13,-54,-13,-51,-13,-48,-13,-45,-13,-41,-13,14,-13,17,-13,20,-13,23,-13,26,-13,29,-13,32,-13,36,-13,39,-13,131,-13,134,-13,143,-13,-76,-10,-73,-10,-70,-10,-67,-10,-64,-10,-61,-10,-58,-10,-55,-10,-52,-10,-49,-10,-46,-10,-43,-10,-40,-10,-37,-10,15,-10,18,-10,21,-10,24,-10,27,-10,30,-10,33,-10,36,-10,39,-10,149,-10,-77,-7,-74,-7,-71,-7,-68,-7,-65,-7,-62,-7,-59,-7,-56,-7,-53,-7,-50,-7,-47,-7,-44,-7,-41,-7,-38,-7,-35,-7,13,-7,16,-7,19,-7,23,-7,26,-7,29,-7,32,-7,35,-7,38,-7,107,-7,110,-7,140,-7,143,-7,146,-7,-81,-4,-78,-4,-75,-4,-72,-4,-69,-4,-66,-4,-63,-4,-60,-4,-57,-4,-54,-4,-51,-4,-48,-4,-45,-4,-42,-4,-39,-4,12,-4,15,-4,18,-4,21,-4,24,-4,28,-4,31,-4,34,-4,37,-4,40,-4,103,-4,106,-4,136,-4,139,-4,142,-4,-78,-1,-75,-1,-72,-1,-69,-1,-66,-1,-63,-1,-60,-1,-57,-1,-54,-1,-51,-1,-48,-1,9,-1,12,-1,15,-1,18,-1,21,-1,24,-1,27,-1,30,-1,33,-1,36,-1,39,-1,102,-1,111,-1,114,-1,117,-1,120,-1,123,-1,132,-1,-78,2,-75,2,-72,2,-69,2,-66,2,-63,2,-60,2,-57,2,-54,2,-51,2,12,2,15,2,18,2,21,2,24,2,27,2,30,2,33,2,36,2,39,2,42,2,45,2,99,2,114,2,117,2,-75,5,-72,5,-69,5,-66,5,-63,5,-60,5,-57,5,-54,5,-8,5,-2,5,7,5,10,5,13,5,16,5,19,5,22,5,25,5,28,5,31,5,34,5,37,5,40,5,43,5,46,5,97,5,103,5,115,5,118,5,-77,8,-74,8,-71,8,-68,8,-65,8,-62,8,-10,8,-7,8,-4,8,-1,8,2,8,5,8,8,8,11,8,14,8,17,8,20,8,23,8,26,8,29,8,32,8,35,8,38,8,41,8,44,8,47,8,78,8,81,8,123,8,126,8,-85,11,-73,11,-70,11,-15,11,-12,11,-9,11,-6,11,-3,11,0,11,3,11,6,11,9,11,13,11,16,11,19,11,22,11,25,11,28,11,31,11,34,11,37,11,40,11,43,11,49,11,77,11,80,11,104,11,107,11,120,11,123,11,-90,14,-87,14,-84,14,-16,14,-13,14,-10,14,-7,14,-4,14,-1,14,2,14,6,14,9,14,12,14,15,14,18,14,21,14,24,14,27,14,30,14,33,14,36,14,40,14,46,14,77,14,80,14,98,14,101,14,104,14,108,14,123,14,-98,17,-95,17,-92,17,-89,17,-14,17,-11,17,-7,17,-4,17,-1,17,2,17,5,17,8,17,11,17,14,17,18,17,21,17,24,17,27,17,30,17,33,17,36,17,43,17,46,17,49,17,52,17,74,17,77,17,80,17,96,17,99,17,102,17,105,17,121,17,-103,20,-100,20,-97,20,-75,20,-14,20,-11,20,-8,20,-4,20,-1,20,2,20,5,20,8,20,12,20,15,20,18,20,21,20,24,20,28,20,31,20,34,20,43,20,47,20,50,20,53,20,56,20,75,20,79,20,82,20,85,20,95,20,98,20,101,20,104,20,111,20,-105,23,-102,23,-99,23,-82,23,-14,23,-11,23,-7,23,-4,23,-1,23,3,23,6,23,9,23,12,23,16,23,19,23,22,23,25,23,29,23,32,23,35,23,42,23,45,23,48,23,51,23,55,23,58,23,71,23,74,23,77,23,81,23,84,23,87,23,91,23,94,23,97,23,100,23,104,23,107,23,110,23,113,23,-107,26,-103,26,-100,26,-13,26,-10,26,-6,26,-3,26,0,26,4,26,7,26,10,26,14,26,17,26,20,26,24,26,27,26,30,26,34,26,37,26,40,26,44,26,47,26,60,26,64,26,67,26,70,26,74,26,77,26,80,26,84,26,87,26,90,26,94,26,97,26,100,26,104,26,107,26,110,26,114,26,117,26,-111,29,-108,29,-105,29,-101,29,-98,29,-8,29,-5,29,-2,29,2,29,5,29,9,29,12,29,16,29,19,29,22,29,26,29,29,29,36,29,40,29,43,29,46,29,53,29,57,29,60,29,64,29,67,29,70,29,74,29,77,29,81,29,84,29,88,29,91,29,94,29,98,29,101,29,105,29,108,29,112,29,115,29,118,29,122,29,-116,32,-113,32,-109,32,-106,32,-102,32,-99,32,-95,32,-92,32,-88,32,-84,32,-81,32,-7,32,-3,32,0,32,4,32,7,32,11,32,15,32,22,32,36,32,39,32,43,32,46,32,50,32,53,32,57,32,61,32,64,32,68,32,71,32,75,32,78,32,82,32,85,32,89,32,92,32,96,32,99,32,103,32,107,32,110,32,114,32,117,32,121,32,131,32,-118,35,-114,35,-110,35,-107,35,-103,35,-99,35,-96,35,-92,35,-88,35,-85,35,-81,35,-77,35,-4,35,-1,35,3,35,7,35,10,35,25,35,32,35,36,35,40,35,43,35,47,35,51,35,54,35,58,35,62,35,65,35,69,35,73,35,76,35,80,35,84,35,87,35,91,35,95,35,98,35,102,35,106,35,109,35,113,35,117,35,128,35,135,35,139,35,-119,38,-115,38,-111,38,-108,38,-104,38,-100,38,-96,38,-92,38,-89,38,-85,38,-81,38,-77,38,-9,38,-5,38,-1,38,14,38,22,38,29,38,33,38,37,38,41,38,45,38,48,38,56,38,60,38,64,38,67,38,71,38,75,38,79,38,83,38,86,38,90,38,94,38,98,38,102,38,106,38,109,38,113,38,117,38,128,38,140,38,-120,41,-116,41,-112,41,-108,41,-104,41,-100,41,-97,41,-93,41,-89,41,-85,41,-81,41,-77,41,-73,41,-5,41,-1,41,15,41,23,41,27,41,31,41,35,41,43,41,47,41,59,41,62,41,66,41,70,41,74,41,78,41,82,41,86,41,90,41,94,41,98,41,102,41,106,41,110,41,114,41,118,41,122,41,126,41,-122,44,-117,44,-113,44,-109,44,-105,44,-101,44,-97,44,-92,44,-88,44,-84,44,-80,44,-76,44,-72,44,-1,44,4,44,8,44,12,44,16,44,20,44,24,44,29,44,41,44,45,44,54,44,58,44,62,44,66,44,70,44,74,44,79,44,83,44,87,44,91,44,95,44,99,44,104,44,108,44,112,44,116,44,120,44,124,44,129,44,133,44,145,44,-123,47,-118,47,-114,47,-110,47,-105,47,-101,47,-96,47,-92,47,-88,47,-83,47,-79,47,-74,47,-70,47,-66,47,0,47,5,47,9,47,14,47,18,47,22,47,27,47,31,47,36,47,40,47,44,47,49,47,53,47,58,47,62,47,66,47,71,47,75,47,80,47,84,47,88,47,93,47,97,47,102,47,106,47,110,47,115,47,119,47,124,47,128,47,132,47,137,47,-124,50,-119,50,-115,50,-110,50,-105,50,-101,50,-96,50,-91,50,-87,50,-82,50,-77,50,-73,50,-68,50,2,50,7,50,11,50,16,50,21,50,25,50,30,50,35,50,39,50,44,50,49,50,53,50,58,50,63,50,67,50,72,50,77,50,81,50,86,50,91,50,95,50,100,50,105,50,109,50,114,50,119,50,123,50,128,50,133,50,137,50,-125,53,-120,53,-115,53,-110,53,-105,53,-100,53,-95,53,-90,53,-85,53,-75,53,-70,53,-65,53,-60,53,-1,53,9,53,14,53,19,53,24,53,29,53,34,53,39,53,44,53,49,53,54,53,59,53,64,53,69,53,74,53,79,53,84,53,89,53,94,53,99,53,104,53,109,53,114,53,119,53,124,53,129,53,134,53,139,53,-159,56,-132,56,-126,56,-121,56,-116,56,-110,56,-105,56,-100,56,-94,56,-89,56,-73,56,-67,56,-62,56,13,56,24,56,29,56,35,56,40,56,45,56,51,56,56,56,61,56,67,56,72,56,78,56,83,56,88,56,94,56,99,56,104,56,110,56,115,56,120,56,126,56,131,56,137,56,158,56,-157,59,-133,59,-128,59,-122,59,-116,59,-110,59,-104,59,-98,59,-75,59,-69,59,-64,59,6,59,12,59,24,59,30,59,36,59,41,59,47,59,53,59,59,59,65,59,70,59,76,59,82,59,88,59,94,59,100,59,105,59,111,59,117,59,123,59,129,59,135,59,140,59,152,59,-161,62,-154,62,-148,62,-142,62,-135,62,-129,62,-122,62,-116,62,-110,62,-103,62,-97,62,-78,62,-46,62,5,62,12,62,24,62,31,62,37,62,44,62,50,62,56,62,63,62,69,62,76,62,82,62,88,62,95,62,101,62,108,62,114,62,120,62,127,62,133,62,140,62,146,62,152,62,159,62,165,62,171,62,-180,65,-173,65,-166,65,-159,65,-152,65,-145,65,-137,65,-130,65,-123,65,-116,65,-109,65,-102,65,-95,65,-88,65,-74,65,-52,65,-45,65,-17,65,12,65,19,65,26,65,33,65,47,65,54,65,61,65,68,65,76,65,83,65,90,65,97,65,104,65,111,65,118,65,125,65,132,65,139,65,147,65,154,65,161,65,168,65,175,65,-180,68,-164,68,-156,68,-148,68,-140,68,-132,68,-124,68,-116,68,-108,68,-92,68,-84,68,-76,68,-68,68,-52,68,-44,68,-36,68,20,68,28,68,36,68,44,68,52,68,60,68,68,68,76,68,84,68,92,68,100,68,108,68,116,68,124,68,132,68,140,68,148,68,156,68,164,68,172,68,-115,71,-106,71,-88,71,-79,71,-51,71,-42,71,-33,71,-23,71,69,71,78,71,87,71,96,71,106,71,115,71,124,71,133,71,143,71,152,71,179,71,-120,74,-50,74,-40,74,-30,74,90,74,100,74,110,74,-120,77,-80,77,-70,77,-60,77,-50,77,-40,77,-30,77,-20,77";

const ORIGIN_COUNTRIES = [
    { n: 'Ecuador',       r: 'S. America', lat: -1.8, lon: -78.2, t: '26°C' },
    { n: 'Costa Rica',    r: 'C. America', lat:  9.7, lon: -83.7, t: '29°C' },
    { n: 'Colombia',      r: 'S. America', lat:  4.6, lon: -74.1, t: '24°C' },
    { n: 'Panama',        r: 'C. America', lat:  8.5, lon: -80.8, t: '30°C' },
    { n: 'Guatemala',     r: 'C. America', lat: 15.8, lon: -90.2, t: '27°C' },
    { n: 'Dom. Republic', r: 'Caribbean',  lat: 18.7, lon: -70.2, t: '31°C' },
    { n: 'Peru',          r: 'S. America', lat: -9.2, lon: -75.0, t: '23°C' },
    { n: 'Ivory Coast',   r: 'W. Africa',  lat:  7.5, lon:  -5.5, t: '32°C' },
    { n: 'Philippines',   r: 'SE Asia',    lat: 12.9, lon: 121.8, t: '33°C' }
];

// openOriginReport() lives in js/origin-report.js

function initOriginTileCanvas() {
    const cv = document.getElementById('origin-tile-canvas');
    if (!cv) return;
    const tile = cv.parentElement;
    cv.width = tile.offsetWidth || 350;
    cv.height = tile.offsetHeight || 180;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext('2d');

    const GCX = W * 0.76, GCY = H / 2;
    const R = Math.min(H * 0.42, W * 0.2);

    // Parse precomputed land dots
    const raw = ORIGIN_LAND_DOTS.split(',');
    const dots = [];
    for (let i = 0; i < raw.length - 1; i += 2) {
        dots.push([
            parseFloat(raw[i]) * Math.PI / 180,        // lon (rad)
            parseFloat(raw[i + 1]) * Math.PI / 180,    // lat (rad)
            0.55 + Math.random() * 0.45                // base brightness
        ]);
    }
    const ctrs = ORIGIN_COUNTRIES.map(c => ({
        ...c,
        lonR: c.lon * Math.PI / 180,
        latR: c.lat * Math.PI / 180
    }));

    // Orthographic projection, view tilted 12° north
    const TILT = 12 * Math.PI / 180;
    const sinT = Math.sin(TILT), cosT = Math.cos(TILT);

    let rot = 0, lastT = 0;
    let active = -1, popA = 0;

    function draw(ts) {
        const dt = lastT ? Math.min(ts - lastT, 50) : 16;
        lastT = ts;
        rot += dt * 0.00021; // radians per ms
        ctx.clearRect(0, 0, W, H);

        // Sphere outline rings
        ctx.strokeStyle = 'rgba(61,165,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(GCX, GCY, R, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = 'rgba(61,165,255,0.06)';
        ctx.beginPath(); ctx.arc(GCX, GCY, R + 7, 0, Math.PI * 2); ctx.stroke();

        // Land dots — small filled circles, brighter near front
        const flick = Math.random() < 0.4;
        for (let i = 0; i < dots.length; i++) {
            const d = dots[i];
            const lam = d[0] + rot;
            const cosPhi = Math.cos(d[1]), sinPhi = Math.sin(d[1]);
            const cosLam = Math.cos(lam);
            const cosC = sinT * sinPhi + cosT * cosPhi * cosLam;
            if (cosC <= 0) continue; // back of sphere
            const x = GCX + R * cosPhi * Math.sin(lam);
            const y = GCY - R * (cosT * sinPhi - sinT * cosPhi * cosLam);
            let a = d[2] * (0.35 + cosC * 0.65);
            if (flick && Math.random() < 0.004) a = 1;
            ctx.fillStyle = 'rgba(61,165,255,' + a.toFixed(2) + ')';
            ctx.beginPath();
            ctx.arc(x, y, 1.1, 0, Math.PI * 2);
            ctx.fill();
        }

        // Country markers — pick the most front-facing for the popup
        let best = -1, bestC = -1;
        for (let i = 0; i < ctrs.length; i++) {
            const c = ctrs[i];
            const lam = c.lonR + rot;
            const cosPhi = Math.cos(c.latR), sinPhi = Math.sin(c.latR);
            const cosLam = Math.cos(lam);
            const cosC = sinT * sinPhi + cosT * cosPhi * cosLam;
            if (cosC <= 0) continue;
            const x = GCX + R * cosPhi * Math.sin(lam);
            const y = GCY - R * (cosT * sinPhi - sinT * cosPhi * cosLam);
            c._x = x; c._y = y;
            const pulse = 0.5 + 0.5 * Math.sin(ts * 0.004 + i * 1.7);
            ctx.fillStyle = 'rgba(61,165,255,' + (0.6 + pulse * 0.4).toFixed(2) + ')';
            ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(61,165,255,' + (0.4 * pulse).toFixed(2) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(x, y, 4 + pulse * 4, 0, Math.PI * 2); ctx.stroke();
            if (cosC > bestC) { bestC = cosC; best = i; }
        }

        // Popup card follows the front-facing country
        if (best !== active) { active = best; popA = 0; }
        if (active >= 0 && bestC > 0.54) {
            popA = Math.min(popA + dt * 0.004, 1);
        } else {
            popA = Math.max(popA - dt * 0.006, 0);
        }

        if (active >= 0 && popA > 0.02 && ctrs[active]._x !== undefined) {
            const c = ctrs[active];
            const px = c._x, py = c._y;
            const bw = 100, bh = 38;
            // Center popup horizontally on marker, above by default
            let bx = px - bw / 2;
            let by = py - bh - 12;
            // Keep popup strictly within the right half of the tile (never over title)
            const LEFT_BOUND = W * 0.48;
            if (bx < LEFT_BOUND) bx = LEFT_BOUND;
            if (bx + bw > W - 6) bx = W - 6 - bw;
            // Flip below marker if no room above
            if (by < 6) by = py + 14;
            if (by + bh > H - 6) by = H - 6 - bh;
            ctx.globalAlpha = popA;
            ctx.strokeStyle = 'rgba(61,165,255,0.45)';
            ctx.lineWidth = 1;
            // Leader line — connect marker to nearest popup edge
            const anchorX = (px < bx) ? bx : (px > bx + bw ? bx + bw : px);
            const anchorY = (py < by) ? by : (py > by + bh ? by + bh : py);
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(anchorX, anchorY); ctx.stroke();
            ctx.fillStyle = 'rgba(2,12,26,0.93)';
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 7); else ctx.rect(bx, by, bw, bh);
            ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#3da5ff';
            ctx.font = '700 11px -apple-system, sans-serif';
            ctx.fillText(c.n, bx + 9, by + 16);
            ctx.fillStyle = 'rgba(96,165,250,0.65)';
            ctx.font = '400 10px -apple-system, sans-serif';
            ctx.fillText(c.r + ' · ' + c.t, bx + 9, by + 30);
            ctx.globalAlpha = 1;
        }

        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
}

// ── DAGRAPPORT TILE — lime ECG pulse line with team dots ─────────────────
function initDagrapportTileCanvas() {
    const cv = document.getElementById('dag-tile-canvas');
    if (!cv) return;
    const tile = cv.parentElement;
    cv.width = tile.offsetWidth || 350;
    cv.height = tile.offsetHeight || 180;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext('2d');
    const t0 = Date.now();

    // ECG waveform — generated once as a long path (loops by translating)
    // Pattern: flat baseline with periodic sharp QRS spikes
    const baseY = H * 0.55;
    const segW = W * 0.5; // one full pattern segment
    const spikes = [
        { x: 0.18, up: 18, down: 24 },
        { x: 0.42, up: 22, down: 28 },
        { x: 0.72, up: 16, down: 22 }
    ];

    // Team dots — positioned along the strip, pulse on their own rhythm
    const dots = [
        { x: W * 0.18, color: 'rgba(136,153,255,', initial: 'M', time: '08:14', phase: 0 },
        { x: W * 0.52, color: 'rgba(166,226,46,',  initial: 'A', time: '07:55', phase: 0.7 },
        { x: W * 0.82, color: 'rgba(255,165,0,',   initial: 'S', time: '11:22', phase: 1.4 }
    ];

    function drawWave(offsetX) {
        ctx.beginPath();
        let cursorX = -offsetX;
        let cursorY = baseY;
        ctx.moveTo(cursorX, cursorY);

        // Draw two full segments so wrap is seamless
        for (let seg = 0; seg < 3; seg++) {
            const segStart = seg * segW - offsetX;
            spikes.forEach(s => {
                const sx = segStart + segW * s.x;
                // flat lead-in
                ctx.lineTo(sx - 8, baseY);
                // upward spike
                ctx.lineTo(sx - 4, baseY - s.up);
                // sharp downward
                ctx.lineTo(sx, baseY + s.down);
                // recovery up
                ctx.lineTo(sx + 4, baseY - 4);
                // back to baseline
                ctx.lineTo(sx + 8, baseY);
            });
            // flat tail
            ctx.lineTo(segStart + segW, baseY);
        }

        // Gradient stroke — fade in/out at edges
        const grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, 'rgba(166,226,46,0)');
        grad.addColorStop(0.1, 'rgba(166,226,46,0.3)');
        grad.addColorStop(0.5, 'rgba(166,226,46,0.85)');
        grad.addColorStop(0.9, 'rgba(166,226,46,0.3)');
        grad.addColorStop(1, 'rgba(166,226,46,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    }

    function drawDot(d, t) {
        // Pulse scale on each dot's own 2.2s rhythm with phase offset
        const phase = (t / 2.2 + d.phase) % 1;
        const scale = 1 + 0.35 * Math.sin(phase * Math.PI * 2);
        const opacity = 0.7 + 0.3 * Math.sin(phase * Math.PI * 2);

        // Glow halo
        const glowR = 10 * scale;
        const halo = ctx.createRadialGradient(d.x, baseY, 0, d.x, baseY, glowR);
        halo.addColorStop(0, d.color + (0.6 * opacity).toFixed(2) + ')');
        halo.addColorStop(1, d.color + '0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(d.x, baseY, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = d.color + opacity.toFixed(2) + ')';
        ctx.beginPath();
        ctx.arc(d.x, baseY, 4 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Border ring (matches tile background)
        ctx.strokeStyle = '#050a05';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(d.x, baseY, 4 * scale, 0, Math.PI * 2);
        ctx.stroke();

        // Initial above dot
        ctx.fillStyle = d.color + '0.85)';
        ctx.font = '700 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(d.initial, d.x, baseY - 14);

        // Time below dot
        ctx.fillStyle = d.color + '0.55)';
        ctx.font = '400 7px monospace';
        ctx.fillText(d.time, d.x, baseY + 18);
    }

    function draw() {
        const t = (Date.now() - t0) / 1000;
        ctx.clearRect(0, 0, W, H);

        // ECG line — scrolls left at constant speed
        const speed = W / 7; // full segment in ~7s
        const offset = (t * speed) % segW;
        drawWave(offset);

        // Team dots — pulse on their own rhythm
        dots.forEach(d => drawDot(d, t));

        requestAnimationFrame(draw);
    }
    draw();
}

// ── DAGRAPPORT — placeholder until feature is built ──────────────────────
function openDagrapport() {
    alert('Dagrapport komt eraan — feature wordt binnenkort gebouwd');
}
