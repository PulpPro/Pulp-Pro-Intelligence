// ============================================================
// PULP PRO — ORIGIN REPORT
// Live weather data (Open-Meteo) + AI analysis (Gemini API)
// Covers today + last 35 days (5 weeks) for transit-accurate reporting
// ============================================================

const OriginReport = (() => {

    const GEMINI_KEY = 'AIzaSyCu5n2KXno1vYgmDhmr3HC1rEbmo5Dbmrg';
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

    // ── ORIGINS DATABASE ──────────────────────────────────────
    const ORIGINS = {
        banana: {
            'Latin America': [
                { name: 'Ecuador',            lat: -1.8,   lon: -78.2,  region: 'Guayas / Los Ríos' },
                { name: 'Colombia',           lat:  7.9,   lon: -76.6,  region: 'Urabá / Magdalena' },
                { name: 'Costa Rica',         lat:  9.9,   lon: -83.7,  region: 'Caribbean lowlands' },
                { name: 'Guatemala',          lat: 14.6,   lon: -90.5,  region: 'Izabal / Escuintla' },
                { name: 'Honduras',           lat: 15.5,   lon: -87.2,  region: 'Cortés / Atlántida' },
                { name: 'Panama',             lat:  8.4,   lon: -82.4,  region: 'Chiriquí / Bocas' }
            ],
            'Africa & EU': [
                { name: 'Ivory Coast',        lat:  5.3,   lon: -4.0,   region: 'Agnéby-Tiassa' },
                { name: 'Cameroon',           lat:  4.1,   lon:  9.2,   region: 'Southwest / Littoral' },
                { name: 'Canary Islands',     lat: 28.3,   lon: -16.5,  region: 'Tenerife / La Palma' }
            ]
        }
    };

    // ── CORE LOGIC ────────────────────────────────────────────

    async function fetchWeatherData(lat, lon) {
        const today = new Date();
        const fiveWeeksAgo = new Date();
        fiveWeeksAgo.setDate(today.getDate() - 35);

        const formatDate = (date) => date.toISOString().split('T')[0];

        const startStr = formatDate(fiveWeeksAgo);
        const endStr = formatDate(today);

        // Using the ARCHIVE API for historical data (past 5 weeks)
        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startStr}&end_date=${endStr}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Weather API Error');
            const data = await res.json();
            return data.daily || null;
        } catch (e) {
            console.error("Weather fetch failed:", e);
            return null;
        }
    }

    async function getAIAnalysis(fruit, origin, weather) {
        const prompt = `Analyze fruit quality for ${fruit} from ${origin.name} (${origin.region}). 
        Weather last 35 days: Max temps ${weather.temperature_2m_max.join(',')}°C, 
        Precipitation: ${weather.precipitation_sum.join(',')}mm. 
        Provide a concise professional report on potential shelf life and quality risks.`;

        try {
            const response = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (e) {
            return "Analysis temporarily unavailable. Please check your connection.";
        }
    }

    // ── UI CONTROLS (Rest of your original code) ────────────────

    function init() {
        if (document.getElementById('or-picker-view')) return;
        buildPickerView();
        buildReportView();
    }

    function buildPickerView() {
        const div = document.createElement('div');
        div.id = 'or-picker-view';
        div.className = 'nav-view';
        div.innerHTML = `
        <div style="max-width:640px; margin:0 auto; padding:20px;">
            <h2 style="color:#fff; margin-bottom:20px;">Select Origin</h2>
            <div id="or-list"></div>
            <button class="btn-main btn-back" onclick="OriginReport.backToMiddleHub()">← Back</button>
        </div>`;
        document.body.appendChild(div);
        renderList();
    }

    function renderList() {
        const list = document.getElementById('or-list');
        let html = '';
        for (const category in ORIGINS.banana) {
            html += `<h3 style="color:rgba(255,255,255,0.5); font-size:0.7rem; text-transform:uppercase; margin:20px 0 10px;">${category}</h3>`;
            ORIGINS.banana[category].forEach(org => {
                html += `
                <div class="origin-card" onclick="OriginReport.openReport('${org.name}')" 
                     style="background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; margin-bottom:10px; cursor:pointer; border:1px solid rgba(255,255,255,0.1);">
                    <div style="color:#fff; font-weight:bold;">${org.name}</div>
                    <div style="color:rgba(255,255,255,0.6); font-size:0.8rem;">${org.region}</div>
                </div>`;
            });
        }
        list.innerHTML = html;
    }

    function buildReportView() {
        const div = document.createElement('div');
        div.id = 'or-report-view';
        div.className = 'nav-view hidden';
        div.style.paddingBottom = '40px';
        div.innerHTML = `
        <div style="max-width:640px; margin:0 auto; padding:0 4px;">
            <div style="padding:20px 16px 16px; margin-bottom:4px;">
                <button onclick="OriginReport.backToPicker()"
                    style="background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.15);
                    color:#fff; font-size:0.62rem; font-weight:900; text-transform:uppercase;
                    letter-spacing:1px; padding:7px 16px; border-radius:20px;
                    cursor:pointer; margin-bottom:16px; display:inline-block;">← Back</button>
                <div id="or-report-header"></div>
            </div>
            <div id="or-report-content" style="padding:0 16px;"></div>
        </div>`;
        document.body.appendChild(div);
    }

    async function openReport(name) {
        document.getElementById('or-picker-view').classList.add('hidden');
        const reportView = document.getElementById('or-report-view');
        reportView.classList.remove('hidden');

        const header = document.getElementById('or-report-header');
        const content = document.getElementById('or-report-content');

        header.innerHTML = `<h1 style="color:#fff; margin:0;">${name}</h1><p style="color:rgba(255,255,255,0.5);">Fetching historical origin data...</p>`;
        content.innerHTML = `<div class="loader-simple"></div>`;

        // Find origin data
        let originData = null;
        for (const cat in ORIGINS.banana) {
            const found = ORIGINS.banana[cat].find(o => o.name === name);
            if (found) originData = found;
        }

        const weather = await fetchWeatherData(originData.lat, originData.lon);
        
        if (!weather) {
            content.innerHTML = `<div style="color:#ff4444;">Unable to load weather data. Please check connection.</div>`;
            return;
        }

        const analysis = await getAIAnalysis('Banana', originData, weather);

        header.innerHTML = `<h1 style="color:#fff; margin:0;">${name}</h1><p style="color:#4CAF50;">● Origin Report Active</p>`;
        content.innerHTML = `<div style="color:rgba(255,255,255,0.9); line-height:1.6; font-size:0.95rem;">${analysis.replace(/\n/g, '<br>')}</div>`;
    }

    function backToPicker() {
        document.getElementById('or-report-view').classList.add('hidden');
        document.getElementById('or-picker-view').classList.remove('hidden');
    }

    function backToMiddleHub() {
        location.reload(); // Or your specific routing logic
    }

    return { init, openReport, backToPicker, backToMiddleHub };

})();

// Initialize
OriginReport.init();
