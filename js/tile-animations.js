// ── TILE ANIMATIONS ───────────────────────────────────────────────────────
// Handles canvas animations for Pulp AI, Reminders and Floor IQ tiles

document.addEventListener('DOMContentLoaded', () => {
    initRemTileCanvas();
    initIQTileCanvas();
    // Pulp AI aurora — call after short delay to ensure canvas is sized
    setTimeout(() => {
        if (typeof initPulpAITile === 'function') initPulpAITile();
    }, 300);
});

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
