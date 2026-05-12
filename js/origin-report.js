// ============================================================
// PULP PRO — ORIGIN REPORT
// Live weather data (Open-Meteo) + AI analysis (Gemini API)
// Covers today + last 28 days for transit-accurate reporting
// ============================================================

const OriginReport = (() => {

    const GEMINI_URL = 'https://pulppro-gemini-proxy.pulpprobrain.workers.dev';

    // ── ORIGINS DATABASE ──────────────────────────────────────
    const ORIGINS = {
        banana: {
            'Latin America': [
                { name: 'Ecuador',            lat: -1.8,   lon: -78.2,  region: 'Guayas / Los Ríos' },
                { name: 'Colombia',           lat:  7.9,   lon: -76.6,  region: 'Urabá / Magdalena' },
                { name: 'Costa Rica',         lat:  9.9,   lon: -83.7,  region: 'Caribbean lowlands' },
                { name: 'Guatemala',          lat: 14.6,   lon: -90.5,  region: 'Izabal / Escuintla' },
                { name: 'Honduras',           lat: 15.5,   lon: -87.2,  region: 'Cortés / Atlántida' },
                { name: 'Panama',             lat:  8.4,   lon: -80.1,  region: 'Bocas del Toro' },
                { name: 'Dominican Republic', lat: 19.1,   lon: -70.2,  region: 'Azua / Barahona' },
                { name: 'Mexico',             lat: 18.0,   lon: -92.9,  region: 'Tabasco / Chiapas' },
                { name: 'Peru',               lat: -6.8,   lon: -79.8,  region: 'Piura / La Libertad' },
                { name: 'Brazil',             lat: -3.7,   lon: -38.5,  region: 'Ceará / Bahia' },
            ],
            'Africa': [
                { name: 'Cameroon',           lat:  4.1,   lon:  9.3,   region: 'Mungo / Moungo valley' },
                { name: 'Ivory Coast',        lat:  5.4,   lon:  -4.0,  region: 'Abidjan / South coast' },
                { name: 'Ghana',              lat:  6.7,   lon:  -1.6,  region: 'Ashanti / Brong-Ahafo' },
                { name: 'Nigeria',            lat:  6.5,   lon:   3.4,  region: 'Edo / Delta State' },
                { name: 'Tanzania',           lat: -6.8,   lon:  39.3,  region: 'Tanga / Kilimanjaro' },
            ],
            'Asia & Pacific': [
                { name: 'Philippines',        lat: 13.4,   lon: 123.3,  region: 'Davao / Mindanao' },
                { name: 'Indonesia',          lat: -7.6,   lon: 110.2,  region: 'Java / Sumatra' },
                { name: 'India',              lat: 13.1,   lon:  77.6,  region: 'Tamil Nadu / Karnataka' },
                { name: 'Vietnam',            lat: 13.1,   lon: 109.3,  region: 'Khánh Hòa / Đắk Lắk' },
            ],
        },
        mango: {
            'South Asia': [
                { name: 'India',              lat: 20.5,   lon:  72.9,  region: 'Gujarat / Konkan coast' },
                { name: 'Pakistan',           lat: 25.4,   lon:  68.4,  region: 'Sindh / Punjab' },
                { name: 'Bangladesh',         lat: 24.4,   lon:  88.6,  region: 'Rajshahi / Chapai' },
            ],
            'Latin America': [
                { name: 'Peru',               lat: -8.1,   lon: -79.0,  region: 'Piura / La Libertad' },
                { name: 'Brazil',             lat: -9.4,   lon: -40.5,  region: 'São Francisco Valley' },
                { name: 'Mexico',             lat: 18.9,   lon: -99.2,  region: 'Guerrero / Michoacán' },
                { name: 'Ecuador',            lat: -1.0,   lon: -80.4,  region: 'Manabí / El Oro' },
                { name: 'Dominican Republic', lat: 18.7,   lon: -70.1,  region: 'Azua / Barahona' },
                { name: 'Haiti',              lat: 18.5,   lon: -73.3,  region: 'Artibonite Valley' },
                { name: 'Guatemala',          lat: 14.6,   lon: -90.5,  region: 'Escuintla / Retalhuleu' },
            ],
            'Africa': [
                { name: 'Senegal',            lat: 14.7,   lon: -16.9,  region: 'Casamance / Ziguinchor' },
                { name: 'Mali',               lat: 12.6,   lon:  -8.0,  region: 'Sikasso region' },
                { name: 'Burkina Faso',       lat: 11.2,   lon:  -0.4,  region: 'Southwest region' },
                { name: 'Ivory Coast',        lat:  7.5,   lon:  -5.5,  region: 'Inland regions' },
                { name: 'South Africa',       lat: -24.9,  lon:  31.0,  region: 'Limpopo / Mpumalanga' },
                { name: 'Kenya',              lat:  0.5,   lon:  34.6,  region: 'Coast / Eastern Province' },
                { name: 'Egypt',              lat: 24.1,   lon:  32.9,  region: 'Aswan / Upper Egypt' },
            ],
            'Asia & Pacific': [
                { name: 'Thailand',           lat: 13.8,   lon: 100.5,  region: 'Central / Chiang Mai' },
                { name: 'Philippines',        lat: 14.6,   lon: 121.0,  region: 'Luzon / Visayas' },
                { name: 'Vietnam',            lat: 11.9,   lon: 108.4,  region: 'Bình Thuận / Đồng Nai' },
                { name: 'China',              lat: 22.3,   lon: 114.2,  region: 'Guangdong / Hainan' },
                { name: 'Australia',          lat: -17.0,  lon: 145.8,  region: 'Queensland / NT' },
            ],
            'Middle East': [
                { name: 'Oman',               lat: 23.6,   lon:  58.6,  region: 'Batinah Coast' },
                { name: 'Yemen',              lat: 14.5,   lon:  44.2,  region: 'Tihama coastal plain' },
            ],
        },
        avocado: {
            'Latin America': [
                { name: 'Mexico',             lat: 19.7,   lon: -101.2, region: 'Michoacán' },
                { name: 'Peru',               lat: -11.1,  lon: -75.5,  region: 'La Libertad / Junín' },
                { name: 'Chile',              lat: -33.5,  lon: -70.8,  region: 'Valparaíso / O\'Higgins' },
                { name: 'Colombia',           lat:  5.1,   lon: -75.5,  region: 'Antioquia / Caldas' },
                { name: 'Dominican Republic', lat: 18.5,   lon: -69.9,  region: 'Cibao Valley' },
                { name: 'Brazil',             lat: -22.9,  lon: -43.2,  region: 'São Paulo / Minas Gerais' },
                { name: 'Guatemala',          lat: 14.9,   lon: -91.5,  region: 'Highlands / Sacatepéquez' },
            ],
            'Africa': [
                { name: 'South Africa',       lat: -29.6,  lon:  30.4,  region: 'KwaZulu-Natal / Limpopo' },
                { name: 'Kenya',              lat:  0.5,   lon:  37.1,  region: 'Central / Eastern Province' },
                { name: 'Tanzania',           lat: -3.4,   lon:  36.7,  region: 'Arusha / Kilimanjaro' },
                { name: 'Ethiopia',           lat:  9.0,   lon:  38.7,  region: 'Southern highlands' },
                { name: 'Zimbabwe',           lat: -20.2,  lon:  28.6,  region: 'Mashonaland' },
                { name: 'Morocco',            lat: 30.4,   lon:  -9.6,  region: 'Agadir / Souss-Massa' },
            ],
            'Europe & Middle East': [
                { name: 'Spain',              lat: 36.7,   lon:  -4.4,  region: 'Málaga / Granada' },
                { name: 'Israel',             lat: 32.8,   lon:  35.1,  region: 'Galilee / Sharon Plain' },
                { name: 'Portugal',           lat: 37.1,   lon:  -8.7,  region: 'Algarve / Alentejo' },
            ],
            'Asia & Pacific': [
                { name: 'Indonesia',          lat: -7.6,   lon: 110.2,  region: 'Java / Sumatra' },
                { name: 'Australia',          lat: -28.0,  lon: 153.4,  region: 'Queensland / NSW' },
                { name: 'New Zealand',        lat: -37.7,  lon: 176.2,  region: 'Bay of Plenty / Northland' },
            ],
        }
    };

    let activeFruit = null;
    let savedScrollY = 0;

    // ── SHOW VIEW ─────────────────────────────────────────────
    function showView(id) {
        document.querySelectorAll('.nav-view').forEach(el => el.classList.add('hidden'));
        const app = document.getElementById('appInterface');
        if (app) app.classList.add('hidden');
        const target = document.getElementById(id);
        if (target) { target.classList.remove('hidden'); window.scrollTo(0, 0); }
    }

    // ── OPEN ORIGIN PICKER ────────────────────────────────────
    function open(fruit) {
        activeFruit = fruit;
        savedScrollY = window.scrollY;
        ensureViews();

        const lang = getLang();
        const nl   = lang === 'nl';
        const fruitNames = { banana: nl ? 'Banaan' : 'Banana', mango: 'Mango', avocado: 'Avocado' };
        const fruitEmojis = { banana: '🍌', mango: '🥭', avocado: '🥑' };

        const titleEl = document.getElementById('or-picker-title');
        if (titleEl) titleEl.innerText = fruitEmojis[fruit] + ' ' + (fruitNames[fruit] || fruit) + ' — ' + (nl ? 'Kies Herkomst' : 'Select Origin');

        const container = document.getElementById('or-picker-list');
        if (!container) return;

        const origins = ORIGINS[fruit] || {};
        container.innerHTML = Object.entries(origins).map(([region, countries]) => `
        <div style="margin-bottom:18px;">
            <div style="font-size:0.52rem; font-weight:900; text-transform:uppercase; letter-spacing:2px;
                color:var(--text-dim); padding:6px 16px 8px; opacity:0.6;">${region}</div>
            <div style="border-radius:16px; overflow:hidden; border:1px solid var(--border-glass);">
                ${countries.map((c, i) => `
                <div onclick="OriginReport.generate('${c.name}', ${c.lat}, ${c.lon}, '${c.region}')"
                    style="display:flex; align-items:center; justify-content:space-between;
                    padding:14px 18px; cursor:pointer; background:var(--glass-card);
                    ${i < countries.length - 1 ? 'border-bottom:1px solid var(--border-glass);' : ''}
                    transition:background 0.15s;"
                    onmouseover="this.style.background='rgba(255,255,255,0.05)'"
                    onmouseout="this.style.background='var(--glass-card)'">
                    <div>
                        <div style="font-size:0.88rem; font-weight:800; color:var(--text-main);">${c.name}</div>
                        <div style="font-size:0.58rem; color:var(--text-dim); font-weight:600; margin-top:2px;">${c.region}</div>
                    </div>
                    <div style="color:var(--text-dim); font-size:1.1rem;">›</div>
                </div>`).join('')}
            </div>
        </div>`).join('');

        showView('or-picker-view');
    }

    // ── GENERATE REPORT ───────────────────────────────────────
    async function generate(country, lat, lon, region) {
        const lang = getLang();
        const nl   = lang === 'nl';

        // Show loading screen
        showView('or-report-view');
        const reportEl = document.getElementById('or-report-content');
        if (reportEl) {
            reportEl.innerHTML = `
            <div style="text-align:center; padding:60px 20px;">
                <div style="font-size:2.5rem; margin-bottom:16px;">🌍</div>
                <div style="font-size:0.75rem; font-weight:900; color:var(--pulp-lime);
                    text-transform:uppercase; letter-spacing:2px; margin-bottom:8px;
                    animation: pulse 1.5s infinite;">${nl ? 'Rapport genereren...' : 'Generating report...'}</div>
                <div style="font-size:0.6rem; color:var(--text-dim); font-weight:600;">
                    ${nl ? 'Weersdata ophalen voor' : 'Fetching weather data for'} ${country}
                </div>
            </div>`;
        }

        // Update header
        const headerEl = document.getElementById('or-report-header');
        if (headerEl) {
            const fruitEmojis = { banana: '🍌', mango: '🥭', avocado: '🥑' };
            headerEl.innerHTML = `
            <div style="font-size:0.48rem; font-weight:900; text-transform:uppercase; letter-spacing:2px;
                color:var(--pulp-lime); margin-bottom:4px; opacity:0.8;">
                ${fruitEmojis[activeFruit]} ${activeFruit.toUpperCase()} · ${nl ? 'HERKOMSTRAPPORT' : 'ORIGIN REPORT'}
            </div>
            <div style="font-size:1.4rem; font-weight:900; color:var(--text-main);">${country}</div>
            <div style="font-size:0.6rem; color:var(--text-dim); font-weight:600; margin-top:3px;">${region}</div>`;
        }

        try {
            // ── Fetch 28 days of weather from Open-Meteo
            const today = new Date();
            const endDate = today.toISOString().split('T')[0];
            const startDate = new Date(today - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,relative_humidity_2m_max&start_date=${startDate}&end_date=${endDate}&timezone=auto`;

            const weatherResp = await fetch(weatherUrl);
            const weatherData = await weatherResp.json();

            if (!weatherData.daily) throw new Error('Weather data unavailable');

            const daily = weatherData.daily;
            const dates  = daily.time;
            const maxTemps = daily.temperature_2m_max;
            const minTemps = daily.temperature_2m_min;
            const precip  = daily.precipitation_sum;
            const wind    = daily.windspeed_10m_max;
            const humidity = daily.relative_humidity_2m_max;

            // Build weekly summaries for the prompt
            const weeks = [
                { label: nl ? 'Week 4 geleden (oogstperiode)' : 'Week 4 ago (harvest period)',     days: dates.slice(0, 7),  temps: maxTemps.slice(0, 7),  rain: precip.slice(0, 7),  wind: wind.slice(0, 7),  hum: humidity.slice(0, 7) },
                { label: nl ? 'Week 3 geleden (verpakkingsperiode)' : 'Week 3 ago (packing period)', days: dates.slice(7, 14), temps: maxTemps.slice(7, 14), rain: precip.slice(7, 14), wind: wind.slice(7, 14), hum: humidity.slice(7, 14) },
                { label: nl ? 'Week 2 geleden (transport)' : 'Week 2 ago (in transit)',            days: dates.slice(14, 21),temps: maxTemps.slice(14, 21),rain: precip.slice(14, 21),wind: wind.slice(14, 21),hum: humidity.slice(14, 21) },
                { label: nl ? 'Afgelopen week (aankomst)' : 'Last week (arrival)',                  days: dates.slice(21),    temps: maxTemps.slice(21),    rain: precip.slice(21),    wind: wind.slice(21),    hum: humidity.slice(21) },
            ];

            const avgTemp = arr => (arr.filter(Boolean).reduce((a, b) => a + b, 0) / arr.filter(Boolean).length).toFixed(1);
            const totalRain = arr => arr.filter(Boolean).reduce((a, b) => a + b, 0).toFixed(1);
            const avgWind = arr => (arr.filter(Boolean).reduce((a, b) => a + b, 0) / arr.filter(Boolean).length).toFixed(1);
            const avgHum = arr => (arr.filter(Boolean).reduce((a, b) => a + b, 0) / arr.filter(Boolean).length).toFixed(0);

            const weatherSummary = weeks.map(w => `
${w.label}:
- Avg max temp: ${avgTemp(w.temps)}°C
- Total rainfall: ${totalRain(w.rain)}mm
- Avg wind speed: ${avgWind(w.wind)} km/h
- Avg humidity: ${avgHum(w.hum)}%`).join('\n');

            // Current conditions (last 3 days average)
            const currentTemp = avgTemp(maxTemps.slice(-3));
            const currentRain = totalRain(precip.slice(-3));
            const currentHum  = avgHum(humidity.slice(-3));

            // ── Build Gemini prompt
            const prompt = `You are a senior postharvest fruit quality specialist with 20+ years of experience in tropical fruit supply chains. A fruit importer needs a practical, professional quality report based on real weather data from the growing region.

FRUIT: ${activeFruit.toUpperCase()}
ORIGIN: ${country} (${region})
REPORT DATE: ${endDate}

WEATHER DATA — LAST 28 DAYS:
${weatherSummary}

CURRENT CONDITIONS (last 3 days):
- Avg max temp: ${currentTemp}°C
- Total rainfall: ${currentRain}mm
- Avg humidity: ${currentHum}%

CONTEXT: Fruit harvested 4 weeks ago is arriving now. Fruit being harvested today will arrive in 4 weeks. Analyse both scenarios.

Write a professional fruit quality report with exactly these 5 sections. Be specific, practical and actionable. No generic advice — base everything on the actual weather numbers above.

FORMAT YOUR RESPONSE AS JSON with this exact structure:
{
  "conditions": "2-3 sentences describing what the weather has been like over the 28 days and current conditions",
  "quality_impact": "2-3 sentences on how this specific weather has affected fruit quality, ripening rate, sugar development, and any disease pressure for ${activeFruit}",
  "arriving_now": "2-3 sentences specifically about fruit that was harvested 4 weeks ago — what conditions it experienced and what quality to expect on arrival today",
  "arriving_in_4_weeks": "2-3 sentences about fruit being harvested right now — what conditions it is experiencing and what quality importers should expect in 4 weeks",
  "alerts": ["alert 1 if any", "alert 2 if any"],
  "overall_rating": "Good|Moderate|Poor|Excellent",
  "rating_reason": "One sentence explaining the overall rating"
}

Only respond with the JSON. No extra text.`;

            // ── Call Gemini via proxy
            const geminiResp = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
                })
            });

            const geminiData = await geminiResp.json();
            const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const clean = rawText.replace(/```json|```/g, '').trim();
            const report = JSON.parse(clean);

            // ── Render report
            renderReport(report, country, region, currentTemp, currentRain, currentHum, endDate, nl);

        } catch (err) {
            console.error('Origin report error:', err);
            if (reportEl) {
                reportEl.innerHTML = `
                <div style="text-align:center; padding:40px 20px;">
                    <div style="font-size:2rem; margin-bottom:12px;">📡</div>
                    <div style="font-size:0.75rem; font-weight:900; color:var(--pulp-red);
                        text-transform:uppercase; letter-spacing:2px; margin-bottom:8px;">
                        ${nl ? 'Rapport mislukt' : 'Report failed'}
                    </div>
                    <div style="font-size:0.65rem; color:var(--text-dim); margin-bottom:20px;">
                        ${nl ? 'Controleer uw internetverbinding en probeer opnieuw.' : 'Check your internet connection and try again.'}
                    </div>
                    <button onclick="OriginReport.generate('${country}', ${lat}, ${lon}, '${region}')"
                        class="btn-main" style="max-width:200px; margin:0 auto;">
                        ${nl ? 'Opnieuw proberen' : 'Try again'}
                    </button>
                </div>`;
            }
        }
    }

    // ── RENDER REPORT ─────────────────────────────────────────
    function renderReport(report, country, region, temp, rain, hum, date, nl) {
        const reportEl = document.getElementById('or-report-content');
        if (!reportEl) return;

        const ratingColor = {
            'Excellent': '#78c830',
            'Good':      '#a6e22e',
            'Moderate':  '#ff8c00',
            'Poor':      '#ff4d4d',
        }[report.overall_rating] || '#ff8c00';

        const ratingEmoji = {
            'Excellent': '🟢',
            'Good':      '🟡',
            'Moderate':  '🟠',
            'Poor':      '🔴',
        }[report.overall_rating] || '🟠';

        const alerts = report.alerts?.filter(a => a && a.trim()) || [];

        reportEl.innerHTML = `

        <!-- Overall rating badge -->
        <div style="background:${ratingColor}15; border:1px solid ${ratingColor}30;
            border-radius:18px; padding:16px 20px; margin-bottom:16px;
            display:flex; align-items:center; gap:14px;">
            <div style="font-size:2.2rem; flex-shrink:0;">${ratingEmoji}</div>
            <div>
                <div style="font-size:0.48rem; font-weight:900; text-transform:uppercase;
                    letter-spacing:2px; color:${ratingColor}; margin-bottom:4px;">
                    ${nl ? 'Algehele kwaliteitsrating' : 'Overall quality rating'}
                </div>
                <div style="font-size:1.1rem; font-weight:900; color:var(--text-main); margin-bottom:3px;">
                    ${report.overall_rating}
                </div>
                <div style="font-size:0.7rem; color:var(--text-dim); font-weight:500; line-height:1.4;">
                    ${report.rating_reason || ''}
                </div>
            </div>
        </div>

        <!-- Current conditions quick stats -->
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:16px;">
            <div style="background:var(--glass-card); border:1px solid var(--border-glass);
                border-radius:14px; padding:12px; text-align:center;">
                <div style="font-size:1.3rem;">🌡️</div>
                <div style="font-size:0.9rem; font-weight:900; color:var(--text-main); margin-top:4px;">${temp}°C</div>
                <div style="font-size:0.46rem; color:var(--text-dim); font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-top:2px;">${nl ? 'Temp' : 'Temp'}</div>
            </div>
            <div style="background:var(--glass-card); border:1px solid var(--border-glass);
                border-radius:14px; padding:12px; text-align:center;">
                <div style="font-size:1.3rem;">🌧️</div>
                <div style="font-size:0.9rem; font-weight:900; color:var(--text-main); margin-top:4px;">${rain}mm</div>
                <div style="font-size:0.46rem; color:var(--text-dim); font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-top:2px;">${nl ? 'Neerslag (3d)' : 'Rain (3d)'}</div>
            </div>
            <div style="background:var(--glass-card); border:1px solid var(--border-glass);
                border-radius:14px; padding:12px; text-align:center;">
                <div style="font-size:1.3rem;">💧</div>
                <div style="font-size:0.9rem; font-weight:900; color:var(--text-main); margin-top:4px;">${hum}%</div>
                <div style="font-size:0.46rem; color:var(--text-dim); font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-top:2px;">${nl ? 'Luchtvochtigheid' : 'Humidity'}</div>
            </div>
        </div>

        ${alerts.length > 0 ? `
        <!-- Alerts -->
        <div style="background:rgba(255,77,77,0.08); border:1px solid rgba(255,77,77,0.25);
            border-radius:16px; padding:14px 16px; margin-bottom:16px;">
            <div style="font-size:0.52rem; font-weight:900; text-transform:uppercase;
                letter-spacing:2px; color:#ff4d4d; margin-bottom:10px;">
                ⚠️ ${nl ? 'Waarschuwingen' : 'Alerts'}
            </div>
            ${alerts.map(a => `
            <div style="display:flex; gap:10px; align-items:flex-start; margin-bottom:7px;">
                <span style="color:#ff4d4d; font-size:0.7rem; flex-shrink:0; margin-top:1px;">●</span>
                <span style="font-size:0.82rem; color:var(--text-dim); font-weight:500; line-height:1.5;">${a}</span>
            </div>`).join('')}
        </div>` : ''}

        <!-- Sections -->
        ${[
            { icon: '🌤️', label: nl ? 'Weersomstandigheden' : 'Weather conditions',        text: report.conditions },
            { icon: '🍑', label: nl ? 'Kwaliteitsimpact' : 'Quality impact',               text: report.quality_impact },
            { icon: '🚢', label: nl ? 'Fruit dat nu aankomt' : 'Fruit arriving now',        text: report.arriving_now },
            { icon: '📦', label: nl ? 'Fruit over 4 weken' : 'Fruit arriving in 4 weeks',  text: report.arriving_in_4_weeks },
        ].map(sec => `
        <div style="margin-bottom:18px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;
                padding-bottom:8px; border-bottom:1px solid var(--border-glass);">
                <span style="font-size:1rem;">${sec.icon}</span>
                <span style="font-size:0.56rem; font-weight:900; color:var(--pulp-lime);
                    text-transform:uppercase; letter-spacing:2px;">${sec.label}</span>
            </div>
            <p style="font-size:0.9rem; color:var(--text-dim); line-height:1.8;
                font-weight:500; margin:0;">${sec.text || ''}</p>
        </div>`).join('')}

        <!-- Timestamp -->
        <div style="text-align:center; padding:16px 0 0;
            border-top:1px solid var(--border-glass); margin-top:8px;">
            <div style="font-size:0.48rem; color:rgba(255,255,255,0.2); font-weight:700;
                text-transform:uppercase; letter-spacing:1px;">
                ${nl ? 'Rapport gegenereerd op' : 'Report generated'} ${date} · ${nl ? 'Gebaseerd op 28 dagen weerdata' : 'Based on 28 days weather data'}
            </div>
        </div>`;
    }

    // ── BACK NAVIGATION ───────────────────────────────────────
    function backToPicker() {
        showView('or-picker-view');
    }

    function backToMiddleHub() {
        ['or-picker-view', 'or-report-view'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
        const mh = document.getElementById('middle-hub');
        if (mh) mh.classList.remove('hidden');
        requestAnimationFrame(() => window.scrollTo(0, savedScrollY));
    }

    // ── HELPERS ───────────────────────────────────────────────
    function getLang() {
        if (typeof currentLang !== 'undefined') return currentLang;
        return localStorage.getItem('pulpLang') || 'en';
    }

    // ── BUILD VIEWS ───────────────────────────────────────────
    function ensureViews() {
        if (!document.getElementById('or-picker-view')) buildPickerView();
        if (!document.getElementById('or-report-view')) buildReportView();
    }

    function buildPickerView() {
        const div = document.createElement('div');
        div.id = 'or-picker-view';
        div.className = 'nav-view hidden';
        div.innerHTML = `
        <div style="max-width:600px; margin:0 auto;">
            <div class="hub-title" id="or-picker-title"></div>
            <div id="or-picker-list" style="margin-bottom:16px;"></div>
            <button class="btn-main btn-back" onclick="OriginReport.backToMiddleHub()">← Back</button>
        </div>`;
        document.body.appendChild(div);
    }

    function buildReportView() {
        const div = document.createElement('div');
        div.id = 'or-report-view';
        div.className = 'nav-view hidden';
        div.style.paddingBottom = '40px';
        div.innerHTML = `
        <div style="max-width:640px; margin:0 auto; padding:0 4px;">
            <!-- Header -->
            <div style="padding:20px 16px 16px; margin-bottom:4px;">
                <button onclick="OriginReport.backToPicker()"
                    style="background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.15);
                    color:#fff; font-size:0.62rem; font-weight:900; text-transform:uppercase;
                    letter-spacing:1px; padding:7px 16px; border-radius:20px;
                    cursor:pointer; margin-bottom:16px; display:inline-block;">← Back</button>
                <div id="or-report-header"></div>
            </div>
            <!-- Content -->
            <div id="or-report-content" style="padding:0 16px;"></div>
            <!-- Bottom back -->
            <div style="padding:16px 16px 0;">
                <button class="btn-main btn-back" onclick="OriginReport.backToPicker()">← Back</button>
            </div>
        </div>`;
        document.body.appendChild(div);
    }

    return { open, generate, backToPicker, backToMiddleHub };
})();
