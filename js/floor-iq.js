// ── EXIT QUIZ (back button mid-session) ───────────────────────────────────
function iqExitQuiz() {
    clearInterval(iqTimerInt);
    // Submit whatever score was earned this session
    if (iqScore > 0) {
        iqSaveLocalStats();
        const acc = (iqCorrectCount + iqWrongCount) > 0
            ? Math.round(iqCorrectCount / (iqCorrectCount + iqWrongCount) * 100)
            : 0;
        iqSubmitScore(iqScore, acc);
    }
    iqShowScreen('iq-s-lobby');
}

// ── FLOOR IQ ─────────────────────────────────────────────────────────────
const IQ_WORKER = 'https://pulppro-access.pulpprobrain.workers.dev';

// ── HELPERS ───────────────────────────────────────────────────────────────
function iqGetUserCode() {
    const isAdmin = localStorage.getItem('pulpProAdmin') === 'true';
    if (isAdmin) return 'admin';
    return localStorage.getItem('pulpProAccessCode') || null;
}

function iqGetDisplayName(code) {
    if (!code) return 'Unknown';
    if (code === 'admin') return 'Akash';
    const upper = code.toUpperCase();
    if (upper.startsWith('TEST')) return null; // excluded
    const parts = upper.split('-');
    const raw = parts[0] || '';
    return raw.charAt(0) + raw.slice(1).toLowerCase();
}

// ── STATE ─────────────────────────────────────────────────────────────────
let iqLang = localStorage.getItem('iq_lang') || 'en';
let iqQuestions = [];
let iqCurrentIndex = 0;
let iqScore = 0;
let iqStreak = 0;
let iqCorrectCount = 0;
let iqWrongCount = 0;
let iqAnswered = false;
let iqTimerInt = null;
let iqTimeLeft = 45;
let iqCategoryStats = {};
let iqLobbyRefreshInt = null;
let iqAutoRefreshInt = null;
let iqSessionActive = false;
let iqAskedTopics = []; // track category_ids asked this session to avoid repeats

// ── OPEN / CLOSE ──────────────────────────────────────────────────────────
function openFloorIQ() {
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    document.getElementById('colour-scanner-view').classList.add('hidden');
    const pulpaiView = document.getElementById('pulpai-view');
    if (pulpaiView) pulpaiView.classList.add('hidden');
    const remView = document.getElementById('reminders-view');
    if (remView) remView.classList.add('hidden');
    document.getElementById('floor-iq-view').classList.remove('hidden');
    const menuTrigger = document.getElementById('menu-trigger');
    if (menuTrigger) menuTrigger.style.display = 'none';
    iqShowScreen('iq-s-lang');
    iqUpdateTilePreview();
}

function closeFloorIQ() {
    document.getElementById('floor-iq-view').classList.add('hidden');
    document.getElementById('fruit-hub').classList.remove('hidden');
    const menuTrigger = document.getElementById('menu-trigger');
    if (menuTrigger) menuTrigger.style.display = '';
    clearInterval(iqTimerInt);
    clearInterval(iqAutoRefreshInt);
}

// ── SCREEN NAVIGATION ─────────────────────────────────────────────────────
function iqShowScreen(id) {
    document.querySelectorAll('.iq-screen').forEach(s => {
        s.classList.remove('iq-active');
        s.classList.add('iq-out');
    });
    const next = document.getElementById(id);
    if (next) {
        next.classList.remove('iq-out');
        setTimeout(() => next.classList.add('iq-active'), 10);
    }
    if (id === 'iq-s-lobby') {
        iqRenderLobby();
        clearInterval(iqAutoRefreshInt);
    }
    if (id === 'iq-s-quiz') {
        clearInterval(iqAutoRefreshInt);
    }
}

// ── LANGUAGE ──────────────────────────────────────────────────────────────
function iqSetLang(l) {
    iqLang = l;
    localStorage.setItem('iq_lang', l);
    iqShowScreen('iq-s-lobby');
}

// ── LOBBY ─────────────────────────────────────────────────────────────────
function iqRenderLobby() {
    iqLobbyTab('play');
    iqUpdateLobbyStats();
}

function iqLobbyTab(tab) {
    ['play', 'lb', 'hof'].forEach(t => {
        const tabEl = document.getElementById('iq-ltab-' + t);
        const panelEl = document.getElementById('iq-lp-' + t);
        if (tabEl) tabEl.classList.toggle('iq-tab-on', t === tab);
        if (panelEl) panelEl.style.display = t === tab ? 'flex' : 'none';
    });
    if (tab === 'lb') {
        iqLoadLeaderboard();
        clearInterval(iqAutoRefreshInt);
        iqAutoRefreshInt = setInterval(iqLoadLeaderboard, 30000);
    }
    if (tab === 'hof') {
        iqLoadHallOfFame();
        clearInterval(iqAutoRefreshInt);
    }
    if (tab === 'play') {
        clearInterval(iqAutoRefreshInt);
    }
}

function iqUpdateLobbyStats() {
    const code = iqGetUserCode();
    if (!code) return;
    const statsRaw = localStorage.getItem('iq_stats_' + code);
    if (!statsRaw) return;
    try {
        const stats = JSON.parse(statsRaw);
        const pts = document.getElementById('iq-lobby-pts');
        const streak = document.getElementById('iq-lobby-streak');
        const rank = document.getElementById('iq-lobby-rank');
        if (pts) pts.textContent = (stats.weeklyScore || 0).toLocaleString();
        if (streak) streak.textContent = (stats.streak || 0) + (stats.streak >= 3 ? '🔥' : '');
        if (rank) rank.textContent = '#' + (stats.weeklyRank || '—');
    } catch(e) {}
    iqRenderBadges();
}

// ── BADGES ────────────────────────────────────────────────────────────────
const IQ_BADGE_LEVELS = [
    { level: 1, name: { en: 'Bronze', nl: 'Brons' }, threshold: 10, icon: '🥉', color: '#cd7f32', bg: 'rgba(205,127,50,0.15)', border: 'rgba(205,127,50,0.3)' },
    { level: 2, name: { en: 'Silver', nl: 'Zilver' }, threshold: 25, icon: '🥈', color: '#c0c0c0', bg: 'rgba(192,192,192,0.12)', border: 'rgba(192,192,192,0.3)' },
    { level: 3, name: { en: 'Gold', nl: 'Goud' }, threshold: 50, icon: '🥇', color: '#ffd700', bg: 'rgba(255,215,0,0.12)', border: 'rgba(255,215,0,0.35)' },
    { level: 4, name: { en: 'Elite', nl: 'Elite' }, threshold: 100, icon: '💎', color: '#ff64c8', bg: 'rgba(255,100,200,0.12)', border: 'rgba(255,100,200,0.35)' },
];

const IQ_CATEGORIES = [
    { id: 'cold_chain',      icon: '🌡️', name: { en: 'Cold Chain',        nl: 'Koelketen' } },
    { id: 'ripening',        icon: '🍌', name: { en: 'Ripening',           nl: 'Rijping' } },
    { id: 'diseases',        icon: '🦠', name: { en: 'Diseases & Defects', nl: 'Ziekten' } },
    { id: 'post_harvest',    icon: '🔬', name: { en: 'Post-Harvest',       nl: 'Post-Oogst' } },
    { id: 'storage',         icon: '📦', name: { en: 'Storage',            nl: 'Opslag' } },
    { id: 'logistics',       icon: '🚢', name: { en: 'Logistics',          nl: 'Logistiek' } },
    { id: 'growing',         icon: '🌱', name: { en: 'Growing',            nl: 'Teelt' } },
    { id: 'weather',         icon: '☁️', name: { en: 'Weather & Climate',  nl: 'Klimaat' } },
    { id: 'market',          icon: '💰', name: { en: 'Market & Pricing',   nl: 'Markt' } },
    { id: 'certification',   icon: '📋', name: { en: 'Certification',      nl: 'Certificering' } },
    { id: 'mango',           icon: '🥭', name: { en: 'Mango',              nl: 'Mango' } },
    { id: 'avocado',         icon: '🥑', name: { en: 'Avocado',            nl: 'Avocado' } },
    { id: 'citrus',          icon: '🍊', name: { en: 'Citrus',             nl: 'Citrus' } },
    { id: 'berries',         icon: '🍓', name: { en: 'Soft Fruits',        nl: 'Zacht Fruit' } },
    { id: 'stone_fruit',     icon: '🍑', name: { en: 'Stone Fruit',        nl: 'Steenfruit' } },
    { id: 'pineapple',       icon: '🍍', name: { en: 'Tropical Fruits',    nl: 'Tropisch Fruit' } },
    { id: 'food_safety',     icon: '⚠️', name: { en: 'Food Safety',        nl: 'Voedselveiligheid' } },
    { id: 'packaging',       icon: '🗃️', name: { en: 'Packaging & MA',     nl: 'Verpakking' } },
    { id: 'nutrition',       icon: '💊', name: { en: 'Nutrition',          nl: 'Voeding' } },
    { id: 'origins',         icon: '🌍', name: { en: 'Origins & Varieties',nl: 'Herkomst' } },
    { id: 'quality_grading', icon: '🔍', name: { en: 'Quality Grading',    nl: 'Kwaliteit' } },
    { id: 'pest_control',    icon: '🐛', name: { en: 'Pest Control',       nl: 'Plaagbestrijding' } },
    { id: 'soil_water',      icon: '💧', name: { en: 'Soil & Water',       nl: 'Bodem & Water' } },
    { id: 'import_export',   icon: '📜', name: { en: 'Import/Export',      nl: 'Import/Export' } },
    { id: 'tech_innovation', icon: '🤖', name: { en: 'Tech & Innovation',  nl: 'Innovatie' } },
];

function iqGetBadgeLevel(correct) {
    let level = 0;
    for (const l of IQ_BADGE_LEVELS) {
        if (correct >= l.threshold) level = l.level;
    }
    return level;
}

function iqGetBadgeForLevel(level) {
    return IQ_BADGE_LEVELS.find(l => l.level === level) || null;
}

function iqRenderBadges() {
    const code = iqGetUserCode();
    const container = document.getElementById('iq-badges-grid');
    if (!container) return;
    const statsRaw = localStorage.getItem('iq_stats_' + code);
    const stats = statsRaw ? JSON.parse(statsRaw) : {};
    const catCorrect = stats.categoryCorrect || {};

    container.innerHTML = IQ_CATEGORIES.map(cat => {
        const correct = catCorrect[cat.id] || 0;
        const level = iqGetBadgeLevel(correct);
        const badge = iqGetBadgeForLevel(level);
        const nextLevel = IQ_BADGE_LEVELS.find(l => l.threshold > correct);
        const progress = nextLevel ? Math.round((correct / nextLevel.threshold) * 100) : 100;
        const isLocked = level === 0;
        const catName = cat.name[iqLang] || cat.name.en;
        const levelName = badge ? badge.name[iqLang] : (iqLang === 'nl' ? 'Vergrendeld' : 'Locked');

        return `<div onclick="iqShowBadgeDetail('${cat.id}')" style="display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;">
            <div style="width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;
                background:${badge ? badge.bg : 'rgba(255,255,255,0.04)'};
                border:1px solid ${badge ? badge.border : 'rgba(255,255,255,0.08)'};
                ${level === 4 ? 'box-shadow:0 0 10px rgba(255,100,200,0.2);' : ''}
                opacity:${isLocked ? '0.4' : '1'};">
                ${isLocked ? cat.icon : (badge ? badge.icon : cat.icon)}
            </div>
            <div style="font-size:7px;font-weight:800;color:${badge ? badge.color : 'rgba(255,255,255,0.2)'};">${isLocked ? (iqLang === 'nl' ? 'Vergrendeld' : 'Locked') : levelName + ' L' + level}</div>
            <div style="font-size:7px;color:rgba(255,255,255,0.3);text-align:center;">${catName}</div>
            <div style="width:40px;height:2px;background:rgba(255,255,255,0.06);border-radius:100px;overflow:hidden;margin-top:1px;">
                <div style="height:100%;width:${progress}%;background:${badge ? badge.color : 'rgba(255,255,255,0.2)'};border-radius:100px;"></div>
            </div>
        </div>`;
    }).join('');
}

function iqShowBadgeDetail(catId) {
    const cat = IQ_CATEGORIES.find(c => c.id === catId);
    if (!cat) return;
    const code = iqGetUserCode();
    const statsRaw = localStorage.getItem('iq_stats_' + code);
    const stats = statsRaw ? JSON.parse(statsRaw) : {};
    const correct = (stats.categoryCorrect || {})[catId] || 0;
    const currentLevel = iqGetBadgeLevel(correct);
    const catName = cat.name[iqLang] || cat.name.en;

    const overlay = document.getElementById('iq-badge-overlay');
    const sheet = document.getElementById('iq-badge-sheet');
    if (!overlay || !sheet) return;

    sheet.innerHTML = `
        <div style="width:36px;height:4px;background:rgba(255,255,255,0.15);border-radius:100px;margin:0 auto 16px;"></div>
        <div style="text-align:center;margin-bottom:16px;">
            <div style="font-size:32px;margin-bottom:6px;">${cat.icon}</div>
            <div style="font-size:15px;font-weight:900;color:#fff;margin-bottom:2px;">${catName}</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.4);">${correct} ${iqLang === 'nl' ? 'correct beantwoord' : 'correct answers'}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;">
            ${IQ_BADGE_LEVELS.map(l => {
                const unlocked = correct >= l.threshold;
                const isCurrent = currentLevel === l.level;
                const progress = isCurrent ? Math.round((correct / l.threshold) * 100) : (unlocked ? 100 : Math.round((correct / l.threshold) * 100));
                return `<div style="display:flex;align-items:center;gap:10px;padding:10px;
                    background:${isCurrent ? l.bg : 'rgba(255,255,255,0.03)'};
                    border:1px solid ${isCurrent ? l.border : 'rgba(255,255,255,0.07)'};
                    border-radius:10px;opacity:${!unlocked && !isCurrent ? '0.5' : '1'};">
                    <div style="font-size:18px;">${l.icon}</div>
                    <div style="flex:1;">
                        <div style="font-size:11px;font-weight:700;color:#fff;">${l.name[iqLang] || l.name.en} · Level ${l.level}</div>
                        <div style="font-size:9px;color:rgba(255,255,255,0.35);margin-top:2px;">${l.threshold} ${iqLang === 'nl' ? 'correct' : 'correct'} · ${unlocked ? (iqLang === 'nl' ? 'Ontgrendeld' : 'Unlocked') : (isCurrent ? `${correct}/${l.threshold}` : iqLang === 'nl' ? 'Vergrendeld' : 'Locked')}</div>
                        ${isCurrent ? `<div style="height:2px;background:rgba(255,255,255,0.06);border-radius:100px;overflow:hidden;margin-top:4px;"><div style="height:100%;width:${progress}%;background:${l.color};border-radius:100px;"></div></div>` : ''}
                    </div>
                    <div style="font-size:12px;color:${unlocked ? '#a6e22e' : 'rgba(255,255,255,0.2)'};">${unlocked ? (isCurrent ? '★' : '✓') : '🔒'}</div>
                </div>`;
            }).join('')}
        </div>`;

    overlay.classList.add('iq-overlay-show');
}

function iqHideBadgeDetail() {
    const overlay = document.getElementById('iq-badge-overlay');
    if (overlay) overlay.classList.remove('iq-overlay-show');
}

// ── START QUIZ ────────────────────────────────────────────────────────────
async function iqStartQuiz() {
    iqQuestions = [];
    iqCurrentIndex = 0;
    iqScore = 0;
    iqStreak = 0;
    iqCorrectCount = 0;
    iqWrongCount = 0;
    iqCategoryStats = {};
    iqAskedTopics = [];
    iqSessionActive = true;
    iqShowScreen('iq-s-quiz');
    iqUpdateScoreHdr();
    await iqLoadNextBatch();
}

async function iqLoadNextBatch() {
    const loadingEl = document.getElementById('iq-loading');
    if (loadingEl) loadingEl.style.display = 'flex';
    try {
        const res = await fetch(IQ_WORKER + '/iq-questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lang: iqLang, count: 5, askedTopics: iqAskedTopics })
        });
        const data = await res.json();
        if (data.error === 'limit_reached') {
            iqShowLimitScreen();
            return;
        }
        if (data.questions && data.questions.length > 0) {
            iqQuestions = [...iqQuestions, ...data.questions];
            // Track which categories were used so next batch avoids them
            if (data.usedCategoryIds) {
                iqAskedTopics = [...new Set([...iqAskedTopics, ...data.usedCategoryIds])];
                // Reset after 20 topics so we can cycle back through
                if (iqAskedTopics.length > 20) iqAskedTopics = iqAskedTopics.slice(-10);
            }
        }
    } catch(e) {
        console.error('IQ load error:', e);
    }
    if (loadingEl) loadingEl.style.display = 'none';
    if (iqQuestions.length === 0) {
        iqShowLimitScreen();
        return;
    }
    iqRenderQuestion();
}

function iqRenderQuestion() {
    if (iqCurrentIndex >= iqQuestions.length) {
        iqLoadNextBatch();
        return;
    }
    const q = iqQuestions[iqCurrentIndex];
    iqAnswered = false;
    document.getElementById('iq-q-num').textContent = iqLang === 'nl' ? `Vraag ${iqCurrentIndex + 1}` : `Question ${iqCurrentIndex + 1}`;
    document.getElementById('iq-q-cat').textContent = q.category_icon + ' ' + q.category;
    document.getElementById('iq-q-text').textContent = q.question;
    ['a','b','c','d'].forEach(o => {
        const el = document.getElementById('iq-opt-' + o);
        const textEl = document.getElementById('iq-ot-' + o);
        if (el && textEl) {
            el.classList.remove('iq-correct','iq-wrong','iq-dim');
            el.onclick = () => iqAnswer(o);
            el.style.pointerEvents = 'auto';
            textEl.textContent = q['option_' + o];
        }
    });
    document.getElementById('iq-expblock').style.display = 'none';
    document.getElementById('iq-streak-bar').style.display = 'none';
    document.getElementById('iq-qscroll').scrollTop = 0;
    iqStartTimer();
    const pgPct = Math.min(((iqCurrentIndex % 10) + 1) * 10, 100);
    document.getElementById('iq-pgfill').style.width = pgPct + '%';
}

// ── TIMER ─────────────────────────────────────────────────────────────────
function iqStartTimer() {
    clearInterval(iqTimerInt);
    iqTimeLeft = 45;
    iqUpdateTimer();
    iqTimerInt = setInterval(() => {
        iqTimeLeft--;
        iqUpdateTimer();
        if (iqTimeLeft <= 0) {
            clearInterval(iqTimerInt);
            iqAnswer('timeout');
        }
    }, 1000);
}

function iqUpdateTimer() {
    const el = document.getElementById('iq-timer-text');
    const circle = document.getElementById('iq-timer-circle');
    if (el) el.textContent = iqTimeLeft;
    if (circle) {
        const offset = ((45 - iqTimeLeft) / 45) * 107;
        circle.style.strokeDashoffset = offset;
        circle.style.stroke = iqTimeLeft <= 10 ? '#ff5050' : iqTimeLeft <= 20 ? '#ff8c00' : '#ffa500';
    }
}

// ── ANSWER ────────────────────────────────────────────────────────────────
function iqAnswer(choice) {
    if (iqAnswered) return;
    iqAnswered = true;
    clearInterval(iqTimerInt);
    const q = iqQuestions[iqCurrentIndex];
    const correct = q.correct_option;
    const isCorrect = choice === correct;

    ['a','b','c','d'].forEach(o => {
        const el = document.getElementById('iq-opt-' + o);
        if (!el) return;
        if (o === correct) el.classList.add('iq-correct');
        else if (o === choice && !isCorrect) el.classList.add('iq-wrong');
        else el.classList.add('iq-dim');
        el.onclick = null;
        el.style.pointerEvents = 'none';
    });

    // Track category stats
    const catId = q.category_id || 'general';
    if (!iqCategoryStats[catId]) iqCategoryStats[catId] = { correct: 0, wrong: 0 };

    if (isCorrect) {
        iqStreak++;
        iqCorrectCount++;
        iqCategoryStats[catId].correct++;
        const pts = iqStreak >= 3 ? 100 : 50;
        iqScore += pts;
        if (iqStreak >= 3) {
            document.getElementById('iq-streak-bar').style.display = 'flex';
            document.getElementById('iq-streak-txt').textContent = iqLang === 'nl'
                ? `${iqStreak} op rij! 2x punten actief`
                : `${iqStreak} in a row! 2x points active`;
        }
        // Points animation
        const pop = document.createElement('div');
        pop.style.cssText = 'position:absolute;right:10px;top:50%;font-size:14px;font-weight:900;color:#a6e22e;pointer-events:none;animation:iqFloatUp 1s forwards;z-index:10;';
        pop.textContent = '+' + pts + (iqStreak >= 3 ? '🔥' : '');
        const optEl = document.getElementById('iq-opt-' + choice);
        if (optEl) { optEl.style.position = 'relative'; optEl.appendChild(pop); setTimeout(() => pop.remove(), 1000); }
    } else {
        iqStreak = 0;
        iqWrongCount++;
        iqCategoryStats[catId].wrong++;
        document.getElementById('iq-streak-bar').style.display = 'none';
    }

    iqUpdateScoreHdr();

    // Show explanation
    const exp = document.getElementById('iq-expblock');
    document.getElementById('iq-why-correct-text').textContent = q.explanation_correct;
    document.getElementById('iq-why-wrong-text').textContent = q.explanation_wrong;
    document.getElementById('iq-floor-text').textContent = q.real_world;
    document.getElementById('iq-know-text').textContent = q.did_you_know;

    // Labels
    document.getElementById('iq-wc-lbl').textContent = iqLang === 'nl' ? 'Waarom dit correct is' : 'Why this is correct';
    document.getElementById('iq-ww-lbl').textContent = iqLang === 'nl' ? 'Waarom de andere antwoorden fout zijn' : 'Why the others are wrong';
    document.getElementById('iq-floor-lbl').textContent = iqLang === 'nl' ? 'Op de vloer' : 'On the fruit floor';
    document.getElementById('iq-know-lbl').textContent = iqLang === 'nl' ? 'Wist je dat?' : 'Did you know?';
    document.getElementById('iq-nextbtn').textContent = iqLang === 'nl' ? 'Volgende vraag →' : 'Next question →';

    exp.style.display = 'block';

    // Gentle scroll to explanation — 600ms delay, ease-in-out
    setTimeout(() => {
        const expEl = document.getElementById('iq-exp-top');
        const scroll = document.getElementById('iq-qscroll');
        if (!expEl || !scroll) return;
        const targetY = expEl.offsetTop - 12;
        const startY = scroll.scrollTop;
        const distance = targetY - startY;
        const duration = 700;
        let start = null;
        function ease(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
        function step(ts) {
            if (!start) start = ts;
            const elapsed = ts - start;
            const progress = Math.min(elapsed / duration, 1);
            scroll.scrollTop = startY + distance * ease(progress);
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }, 600);

    iqCurrentIndex++;
}

function iqNextQuestion() {
    iqRenderQuestion();
}

function iqUpdateScoreHdr() {
    const el = document.getElementById('iq-score-hdr');
    if (el) el.textContent = (iqLang === 'nl' ? 'Score: ' : 'Score: ') + iqScore + ' pts';
}

// ── RESULTS ───────────────────────────────────────────────────────────────
function iqShowResults() {
    const total = iqCorrectCount + iqWrongCount;
    const acc = total > 0 ? Math.round((iqCorrectCount / total) * 100) : 0;

    document.getElementById('iq-res-pts').textContent = '+' + iqScore + ' pts';
    document.getElementById('iq-res-summary').textContent = `${iqCorrectCount} ${iqLang === 'nl' ? 'goed' : 'correct'} · ${iqWrongCount} ${iqLang === 'nl' ? 'fout' : 'wrong'} · ${iqStreak}🔥`;
    document.getElementById('iq-res-acc').textContent = acc + '%';

    // Best/worst category
    let best = null, worst = null, bestScore = -1, worstScore = 999;
    Object.entries(iqCategoryStats).forEach(([id, s]) => {
        const pct = s.correct / (s.correct + s.wrong);
        if (pct > bestScore) { bestScore = pct; best = id; }
        if (pct < worstScore) { worstScore = pct; worst = id; }
    });
    const findCat = id => IQ_CATEGORIES.find(c => c.id === id);
    const bestCat = best ? findCat(best) : null;
    const worstCat = worst ? findCat(worst) : null;
    document.getElementById('iq-res-best').textContent = bestCat ? bestCat.icon + ' ' + (bestCat.name[iqLang] || bestCat.name.en) : '—';
    document.getElementById('iq-res-worst').textContent = worstCat ? worstCat.icon + ' ' + (worstCat.name[iqLang] || worstCat.name.en) : '—';

    // Save and submit score
    iqSaveLocalStats();
    iqSubmitScore(iqScore, acc);

    document.getElementById('iq-res-play-btn').textContent = iqLang === 'nl' ? 'Meer vragen →' : 'More questions →';
    document.getElementById('iq-res-lb-btn').textContent = iqLang === 'nl' ? 'Scorebord →' : 'Leaderboard →';
    iqShowScreen('iq-s-results');
}

function iqSaveLocalStats() {
    const code = iqGetUserCode();
    if (!code) return;
    const key = 'iq_stats_' + code;
    let stats = {};
    try { stats = JSON.parse(localStorage.getItem(key) || '{}'); } catch(e) {}
    stats.weeklyScore = (stats.weeklyScore || 0) + iqScore;
    stats.streak = iqStreak;
    stats.totalAnswered = (stats.totalAnswered || 0) + iqCorrectCount + iqWrongCount;
    stats.totalCorrect = (stats.totalCorrect || 0) + iqCorrectCount;

    // Update category correct counts for badges
    if (!stats.categoryCorrect) stats.categoryCorrect = {};
    Object.entries(iqCategoryStats).forEach(([id, s]) => {
        stats.categoryCorrect[id] = (stats.categoryCorrect[id] || 0) + s.correct;
    });

    const total = (stats.totalAnswered || 0);
    stats.accuracy = total > 0 ? Math.round((stats.totalCorrect / total) * 100) : 0;
    localStorage.setItem(key, JSON.stringify(stats));
}

async function iqSubmitScore(score, accuracy) {
    const code = iqGetUserCode();
    if (!code) return;
    const name = iqGetDisplayName(code);
    if (!name) return; // TEST codes excluded
    try {
        await fetch(IQ_WORKER + '/iq-submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userCode: code, displayName: name, score, accuracy, streak: iqStreak, categoryStats: iqCategoryStats })
        });
    } catch(e) {}
}

// ── LIMIT SCREEN ──────────────────────────────────────────────────────────
function iqShowLimitScreen() {
    document.getElementById('iq-lim-title').textContent = iqLang === 'nl' ? 'Dat was het voor vandaag' : "That's it for today";
    document.getElementById('iq-lim-body').textContent = iqLang === 'nl'
        ? 'Floor IQ draait op een gedeelde dagelijkse pool van AI-vragen voor alle gebruikers. De vragen van vandaag zijn collectief opgebruikt — kom morgen terug voor een nieuwe set. Reset om middernacht UTC.'
        : "Floor IQ runs on a shared daily pool of AI questions across all users. Today's questions have been collectively used up — come back tomorrow for a fresh set. Resets at midnight UTC.";
    document.getElementById('iq-lim-score-lbl').textContent = iqLang === 'nl' ? 'Jouw score vandaag' : 'Your score today';
    document.getElementById('iq-lim-pts').textContent = '+' + iqScore + ' pts';
    document.getElementById('iq-lim-correct').textContent = iqCorrectCount + ' ' + (iqLang === 'nl' ? 'goed' : 'correct') + ' · ' + iqWrongCount + ' ' + (iqLang === 'nl' ? 'fout' : 'wrong');
    document.getElementById('iq-lim-lb-btn').textContent = iqLang === 'nl' ? 'Bekijk scorebord →' : 'View leaderboard →';
    iqSaveLocalStats();
    iqSubmitScore(iqScore, iqCorrectCount + iqWrongCount > 0 ? Math.round(iqCorrectCount / (iqCorrectCount + iqWrongCount) * 100) : 0);
    iqShowScreen('iq-s-limit');
}

// ── LEADERBOARD ───────────────────────────────────────────────────────────
async function iqLoadLeaderboard() {
    const container = document.getElementById('iq-lb-rows');
    const podium = document.getElementById('iq-lb-podium');
    const refreshLbl = document.getElementById('iq-refresh-lbl');
    const refreshIcon = document.getElementById('iq-refresh-icon');
    if (refreshIcon) { refreshIcon.style.animation = 'iqSpin 1s linear infinite'; }
    if (refreshLbl) refreshLbl.textContent = iqLang === 'nl' ? 'Bezig...' : 'Updating...';

    try {
        const res = await fetch(IQ_WORKER + '/iq-leaderboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        const data = await res.json();
        const entries = (data.entries || []).filter(e => {
            const c = (e.userCode || '').toUpperCase();
            return !c.startsWith('TEST');
        });

        const myCode = iqGetUserCode();

        // Podium top 3
        if (podium) {
            const top3 = entries.slice(0, 3);
            const order = [1, 0, 2]; // silver, gold, bronze display order
            const medals = ['🥈', '🥇', '🥉'];
            const heights = ['36px', '42px', '32px'];
            const barH = ['36px', '50px', '24px'];
            const colors = ['#8899ff', '#ffa500', '#a6e22e'];
            podium.innerHTML = order.map((idx, i) => {
                const e = top3[idx];
                if (!e) return '<div></div>';
                const initials = (e.displayName || '?').slice(0, 2).toUpperCase();
                return `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
                    <div style="font-size:14px;">${medals[i]}</div>
                    <div style="width:${heights[i]};height:${heights[i]};border-radius:50%;background:${colors[i]};display:flex;align-items:center;justify-content:center;font-size:${idx===0?'14px':'11px'};font-weight:800;color:#000;">${initials}</div>
                    <div style="font-size:8px;font-weight:${e.userCode===myCode?'800':'700'};color:${e.userCode===myCode?'#fff':'rgba(255,255,255,0.55)'};">${e.displayName}</div>
                    <div style="font-size:9px;font-weight:900;color:#ffa500;">${(e.weeklyScore||0).toLocaleString()}</div>
                    <div style="width:46px;height:${barH[i]};background:${colors[i]}22;border-radius:4px 4px 0 0;margin-top:3px;"></div>
                </div>`;
            }).join('');
        }

        // Full list
        if (container) {
            container.innerHTML = entries.map((e, i) => {
                const isMe = e.userCode === myCode;
                const initials = (e.displayName || '?').slice(0, 2).toUpperCase();
                const badgeIcons = iqGetTopBadgeIcons(e.categoryCorrect || {});
                return `<div onclick="iqShowProfile('${e.userCode}')" style="display:flex;align-items:center;gap:8px;padding:9px 11px;
                    background:${isMe ? 'rgba(255,165,0,0.04)' : 'rgba(255,255,255,0.03)'};
                    border:1px solid ${isMe ? 'rgba(255,165,0,0.2)' : 'rgba(255,255,255,0.06)'};
                    border-radius:10px;cursor:pointer;margin-bottom:5px;">
                    <div style="font-size:10px;font-weight:900;color:${isMe ? '#ffa500' : 'rgba(255,255,255,0.25)'};width:14px;text-align:center;">${i+1}</div>
                    <div style="width:28px;height:28px;border-radius:50%;background:${isMe ? 'rgba(255,165,0,0.18)' : 'rgba(255,255,255,0.07)'};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:${isMe ? '#ffa500' : 'rgba(255,255,255,0.4)'};">${initials}</div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:11px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                            ${e.displayName}${isMe ? ` <span style="font-size:7px;font-weight:700;padding:1px 5px;border-radius:100px;background:rgba(255,165,0,0.12);color:#ffa500;border:1px solid rgba(255,165,0,0.2);">${iqLang==='nl'?'Jij':'You'}</span>` : ''}
                        </div>
                        <div style="font-size:9px;color:rgba(255,255,255,0.3);">${(e.weeklyScore||0).toLocaleString()} pts · ${e.accuracy||0}% · ${e.streak||0}🔥</div>
                    </div>
                    <div style="display:flex;gap:2px;font-size:10px;">${badgeIcons}</div>
                </div>`;
            }).join('') || `<div style="text-align:center;padding:30px;font-size:12px;color:rgba(255,255,255,0.25);">${iqLang==='nl'?'Nog geen spelers':'No players yet'}</div>`;
        }
    } catch(e) {
        if (container) container.innerHTML = `<div style="text-align:center;padding:20px;font-size:12px;color:rgba(255,77,77,0.5);">${iqLang==='nl'?'Kan scorebord niet laden':'Could not load leaderboard'}</div>`;
    }

    if (refreshIcon) refreshIcon.style.animation = '';
    if (refreshLbl) refreshLbl.textContent = iqLang === 'nl' ? 'Bijgewerkt' : 'Updated';
    setTimeout(() => { if (refreshLbl) refreshLbl.textContent = iqLang === 'nl' ? 'Vernieuwen' : 'Refresh'; }, 2000);
}

function iqGetTopBadgeIcons(catCorrect) {
    return IQ_CATEGORIES
        .map(cat => {
            const correct = catCorrect[cat.id] || 0;
            const level = iqGetBadgeLevel(correct);
            if (level === 0) return null;
            const badge = iqGetBadgeForLevel(level);
            return badge ? badge.icon : null;
        })
        .filter(Boolean)
        .slice(0, 3)
        .join('');
}

// ── PROFILE CARD ──────────────────────────────────────────────────────────
async function iqShowProfile(userCode) {
    const overlay = document.getElementById('iq-profile-overlay');
    const sheet = document.getElementById('iq-profile-sheet');
    if (!overlay || !sheet) return;

    sheet.innerHTML = `<div style="text-align:center;padding:20px;color:rgba(255,255,255,0.3);font-size:12px;">${iqLang === 'nl' ? 'Laden...' : 'Loading...'}</div>`;
    overlay.classList.add('iq-overlay-show');

    try {
        const res = await fetch(IQ_WORKER + '/iq-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userCode })
        });
        const data = await res.json();
        const e = data.profile || {};
        const initials = (e.displayName || '?').slice(0, 2).toUpperCase();
        const myCode = iqGetUserCode();
        const isMe = userCode === myCode;

        sheet.innerHTML = `
            <div style="width:36px;height:4px;background:rgba(255,255,255,0.15);border-radius:100px;margin:0 auto 16px;"></div>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
                <div style="width:46px;height:46px;border-radius:50%;background:#ffa500;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#000;">${initials}</div>
                <div>
                    <div style="font-size:15px;font-weight:900;color:#fff;">${e.displayName || '—'}${isMe ? ' 👑' : ''}</div>
                    <div style="font-size:10px;color:rgba(255,165,0,0.6);">#${e.weeklyRank || '—'} ${iqLang === 'nl' ? 'deze week' : 'this week'}</div>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:14px;">
                <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:8px;text-align:center;">
                    <div style="font-size:13px;font-weight:900;color:#ffa500;">${(e.weeklyScore||0).toLocaleString()}</div>
                    <div style="font-size:7px;color:rgba(255,255,255,0.25);text-transform:uppercase;">${iqLang==='nl'?'Punten':'Points'}</div>
                </div>
                <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:8px;text-align:center;">
                    <div style="font-size:13px;font-weight:900;color:#ffa500;">${e.accuracy||0}%</div>
                    <div style="font-size:7px;color:rgba(255,255,255,0.25);text-transform:uppercase;">${iqLang==='nl'?'Nauwkeurig':'Accuracy'}</div>
                </div>
                <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:8px;text-align:center;">
                    <div style="font-size:13px;font-weight:900;color:#ffa500;">${e.streak||0}🔥</div>
                    <div style="font-size:7px;color:rgba(255,255,255,0.25);text-transform:uppercase;">${iqLang==='nl'?'Reeks':'Streak'}</div>
                </div>
            </div>
            <div style="font-size:8px;font-weight:700;color:rgba(255,255,255,0.2);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">${iqLang==='nl'?'Badges':'Badges'}</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                ${IQ_CATEGORIES.map(cat => {
                    const correct = (e.categoryCorrect||{})[cat.id] || 0;
                    const level = iqGetBadgeLevel(correct);
                    if (level === 0) return '';
                    const badge = iqGetBadgeForLevel(level);
                    return `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
                        <div style="width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;background:${badge.bg};border:1px solid ${badge.border};">${badge.icon}</div>
                        <div style="font-size:7px;color:${badge.color};font-weight:700;">L${level}</div>
                        <div style="font-size:7px;color:rgba(255,255,255,0.3);">${cat.icon}</div>
                    </div>`;
                }).join('')}
            </div>`;
    } catch(e) {
        sheet.innerHTML = `<div style="text-align:center;padding:20px;font-size:12px;color:rgba(255,77,77,0.5);">${iqLang==='nl'?'Kan profiel niet laden':'Could not load profile'}</div>`;
    }
}

function iqHideProfile(e) {
    if (e.target === document.getElementById('iq-profile-overlay')) {
        document.getElementById('iq-profile-overlay').classList.remove('iq-overlay-show');
    }
}

// ── HALL OF FAME ──────────────────────────────────────────────────────────
async function iqLoadHallOfFame() {
    const container = document.getElementById('iq-hof-list');
    if (!container) return;
    container.innerHTML = `<div style="text-align:center;padding:20px;font-size:12px;color:rgba(255,255,255,0.3);">${iqLang==='nl'?'Laden...':'Loading...'}</div>`;
    try {
        const res = await fetch(IQ_WORKER + '/iq-halloffame', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        const data = await res.json();
        const entries = data.entries || [];
        if (entries.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:30px;font-size:12px;color:rgba(255,255,255,0.25);">${iqLang==='nl'?'Nog geen winnaars':'No champions yet'}</div>`;
            return;
        }
        container.innerHTML = entries.map((e, i) => {
            const initials = (e.displayName || '?').slice(0, 2).toUpperCase();
            const bg = i === 0 ? 'rgba(255,165,0,0.06)' : 'rgba(255,255,255,0.03)';
            const border = i === 0 ? 'rgba(255,165,0,0.2)' : 'rgba(255,255,255,0.07)';
            const avatarBg = ['#ffa500','#8899ff','#a6e22e'][i] || 'rgba(255,255,255,0.2)';
            return `<div style="background:${bg};border:1px solid ${border};border-radius:14px;padding:14px;margin-bottom:8px;">
                <div style="font-size:8px;font-weight:700;color:rgba(255,255,255,0.2);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">${e.weekLabel}</div>
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:40px;height:40px;border-radius:50%;background:${avatarBg};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#000;">${initials}</div>
                    <div style="flex:1;">
                        <div style="font-size:13px;font-weight:900;color:#fff;">${e.displayName} 👑</div>
                        <div style="font-size:10px;color:rgba(255,165,0,0.6);">${(e.score||0).toLocaleString()} pts · ${e.accuracy||0}% acc</div>
                    </div>
                    <div style="font-size:20px;">🥇</div>
                </div>
            </div>`;
        }).join('');
    } catch(err) {
        container.innerHTML = `<div style="text-align:center;padding:20px;font-size:12px;color:rgba(255,77,77,0.5);">${iqLang==='nl'?'Kan hall of fame niet laden':'Could not load hall of fame'}</div>`;
    }
}

// ── TILE PREVIEW ──────────────────────────────────────────────────────────
function iqUpdateTilePreview() {
    const code = iqGetUserCode();
    if (!code) return;
    const statsRaw = localStorage.getItem('iq_stats_' + code);
    if (!statsRaw) return;
    try {
        const stats = JSON.parse(statsRaw);
        const streakEl = document.getElementById('iq-tile-streak');
        const accEl = document.getElementById('iq-tile-acc');
        const rankEl = document.getElementById('iq-tile-rank');
        if (streakEl) streakEl.textContent = (stats.streak || 0) + (stats.streak >= 3 ? '🔥' : '');
        if (accEl) accEl.textContent = (stats.accuracy || 0) + '%';
        if (rankEl) rankEl.textContent = '#' + (stats.weeklyRank || '—');
    } catch(e) {}
}

// ── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    iqUpdateTilePreview();
});
