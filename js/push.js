// ── PUSH NOTIFICATIONS — Native Web Push ─────────────────────────────────
const VAPID_PUBLIC_KEY = 'BFXr3Hu8BG9kcn2v_S-wO7QzlK1jn8rMsSxkKyJUWGRa4TpbBeNxFy_nJQDkiOBKVZLGQwVKN1od2xjUvT0RW4k';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

function requestPushPermission() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    Notification.requestPermission().then(permission => {
        if (permission !== 'granted') return;
        navigator.serviceWorker.ready.then(reg => {
            reg.pushManager.getSubscription().then(existing => {
                if (existing) { savePushSubscription(existing); return; }
                reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                }).then(subscription => {
                    savePushSubscription(subscription);
                }).catch(e => console.error('Subscribe error:', e));
            });
        });
    }).catch(e => console.error('Permission error:', e));
}

async function savePushSubscription(subscription) {
    try {
        const isAdmin = localStorage.getItem('pulpProAdmin') === 'true';
        const userCode = localStorage.getItem('pulpProAccessCode') || (isAdmin ? 'admin' : null);
        if (!userCode) {
            console.warn('Push subscription skipped: no user code found.');
            return;
        }
        await fetch('https://pulppro-access.pulpprobrain.workers.dev/push-subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: subscription.toJSON(), userCode })
        });
    } catch(e) {
        console.error('Failed to save push subscription:', e);
    }
}

function showNotificationPrompt() {
    // Only show if permission not yet decided
    if (Notification.permission !== 'default') return;
    // Only show if already logged in
    const isAdmin = localStorage.getItem('pulpProAdmin') === 'true';
    const userCode = localStorage.getItem('pulpProAccessCode');
    if (!isAdmin && !userCode) return;
    // Only show once per session
    if (sessionStorage.getItem('notif_prompt_shown')) return;
    sessionStorage.setItem('notif_prompt_shown', '1');

    const overlay = document.createElement('div');
    overlay.id = 'notif-prompt-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:999999;display:flex;align-items:flex-end;';
    overlay.innerHTML = `
        <div style="width:100%;background:#0f0f1a;border-radius:22px 22px 0 0;padding:28px 24px 40px;">
            <div style="width:36px;height:4px;background:rgba(255,255,255,0.15);border-radius:100px;margin:0 auto 24px;"></div>
            <div style="font-size:36px;text-align:center;margin-bottom:16px;">🔔</div>
            <div style="font-size:20px;font-weight:800;color:#fff;text-align:center;margin-bottom:8px;">Enable Reminders</div>
            <div style="font-size:14px;color:rgba(255,255,255,0.45);text-align:center;line-height:1.6;margin-bottom:28px;">Get notified when your fruit floor reminders are due. You can turn this off anytime.</div>
            <button onclick="requestPushPermission();document.getElementById('notif-prompt-overlay').remove();" style="width:100%;background:#a6e22e;border:none;border-radius:14px;padding:16px;font-size:16px;font-weight:800;color:#000;font-family:-apple-system,sans-serif;margin-bottom:12px;">Enable Notifications</button>
            <button onclick="document.getElementById('notif-prompt-overlay').remove();" style="width:100%;background:transparent;border:none;border-radius:14px;padding:14px;font-size:15px;font-weight:600;color:rgba(255,255,255,0.4);font-family:-apple-system,sans-serif;">Not now</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Re-sync subscription on load if already granted
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (Notification.permission === 'granted') {
            requestPushPermission();
        }
    }, 2000);
});
