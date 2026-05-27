// Navigation Module - simplified for two-tool app

const ACCESS_WORKER = 'https://pulppro-access.pulpprobrain.workers.dev';
const ADMIN_PASSWORD = 'BananaBoss1.';
let isAdminLoggedIn = false;

// ── ACCESS GATE ───────────────────────────────────────────────
async function checkAccess() {
    // Read ALL params before anything cleans them
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    const adminParam = params.get('admin');
    const openParam = params.get('open');
    const reminderIdParam = params.get('reminderId') || null;

    // Restore session from notification tap URL params
    if (adminParam === 'true' && !localStorage.getItem('pulpProAdmin') && !localStorage.getItem('pulpProAccessCode')) {
        localStorage.setItem('pulpProAdmin', 'true');
    } else if (codeParam && !localStorage.getItem('pulpProAccessCode') && !localStorage.getItem('pulpProAdmin')) {
        localStorage.setItem('pulpProAccessCode', codeParam.toUpperCase());
    }

    // Clean URL params now
    if (adminParam || codeParam || openParam) {
        window.history.replaceState({}, '', window.location.pathname);
    }

    const code = localStorage.getItem('pulpProAccessCode');
    const isAdmin = localStorage.getItem('pulpProAdmin') === 'true';

    function maybeShowSheet() {
        if (openParam !== 'reminders') return;
        const isAdminUser = localStorage.getItem('pulpProAdmin') === 'true';
        const userCode = localStorage.getItem('pulpProAccessCode') || (isAdminUser ? 'admin' : null);
        if (!userCode) return;

        // Sync reminders from KV to localStorage first
        // Safari/Chrome has separate localStorage from PWA so we need to populate it
        // before showing the sheet so all buttons (done, snooze, edit) work correctly
        fetch(ACCESS_WORKER + '/reminders-get', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userCode, secret: 'pulpro2024' })
        })
        .then(r => r.json())
        .then(data => {
            if (data.reminders && data.reminders.length > 0) {
                localStorage.setItem('pulpai_reminders', JSON.stringify(data.reminders));
                if (typeof renderReminderTilePreview === 'function') renderReminderTilePreview();
            }
            setTimeout(() => {
                if (typeof showReminderSheet === 'function') {
                    showReminderSheet(reminderIdParam);
                }
            }, 200);
        })
        .catch(() => {
            // Fallback — show sheet with whatever is in localStorage
            setTimeout(() => {
                if (typeof showReminderSheet === 'function') {
                    showReminderSheet(reminderIdParam);
                }
            }, 600);
        });
    }

    if (isAdmin) {
        isAdminLoggedIn = true;
        renderAdminMenu();
        showApp();
        maybeShowSheet();
        return;
    }

    if (code) {
        // Verify access is still active with KV
        try {
            const res = await fetch(ACCESS_WORKER + '/check-access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const data = await res.json();
            if (data.valid) {
                showApp();
                maybeShowSheet();
            } else {
                // Access revoked — clear localStorage and show gate
                localStorage.removeItem('pulpProAccessCode');
                localStorage.removeItem('pulpProUserName');
                showGate();
            }
        } catch (e) {
            // Network error — allow offline access if code exists in localStorage
            showApp();
            maybeShowSheet();
        }
        return;
    }

    showGate();
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

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,Arial,sans-serif;">
<div style="max-width:520px;margin:24px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">

  <div style="background:#f0f7e6;border-bottom:3px solid #a6e22e;padding:28px 24px;text-align:center;">
    <div style="font-size:36px;margin-bottom:10px;">🍌</div>
    <div style="font-size:20px;font-weight:600;color:#1a1a1a;margin-bottom:4px;">Welcome to Pulp Pro</div>
    <div style="font-size:12px;color:#666666;">Your access code is ready</div>
  </div>

  <div style="padding:24px;">

    <p style="font-size:14px;color:#222222;line-height:1.7;margin:0 0 20px 0;">Hi ${name},<br><br>You've been given access to <strong>Pulp Pro Intelligence</strong> — a professional tool built for the fruit floor. Your personal access code is below. It is one-time use and personal to you.</p>

    <div style="background:#f0f7e6;border:2px solid #a6e22e;border-radius:12px;padding:22px;text-align:center;margin-bottom:24px;">
      <div style="font-size:10px;font-weight:600;color:#5a8a1a;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;">Your access code</div>
      <div style="font-size:30px;font-weight:700;color:#3a6a0a;letter-spacing:8px;font-family:monospace;margin-bottom:8px;">${code}</div>
      <div style="font-size:10px;color:#888888;">One-time use &middot; Personal to you &middot; Do not share</div>
    </div>

    <div style="font-size:11px;font-weight:600;color:#999999;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">How to install</div>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td width="49%" valign="top" style="background:#f9f9f9;border:1px solid #e8e8e8;border-radius:8px;padding:14px;">
          <div style="font-size:13px;font-weight:600;color:#222222;margin-bottom:10px;">📱 iPhone</div>
          <div style="font-size:11px;color:#555555;padding:5px 0;border-bottom:1px solid #eeeeee;">
            <span style="display:inline-block;width:16px;height:16px;background:#a6e22e;border-radius:50%;font-size:9px;font-weight:700;color:#000000;text-align:center;line-height:16px;margin-right:6px;">1</span>Open link in Safari
          </div>
          <div style="font-size:11px;color:#555555;padding:5px 0;border-bottom:1px solid #eeeeee;">
            <span style="display:inline-block;width:16px;height:16px;background:#a6e22e;border-radius:50%;font-size:9px;font-weight:700;color:#000000;text-align:center;line-height:16px;margin-right:6px;">2</span>Tap Share &rarr; Add to Home Screen
          </div>
          <div style="font-size:11px;color:#555555;padding:5px 0;">
            <span style="display:inline-block;width:16px;height:16px;background:#a6e22e;border-radius:50%;font-size:9px;font-weight:700;color:#000000;text-align:center;line-height:16px;margin-right:6px;">3</span>Open app and enter code
          </div>
        </td>
        <td width="2%">&nbsp;</td>
        <td width="49%" valign="top" style="background:#f9f9f9;border:1px solid #e8e8e8;border-radius:8px;padding:14px;">
          <div style="font-size:13px;font-weight:600;color:#222222;margin-bottom:10px;">🤖 Android</div>
          <div style="font-size:11px;color:#555555;padding:5px 0;border-bottom:1px solid #eeeeee;">
            <span style="display:inline-block;width:16px;height:16px;background:#a6e22e;border-radius:50%;font-size:9px;font-weight:700;color:#000000;text-align:center;line-height:16px;margin-right:6px;">1</span>Open link in Chrome
          </div>
          <div style="font-size:11px;color:#555555;padding:5px 0;border-bottom:1px solid #eeeeee;">
            <span style="display:inline-block;width:16px;height:16px;background:#a6e22e;border-radius:50%;font-size:9px;font-weight:700;color:#000000;text-align:center;line-height:16px;margin-right:6px;">2</span>Tap &#8942; &rarr; Add to Home Screen
          </div>
          <div style="font-size:11px;color:#555555;padding:5px 0;">
            <span style="display:inline-block;width:16px;height:16px;background:#a6e22e;border-radius:50%;font-size:9px;font-weight:700;color:#000000;text-align:center;line-height:16px;margin-right:6px;">3</span>Open app and enter code
          </div>
        </td>
      </tr>
    </table>

    <div style="background:#f9f9f9;border:1px solid #e8e8e8;border-left:3px solid #a6e22e;border-radius:0 8px 8px 0;padding:12px 14px;margin-bottom:24px;">
      <div style="font-size:11px;font-weight:600;color:#222222;margin-bottom:4px;">Important &mdash; always open from your home screen</div>
      <div style="font-size:11px;color:#555555;line-height:1.6;">The app works fully offline once installed. Always launch it from the home screen icon &mdash; not from the browser &mdash; to keep your access code saved.</div>
    </div>

    <div style="text-align:center;">
      <a href="https://pulp-pro-intelligence.pulpprobrain.workers.dev" style="display:inline-block;background:#a6e22e;color:#000000;border-radius:100px;padding:12px 32px;font-size:13px;font-weight:600;text-decoration:none;letter-spacing:0.3px;">Open Pulp Pro &rarr;</a>
    </div>

  </div>

  <div style="background:#f5f5f5;border-top:1px solid #e8e8e8;padding:14px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td>
          <div style="font-size:12px;font-weight:600;color:#222222;">Pulp Pro Intelligence</div>
          <div style="font-size:11px;color:#999999;">Questions? Reply to this email.</div>
        </td>
        <td align="right">
          <a href="https://pulp-pro-intelligence.pulpprobrain.workers.dev" style="font-size:10px;color:#5a8a1a;text-decoration:none;">pulp-pro-intelligence.pulpprobrain.workers.dev</a>
        </td>
      </tr>
    </table>
  </div>

</div>
</body></html>`;

    try {
        const htmlBlob = new Blob([html], { type: 'text/html' });
        const textBlob = new Blob([`Hi ${name},\n\nYou've been given access to Pulp Pro Intelligence.\n\nYour access code: ${code}\n\nInstall the app: ${appUrl}\n\niPhone: Open in Safari → Share → Add to Home Screen → Enter code\nAndroid: Open in Chrome → ⋮ Menu → Add to Home Screen → Enter code\n\nAlways open from your home screen icon to keep your code saved.\n\nQuestions? Reply to this email.\nPulp Pro Intelligence`], { type: 'text/plain' });
        const item = new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob });
        navigator.clipboard.write([item]).then(() => {
            const btn = document.getElementById('copyCodeBtn');
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-check"></i> Copied!';
            setTimeout(() => { btn.innerHTML = original; }, 2500);
        });
    } catch (e) {
        const plain = `Hi ${name},\n\nYou've been given access to Pulp Pro Intelligence.\n\nYour access code: ${code}\n\nInstall: ${appUrl}\n\niPhone: Open in Safari → Share → Add to Home Screen → Enter code\nAndroid: Open in Chrome → ⋮ Menu → Add to Home Screen → Enter code\n\nAlways open from your home screen icon.\n\nPulp Pro Intelligence`;
        navigator.clipboard.writeText(plain).then(() => {
            const btn = document.getElementById('copyCodeBtn');
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-check"></i> Copied!';
            setTimeout(() => { btn.innerHTML = original; }, 2500);
        });
    }
}

function toggleRevokePanel() {
    const panel = document.getElementById('revoke-panel');
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) loadActiveUsers();
}

async function loadActiveUsers() {
    const list = document.getElementById('revoke-list');
    list.innerHTML = '<div style="color:rgba(255,255,255,0.3);font-size:11px;padding:4px 0;">Loading...</div>';
    try {
        const res = await fetch(ACCESS_WORKER + '/list-codes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminPassword: ADMIN_PASSWORD })
        });
        const data = await res.json();
        if (!data.codes || data.codes.length === 0) {
            list.innerHTML = '<div style="color:rgba(255,255,255,0.3);font-size:11px;padding:4px 0;">No codes found</div>';
            return;
        }
        list.innerHTML = data.codes.map(c => {
            const isActive = c.type === 'active';
            const badgeColor = isActive ? 'rgba(166,226,46,0.15)' : 'rgba(255,140,0,0.15)';
            const badgeTextColor = isActive ? '#a6e22e' : '#ff8c00';
            const badgeBorder = isActive ? 'rgba(166,226,46,0.3)' : 'rgba(255,140,0,0.3)';
            const badgeText = isActive ? 'Active' : 'Pending';
            return `
            <div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
                    <div style="display:flex;align-items:center;gap:6px;">
                        <div style="font-size:11px;font-weight:700;color:#fff;">${c.name || 'Unknown'}</div>
                        <span style="font-size:7px;font-weight:800;color:${badgeTextColor};background:${badgeColor};border:1px solid ${badgeBorder};border-radius:20px;padding:2px 7px;text-transform:uppercase;letter-spacing:0.5px;">${badgeText}</span>
                    </div>
                    <button onclick="revokeUser('${c.code}', '${c.name || 'this user'}')" style="background:rgba(255,77,77,0.1);border:1px solid rgba(255,77,77,0.3);border-radius:6px;padding:4px 9px;font-size:7px;font-weight:700;color:rgba(255,77,77,0.8);text-transform:uppercase;cursor:pointer;font-family:-apple-system,sans-serif;letter-spacing:0.5px;">Revoke</button>
                </div>
                <div style="font-size:9px;color:rgba(255,255,255,0.25);font-family:monospace;">${c.code}</div>
            </div>`;
        }).join('');
    } catch (e) {
        list.innerHTML = '<div style="color:rgba(255,77,77,0.6);font-size:11px;">Error loading users</div>';
    }
}

async function revokeUser(code, name) {
    if (!confirm(`Revoke access for ${name}? They will be locked out immediately.`)) return;
    try {
        const res = await fetch(ACCESS_WORKER + '/revoke-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, adminPassword: ADMIN_PASSWORD })
        });
        const data = await res.json();
        if (data.success) {
            loadActiveUsers();
        }
    } catch (e) {
        alert('Error revoking access.');
    }
}

// ── NAVIGATION ────────────────────────────────────────────────
function showHub() {
    document.getElementById('fruit-hub').classList.remove('hidden');
    document.getElementById('appInterface').classList.add('hidden');
    document.getElementById('colour-scanner-view').classList.add('hidden');
    const pulpaiView = document.getElementById('pulpai-view');
    if (pulpaiView) pulpaiView.classList.add('hidden');
    const remView = document.getElementById('reminders-view');
    if (remView) remView.classList.add('hidden');
    const menuTrigger = document.getElementById('menu-trigger');
    if (menuTrigger) menuTrigger.style.display = '';
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
