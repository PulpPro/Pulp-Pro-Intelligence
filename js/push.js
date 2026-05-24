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
        // Only ask if permission not yet decided
        if (Notification.permission === 'default') {
            requestPushPermission();
        } else if (Notification.permission === 'granted') {
            // Re-subscribe silently to refresh subscription
            requestPushPermission();
        }
    }, 3000);
});
