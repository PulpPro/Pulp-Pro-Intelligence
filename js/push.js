// ── PUSH NOTIFICATIONS — Native Web Push ─────────────────────────────────
const VAPID_PUBLIC_KEY = 'BFXr3Hu8BG9kcn2v_S-wO7QzlK1jn8rMsSxkKyJUWGRa4TpbBeNxFy_nJQDkiOBKVZLGQwVKN1od2xjUvT0RW4k';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

async function requestPushPermission() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return false;
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (existing) { await savePushSubscription(existing); return true; }
        const subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
        await savePushSubscription(subscription);
        return true;
    } catch(e) {
        console.error('Push error:', e);
        return false;
    }
}

async function savePushSubscription(subscription) {
    try {
        // FIX: use 'admin' for admin users who have no pulpProAccessCode
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

// NOTE: message listener for OPEN_REMINDERS is handled in app.js — do not duplicate here

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (Notification.permission === 'granted') {
            requestPushPermission();
        }
    }, 2000);
});
