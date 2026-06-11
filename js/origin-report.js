// ── ORIGIN REPORT ─────────────────────────────────────────────────────────
// 3-screen flow: fruit picker → country list → country detail
// Live weather: WeatherAPI · AI quality verdict: Groq Llama 3.3 70B
// Worker endpoint: /origin-analysis

const OR_WORKER = 'https://pulppro-access.pulpprobrain.workers.dev';

const OR_COUNTRIES = {
    banana: [
        { n: 'Ecuador',       r: 'S. America', lat: -2.17, lon: -79.92 },
        { n: 'Costa Rica',    r: 'C. America', lat: 10.00, lon: -83.03 },
        { n: 'Colombia',      r: 'S. America', lat: 11.24, lon: -74.20 },
        { n: 'Panama',        r: 'C. America', lat:  9.34, lon: -82.24 },
        { n: 'Guatemala',     r: 'C. America', lat: 15.50, lon: -89.00 },
        { n: 'Honduras',      r: 'C. America', lat: 15.43, lon: -87.92 },
        { n: 'Dom. Republic', r: 'Caribbean',  lat: 19.55, lon: -71.07 },
        { n: 'Mexico',        r: 'N. America', lat: 17.83, lon: -92.62 },
        { n: 'Peru',          r: 'S. America', lat: -5.19, lon: -80.63 },
        { n: 'Brazil',        r: 'S. America', lat: -9.39, lon: -40.50 },
        { n: 'Ivory Coast',   r: 'W. Africa',  lat:  5.36, lon:  -4.00 },
        { n: 'Cameroon',      r: 'W. Africa',  lat:  4.07, lon:   9.36 },
        { n: 'Philippines',   r: 'SE Asia',    lat:  7.07, lon: 125.60 }
    ],
    mango: [
        { n: 'India',         r: 'S. Asia',    lat: 26.85, lon:  80.95 },
        { n: 'Pakistan',      r: 'S. Asia',    lat: 30.16, lon:  71.52 },
        { n: 'Mexico',        r: 'N. America', lat: 19.17, lon: -96.13 },
        { n: 'Brazil',        r: 'S. America', lat: -9.39, lon: -40.50 },
        { n: 'Peru',          r: 'S. America', lat: -5.19, lon: -80.63 },
        { n: 'Ecuador',       r: 'S. America', lat: -2.17, lon: -79.92 },
        { n: 'Dom. Republic', r: 'Caribbean',  lat: 18.28, lon: -70.33 },
        { n: 'Spain',         r: 'Europe',     lat: 36.72, lon:  -4.42 },
        { n: 'Israel',        r: 'M. East',    lat: 32.50, lon:  35.50 },
        { n: 'Senegal',       r: 'W. Africa',  lat: 12.59, lon: -16.27 },
        { n: 'Ivory Coast',   r: 'W. Africa',  lat:  9.46, lon:  -5.63 },
        { n: 'Thailand',      r: 'SE Asia',    lat: 18.79, lon:  98.99 },
        { n: 'Philippines',   r: 'SE Asia',    lat: 10.32, lon: 123.90 }
    ],
    avocado: [
        { n: 'Mexico',        r: 'N. America', lat: 19.42, lon: -102.06 },
        { n: 'Peru',          r: 'S. America', lat: -8.11, lon:  -79.03 },
        { n: 'Colombia',      r: 'S. America', lat:  5.71, lon:  -75.31 },
        { n: 'Dom. Republic', r: 'Caribbean',  lat: 18.91, lon:  -70.74 },
        { n: 'Chile',         r: 'S. America', lat: -32.88, lon: -71.25 },
        { n: 'Brazil',        r: 'S. America', lat: -23.55, lon: -46.63 },
        { n: 'Spain',         r: 'Europe',     lat: 36.78, lon:  -4.10 },
        { n: 'Israel',        r: 'M. East',    lat: 32.85, lon:  35.51 },
        { n: 'Morocco',       r: 'N. Africa',  lat: 30.42, lon:  -9.56 },
        { n: 'Kenya',         r: 'E. Africa',  lat: -0.72, lon:  37.15 },
        { n: 'South Africa',  r: 'S. Africa',  lat: -23.83, lon: 30.16 },
        { n: 'Tanzania',      r: 'E. Africa',  lat: -7.77, lon:  35.69 }
    ]
};

const OR_FRUIT_META = {
    banana:  { label: 'Banana',  color: '#a6e22e', dim: 'rgba(166,226,46,', sub: 'tropical fruit' },
    mango:   { label: 'Mango',   color: '#ffa500', dim: 'rgba(255,165,0,',  sub: 'stone fruit' },
    avocado: { label: 'Avocado', color: '#3da5ff', dim: 'rgba(61,165,255,', sub: 'oil fruit' }
};

let orFruit = null;
let orCountry = null;
let orHistoryActive = false;

// ── ENTRY / EXIT ───────────────────────────────────────────────────────────
function openOriginReport() {
    const view = document.getElementById('origin-report-view');
    if (!view) return;
    view.classList.remove('hidden');
    orShowScreen('or-s-fruit');
    // Push history entry so device back gesture/button closes the view
    window.history.pushState({ orScreen: 'fruit' }, '');
    orHistoryActive = true;
    window.addEventListener('popstate', orHandlePopstate);
}

function closeOriginReport() {
    // Go back through history — popstate handles the actual close
    if (orHistoryActive) {
        window.history.back();
    } else {
        _orCloseInternal();
    }
}

function _orCloseInternal() {
    const view = document.getElementById('origin-report-view');
    if (!view) return;
    view.classList.add('hidden');
    orFruit = null;
    orCountry = null;
    orHistoryActive = false;
    window.removeEventListener('popstate', orHandlePopstate);
}

function orHandlePopstate(e) {
    if (!orHistoryActive) return;
    const view = document.getElementById('origin-report-view');
    if (!view || view.classList.contains('hidden')) return;
    const state = e.state;
    if (!state || !state.orScreen) {
        // Popped past all our entries — view is closing
        _orCloseInternal();
        return;
    }
    if (state.orScreen === 'fruit')        orShowScreen('or-s-fruit');
    else if (state.orScreen === 'country') orShowScreen('or-s-country');
    else if (state.orScreen === 'detail')  orShowScreen('or-s-detail');
}

function orShowScreen(id) {
    document.querySelectorAll('#origin-report-view .or-screen').forEach(s => {
        s.classList.remove('or-active');
    });
    const el = document.getElementById(id);
    if (el) el.classList.add('or-active');
}

// ── SCREEN 2: COUNTRY LIST ─────────────────────────────────────────────────
function orPickFruit(fruit) {
    orFruit = fruit;
    const meta = OR_FRUIT_META[fruit];
    const list = OR_COUNTRIES[fruit] || [];
    const titleEl = document.getElementById('or-country-title');
    const subEl = document.getElementById('or-country-sub');
    const listEl = document.getElementById('or-country-list');
    if (titleEl) titleEl.textContent = meta.label + ' origins';
    if (subEl) subEl.textContent = list.length + ' producing countries · tap for full report';
    if (listEl) {
        listEl.innerHTML = list.map((c, i) => `
            <div class="or-crow" onclick="orPickCountry(${i})">
                <div class="or-c-letter" style="color:${meta.color};background:${meta.dim}0.1);border-color:${meta.dim}0.25);">${c.n.charAt(0)}</div>
                <div class="or-c-name">
                    <div class="or-c-t">${c.n}</div>
                    <div class="or-c-s">${c.r}</div>
                </div>
                <div class="or-c-chev">›</div>
            </div>
        `).join('');
    }
    orShowScreen('or-s-country');
    if (orHistoryActive) window.history.pushState({ orScreen: 'country' }, '');
}

// ── SCREEN 3: COUNTRY DETAIL ───────────────────────────────────────────────
function orPickCountry(idx) {
    const list = OR_COUNTRIES[orFruit] || [];
    orCountry = list[idx];
    if (!orCountry) return;
    const meta = OR_FRUIT_META[orFruit];
    const titleEl = document.getElementById('or-detail-title');
    const subEl = document.getElementById('or-detail-sub');
    if (titleEl) titleEl.textContent = orCountry.n;
    if (subEl) subEl.textContent = meta.label + ' · ' + orCountry.r;

    // Show loading state
    const body = document.getElementById('or-detail-body');
    if (body) {
        body.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;">
                <div class="or-spinner"></div>
                <div style="font-size:12px;color:rgba(96,165,250,0.7);font-weight:700;margin-top:14px;text-transform:uppercase;letter-spacing:1.5px;">Fetching live weather</div>
                <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-top:4px;">AI is analysing quality risks...</div>
            </div>
        `;
    }
    orShowScreen('or-s-detail');
    if (orHistoryActive) window.history.pushState({ orScreen: 'detail' }, '');
    orLoadReport();
}

async function orLoadReport() {
    const body = document.getElementById('or-detail-body');
    if (!body || !orCountry || !orFruit) return;
    try {
        const res = await fetch(OR_WORKER + '/origin-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fruit: orFruit,
                country: orCountry.n,
                region: orCountry.r,
                lat: orCountry.lat,
                lon: orCountry.lon
            })
        });
        if (!res.ok) throw new Error('Server returned ' + res.status);
        const data = await res.json();
        body.innerHTML = orRenderReport(data);
    } catch (e) {
        body.innerHTML = `
            <div style="padding:40px 20px;text-align:center;">
                <div style="font-size:32px;margin-bottom:12px;">⚠️</div>
                <div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:6px;">Couldn't load report</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.5);line-height:1.6;margin-bottom:20px;">${e.message || 'Network error. Check your connection.'}</div>
                <button onclick="orLoadReport()" style="background:rgba(61,165,255,0.12);border:1px solid rgba(61,165,255,0.3);border-radius:10px;padding:11px 22px;font-size:12px;font-weight:800;color:#3da5ff;cursor:pointer;text-transform:uppercase;letter-spacing:1px;font-family:-apple-system,sans-serif;">Try again</button>
            </div>
        `;
    }
}

function orRenderReport(d) {
    const rn = d.rightNow || {};
    const at = d.arrivingToday || {};
    const a4 = d.arrivingIn4Weeks || {};
    const sevColor = s => {
        const k = (s || '').toLowerCase();
        if (k.startsWith('high')) return { c: '#ff5050', cls: 'or-sev-h' };
        if (k.startsWith('med'))  return { c: '#ffa500', cls: 'or-sev-m' };
        return { c: '#a6e22e', cls: 'or-sev-l' };
    };
    const verdictColor = v => {
        const k = (v || '').toLowerCase();
        if (k.includes('risk') || k.includes('high'))  return '#ff5050';
        if (k.includes('caut') || k.includes('warn') || k.includes('med')) return '#ffa500';
        return '#a6e22e';
    };
    const renderDefects = list => (list || []).map(def => {
        const s = sevColor(def.severity);
        return `
            <div class="or-def">
                <div class="or-def-bar" style="background:${s.c};"></div>
                <div class="or-def-name">${def.name}</div>
                <div class="or-def-sev ${s.cls}">${def.severity || 'Low'}</div>
            </div>
        `;
    }).join('');

    const todayDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const harvestDate = new Date(Date.now() - 28*24*60*60*1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const arriveDate = new Date(Date.now() + 28*24*60*60*1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

    return `
        <!-- SECTION 1: RIGHT NOW -->
        <div class="or-sec">
            <div class="or-sec-hdr">
                <div class="or-sec-dot" style="background:#3da5ff;"></div>
                <div class="or-sec-ttl" style="color:#3da5ff;">Right now</div>
                <div class="or-sec-when">Live · ${todayDate}</div>
            </div>
            <div class="or-card">
                <div class="or-wx">
                    <div class="or-wx-c"><div class="or-wx-v">${rn.temp ?? '—'}°C</div><div class="or-wx-l">Temp</div></div>
                    <div class="or-wx-c"><div class="or-wx-v">${rn.humidity ?? '—'}%</div><div class="or-wx-l">Humid.</div></div>
                    <div class="or-wx-c"><div class="or-wx-v">${rn.rain24h ?? 0}mm</div><div class="or-wx-l">Rain 24h</div></div>
                </div>
                <div class="or-vt" style="color:rgba(96,165,250,0.85);">${rn.description || rn.conditions || 'Live weather conditions at the growing region.'}</div>
            </div>
        </div>

        <!-- SECTION 2: ARRIVING TODAY -->
        <div class="or-sec">
            <div class="or-sec-hdr">
                <div class="or-sec-dot" style="background:#ffa500;"></div>
                <div class="or-sec-ttl" style="color:#ffa500;">Arriving today</div>
                <div class="or-sec-when">Harvested ~${harvestDate}</div>
            </div>
            <div class="or-card">
                <div class="or-wx">
                    <div class="or-wx-c"><div class="or-wx-v">${at.harvestTemp ?? '—'}°C</div><div class="or-wx-l">Harvest</div></div>
                    <div class="or-wx-c"><div class="or-wx-v">${at.harvestRain ?? '—'}mm</div><div class="or-wx-l">Rain wk</div></div>
                    <div class="or-wx-c"><div class="or-wx-v">${at.transitTemp ?? '—'}°C</div><div class="or-wx-l">Transit</div></div>
                </div>
                <div style="font-size:9px;color:rgba(255,255,255,0.3);font-weight:600;margin:6px 0 10px;text-transform:uppercase;letter-spacing:1px;">Seasonal averages · AI estimated</div>
                <div class="or-verdict">
                    <div class="or-vl" style="color:${verdictColor(at.verdict)};">AI verdict · ${at.verdict || 'Good'}</div>
                    <div class="or-vt">${at.summary || 'Conditions look stable for arrivals.'}</div>
                    <div class="or-defs">${renderDefects(at.defects)}</div>
                </div>
            </div>
        </div>

        <!-- SECTION 3: ARRIVING IN 4 WEEKS -->
        <div class="or-sec">
            <div class="or-sec-hdr">
                <div class="or-sec-dot" style="background:#a6e22e;"></div>
                <div class="or-sec-ttl" style="color:#a6e22e;">Arriving in 4 weeks</div>
                <div class="or-sec-when">Harvested today · arr. ${arriveDate}</div>
            </div>
            <div class="or-card">
                <div class="or-wx">
                    <div class="or-wx-c"><div class="or-wx-v">${a4.harvestTemp ?? rn.temp ?? '—'}°C</div><div class="or-wx-l">Harvest</div></div>
                    <div class="or-wx-c"><div class="or-wx-v">${a4.harvestRain ?? rn.rain24h ?? 0}mm</div><div class="or-wx-l">Rain</div></div>
                    <div class="or-wx-c"><div class="or-wx-v">${a4.harvestHumidity ?? rn.humidity ?? '—'}%</div><div class="or-wx-l">Humid.</div></div>
                </div>
                <div class="or-verdict">
                    <div class="or-vl" style="color:${verdictColor(a4.verdict)};">AI verdict · ${a4.verdict || 'Good'}</div>
                    <div class="or-vt">${a4.summary || 'Current harvest conditions suggest stable arrivals in 4 weeks.'}</div>
                    <div class="or-defs">${renderDefects(a4.defects)}</div>
                </div>
            </div>
        </div>

        <div style="margin-top:14px;padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:10px;font-size:9px;color:rgba(255,255,255,0.35);line-height:1.6;text-align:center;">
            Weather · WeatherAPI.com &nbsp;·&nbsp; Analysis · Pulp AI (Llama 3.3 70B)
        </div>
    `;
}

// ── NAVIGATION ─────────────────────────────────────────────────────────────
// In-app back buttons use history.back() so they're in sync with device back
function orBackFromCountry() { window.history.back(); }
function orBackFromDetail()  { window.history.back(); }
