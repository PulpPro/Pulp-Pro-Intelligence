// ── PUSH NOTIFICATIONS via OneSignal ─────────────────────────────────────
const ONESIGNAL_APP_ID = 'e89261fc-09af-4baa-8aaa-435bb3054b63';

// Get OneSignal subscription ID and save to KV
async function saveOneSignalSubscription() {
    try {
        if (!window.OneSignal) return;
        const playerId = await OneSignal.User.PushSubscription.id;
        if (!playerId) return;
        const userCode = localStorage.getItem('pulpProAccessCode') || 'admin';
        await fetch('https://pulppro-access.pulpprobrain.workers.dev/push-subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oneSignalPlayerId: playerId, userCode })
        });
    } catch(e) {
        console.error('Failed to save OneSignal subscription:', e);
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

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.OneSignalDeferred) {
            OneSignalDeferred.push(async function(OneSignal) {
                // Save player ID when subscription changes
                OneSignal.User.PushSubscription.addEventListener('change', saveOneSignalSubscription);
                // Save on load if already subscribed
                await saveOneSignalSubscription();
            });
        }
    }, 2000);
});
