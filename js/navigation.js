// Navigation Module - simplified for two-tool app

const ACCESS_WORKER = 'https://pulppro-access.pulpprobrain.workers.dev';
const ADMIN_PASSWORD = 'BananaBoss1.';
let isAdminLoggedIn = false;

// ── ACCESS GATE ───────────────────────────────────────────────
function checkAccess() {
    const code = localStorage.getItem('pulpProAccessCode');
    const isAdmin = localStorage.getItem('pulpProAdmin') === 'true';
    if (isAdmin || code) {
        if (isAdmin) {
            isAdminLoggedIn = true;
            renderAdminMenu();
        }
        showApp();
    } else {
        showGate();
    }
}

function showGate() {
    document.getElementById('access-gate').classList.remove('hidden');
    document.getElementById('app-wrapper').classList.add('hidden');
}

function showApp() {
    document.getElementById('access-gate').classList.add('hidden');
    document.getElementById('app-wrapper').classList.remove('hidden');
}

async function submitCode() {
    const code = document.getElementById('gateCodeInput').value.trim().toUpperCase();
    const btn = document.getElementById('gateUnlockBtn');
    const err = document.getElementById('gateError');
    if (!code) return;
    btn.innerText = 'Checking...';
    btn.disabled = true;
    err.style.display = 'none';
    try {
        const res = await fetch(ACCESS_WORKER + '/validate-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        const data = await res.json();
        if (data.valid) {
            localStorage.setItem('pulpProAccessCode', code);
            localStorage.setItem('pulpProUserName', data.name);
            showApp();
        } else {
            err.innerText = 'Invalid code. Please check and try again.';
            err.style.display = 'block';
            btn.innerText = 'Unlock App';
            btn.disabled = false;
        }
    } catch (e) {
        err.innerText = 'Connection error. Please try again.';
        err.style.display = 'block';
        btn.innerText = 'Unlock App';
        btn.disabled = false;
    }
}

function requestCode() {
    const subject = encodeURIComponent('Pulp Pro — Access Code Request');
    const body = encodeURIComponent(`Hi,\n\nI would like to request access to the Pulp Pro Intelligence app.\n\nName: [Your name]\nRole: [Your role]\nDevice: iPhone / Android\n\nPlease send me an access code.\n\nThanks`);
    window.location.href = `mailto:ar.varma@hotmail.com?subject=${subject}&body=${body}`;
}

// ── DEVELOPER LOGIN ───────────────────────────────────────────
function showDevLogin() {
    document.getElementById('dev-login-modal').classList.remove('hidden');
    document.getElementById('devUsername').focus();
}

function hideDevLogin() {
    document.getElementById('dev-login-modal').classList.add('hidden');
    document.getElementById('devUsername').value = '';
    document.getElementById('devPassword').value = '';
    document.getElementById('devLoginError').style.display = 'none';
}

async function submitDevLogin() {
    const username = document.getElementById('devUsername').value.trim();
    const password = document.getElementById('devPassword').value;
    const btn = document.getElementById('devLoginBtn');
    const err = document.getElementById('devLoginError');
    btn.innerText = 'Logging in...';
    btn.disabled = true;
    err.style.display = 'none';
    try {
        const res = await fetch(ACCESS_WORKER + '/admin-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
            isAdminLoggedIn = true;
            localStorage.setItem('pulpProAdmin', 'true');
            hideDevLogin();
            showApp();
            renderAdminMenu();
        } else {
            err.innerText = 'Invalid credentials.';
            err.style.display = 'block';
            btn.innerText = 'Login';
            btn.disabled = false;
        }
    } catch (e) {
        err.innerText = 'Connection error.';
        err.style.display = 'block';
        btn.innerText = 'Login';
        btn.disabled = false;
    }
}

function adminLogout() {
    isAdminLoggedIn = false;
    localStorage.removeItem('pulpProAdmin');
    renderAdminMenu();
    toggleMenu();
}

function renderAdminMenu() {
    const adminSection = document.getElementById('admin-menu-section');
    const devLoginBtn = document.getElementById('dev-login-btn');
    if (isAdminLoggedIn) {
        if (adminSection) adminSection.classList.remove('hidden');
        if (devLoginBtn) devLoginBtn.classList.add('hidden');
    } else {
        if (adminSection) adminSection.classList.add('hidden');
        if (devLoginBtn) devLoginBtn.classList.remove('hidden');
    }
}

// ── CODE GENERATION ───────────────────────────────────────────
function toggleCodeGenerator() {
    const panel = document.getElementById('code-gen-panel');
    panel.classList.toggle('hidden');
}

async function generateCode() {
    const name = document.getElementById('codePersonName').value.trim();
    if (!name) {
        alert('Please enter a name first.');
        return;
    }
    const btn = document.getElementById('generateCodeBtn');
    btn.innerText = 'Generating...';
    btn.disabled = true;
    try {
        const res = await fetch(ACCESS_WORKER + '/generate-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, adminPassword: ADMIN_PASSWORD })
        });
        const data = await res.json();
        document.getElementById('generatedCode').innerText = data.code;
        document.getElementById('generatedCodeFor').innerText = 'For: ' + name;
        document.getElementById('generated-code-display').classList.remove('hidden');
    } catch (e) {
        alert('Error generating code.');
    }
    btn.innerText = 'Generate';
    btn.disabled = false;
}

function copyGeneratedCode() {
    const code = document.getElementById('generatedCode').innerText;
    const name = document.getElementById('codePersonName').value.trim();
    const appUrl = 'https://pulp-pro-intelligence.pulpprobrain.workers.dev';

    const text = `Your Pulp Pro Access Code:
${code}

━━━━━━━━━━━━━━━━━━━━━━━━━━━

HOW TO INSTALL THE APP

iPhone (iOS):
1. Open Safari and go to ${appUrl}
2. Tap the Share button (box with arrow) at the bottom
3. Tap "Add to Home Screen"
4. Tap Add — the app icon appears on your home screen

Android:
1. Open Chrome and go to ${appUrl}
2. Tap the three dots menu (top right)
3. Tap "Add to Home Screen"
4. Tap Add — the app icon appears on your home screen

━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT — Browser & App Cache:
The app saves data locally on your device so it works offline. If you ever clear your browser history or website data, you will need to re-enter your access code. To avoid this, always open the app from the home screen icon, not from the browser address bar.

━━━━━━━━━━━━━━━━━━━━━━━━━━━

Need help? Reply to this email.

Pulp Pro Intelligence
${appUrl}`;

    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyCodeBtn');
        btn.innerText = '✓ Copied!';
        setTimeout(() => btn.innerText = 'Copy Code + Instructions', 2000);
    });
}

// ── NAVIGATION ────────────────────────────────────────────────
function showHub() {
    document.getElementById('fruit-hub').classList.remove('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    document.getElementById('colour-scanner-view').classList.add('hidden');
}

function openAgeChecker() {
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.remove('hidden');
    document.getElementById('colour-scanner-view').classList.add('hidden');
    setTimeout(() => document.getElementById('codeIn').focus(), 100);
}

function openColourScanner() {
    document.getElementById('fruit-hub').classList.add('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    document.getElementById('colour-scanner-view').classList.remove('hidden');
    if (typeof ColourScanner !== 'undefined') {
        ColourScanner.init();
        ColourScanner.setScanMode('single');
    }
}

function toggleMenu() {
    document.getElementById('menu-drawer').classList.toggle('open');
    document.getElementById('menu-overlay').classList.toggle('open');
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('pulpTheme', isLight ? 'light' : 'dark');
    document.getElementById('themeText').innerText = isLight ? 'Light Mode' : 'Dark Mode';
}

function loadTheme() {
    const savedTheme = localStorage.getItem('pulpTheme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        const el = document.getElementById('themeText');
        if (el) el.innerText = 'Light Mode';
    }
}

function openAbout() {
    window.open('pulp-pro-intro.html', '_blank');
}
