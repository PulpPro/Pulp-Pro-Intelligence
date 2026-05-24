// ── PUSH NOTIFICATIONS ────────────────────────────────────────────────────
const VAPID_PUBLIC_KEY = 'BFXr3Hu8BG9kcn2v_S-wO7QzlK1jn8rMsSxkKyJUWGRa4TpbBeNxFy_nJQDkiOBKVZLGQwVKN1od2xjUvT0RW4k';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

async function requestPushPermission() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push not supported');
        return false;
    }
    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return false;
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (existing) {
            await savePushSubscription(existing);
            return true;
        }
        const subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
        await savePushSubscription(subscription);
        return true;
    } catch(e) {
        console.error('Push subscription error:', e);
        return false;
    }
}

async function savePushSubscription(subscription) {
    try {
        const userCode = localStorage.getItem('pulpProAccessCode') || 'admin';
        await fetch('https://pulppro-access.pulpprobrain.workers.dev/push-subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: subscription.toJSON(), userCode })
        });
    } catch(e) {
        console.error('Failed to save subscription:', e);
    }
}

// Listen for messages from service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'OPEN_REMINDERS') {
            if (typeof openReminders === 'function') openReminders();
        }
    });
}

// Auto-request permission after app loads — with a small delay so it feels natural
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) return;
        if (Notification.permission === 'granted') {
            // Already granted — re-subscribe silently
            requestPushPermission();
        } else if (Notification.permission === 'default') {
            // Show a banner asking user to enable notifications
            showNotificationBanner();
        }
    }, 4000);
});

function showNotificationBanner() {
    const existing = document.getElementById('notif-banner');
    if (existing) return;
    const banner = document.createElement('div');
    banner.id = 'notif-banner';
    banner.style.cssText = 'position:fixed;bottom:80px;left:16px;right:16px;background:#1a1a2e;border:1px solid rgba(136,153,255,0.3);border-radius:16px;padding:14px 16px;z-index:99990;display:flex;align-items:center;gap:12px;box-shadow:0 8px 32px rgba(0,0,0,0.4);';
    banner.innerHTML = `
        <div style="width:36px;height:36px;border-radius:10px;background:rgba(136,153,255,0.15);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;color:#8899ff;"><i class="bi bi-bell"></i></div>
        <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:2px;">Enable reminders</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.45);">Get notified when your reminders are due</div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;">
            <button onclick="dismissNotifBanner()" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:7px 10px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);cursor:pointer;font-family:-apple-system,sans-serif;">Later</button>
            <button onclick="enableNotifications()" style="background:#8899ff;border:none;border-radius:8px;padding:7px 12px;font-size:11px;font-weight:700;color:#000;cursor:pointer;font-family:-apple-system,sans-serif;">Enable</button>
        </div>
    `;
    document.body.appendChild(banner);
    // Auto dismiss after 8 seconds
    setTimeout(() => dismissNotifBanner(), 8000);
}

function dismissNotifBanner() {
    const banner = document.getElementById('notif-banner');
    if (banner) banner.remove();
}

async function enableNotifications() {
    dismissNotifBanner();
    const granted = await requestPushPermission();
    if (granted) {
        // Show success
        const toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#8899ff;color:#000;border-radius:100px;padding:10px 20px;font-size:13px;font-weight:700;z-index:99990;white-space:nowrap;';
        toast.innerText = 'Notifications enabled';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }
}
