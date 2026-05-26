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
        const userCode = localStorage.getItem('pulpProAccessCode');
        
        if (!userCode) {
            console.warn('Push subscription paused: No active user access code found in localStorage.');
            return;
        }

        await fetch('https://pulppro-access.pulpprobrain.workers.dev/push-subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: subscription.toJSON(), userCode })
        });
    } catch(e) {
        console.error('Failed to sync subscription with backend:', e);
    }
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'OPEN_REMINDERS') {
            if (typeof openReminders === 'function') openReminders();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (Notification.permission === 'granted') {
            requestPushPermission();
        }
    }, 2000);
});
