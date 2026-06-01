const CACHE_VERSION = 'v4';
const CACHE_NAME = 'pulp-pro-' + CACHE_VERSION;
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/edited-image.png',
    '/colour.png',
    '/css/theme.css',
    '/css/layout.css',
    '/css/components.css',
    '/js/app.js',
    '/js/navigation.js',
    '/js/history.js',
    '/js/calculator.js',
    '/js/colour-scanner.js',
    '/js/pulp-ai.js',
    '/js/reminders.js',
    '/js/floor-iq.js',
    '/js/tile-animations.js',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.allSettled(
                ASSETS.map(url => cache.add(url).catch(e => console.warn('Failed to cache:', url, e)))
            );
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            caches.keys().then((keys) => {
                return Promise.all(
                    keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
                );
            }),
            self.clients.claim()
        ])
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);
    const isAPI = url.hostname.includes('pulpprobrain.workers.dev') && url.pathname !== '/';
    if (isAPI && url.pathname.startsWith('/validate') || url.pathname.startsWith('/generate') || url.pathname.startsWith('/admin') || url.pathname.startsWith('/list') || url.pathname.startsWith('/revoke')) return;
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) {
                fetch(event.request).then((response) => {
                    if (response && response.status === 200) {
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, response));
                    }
                }).catch(() => {});
                return cached;
            }
            return fetch(event.request).then((response) => {
                if (!response || response.status !== 200) return response;
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            }).catch(() => {
                if (event.request.headers.get('accept')?.includes('text/html')) {
                    return caches.match('/index.html');
                }
            });
        })
    );
});

self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') self.skipWaiting();
});

// ── PUSH NOTIFICATIONS ────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
    const notifOptions = (text, id, uc) => ({
        body: text || 'You have a reminder due now.',
        icon: '/edited-image.png',
        badge: '/edited-image.png',
        tag: 'pulpro-reminder',
        requireInteraction: true,
        actions: [
            { action: 'done', title: '✓ Done' },
            { action: 'snooze', title: '⏰ +1 hr' },
            { action: 'dismiss', title: '✕ Dismiss' }
        ],
        data: { reminderId: id || null, usercode: uc || null }
    });

    event.waitUntil(
        Promise.race([
            fetch('https://pulppro-access.pulpprobrain.workers.dev/latest-reminder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret: 'pulpro2024' })
            }).then(r => r.json()),
            new Promise(resolve => setTimeout(() => resolve(null), 4000))
        ])
        .then(data => self.registration.showNotification('Pulp Pro Reminder', notifOptions(data?.text, data?.id, data?.usercode)))
        .catch(() => self.registration.showNotification('Pulp Pro Reminder', notifOptions(null, null, null)))
    );
});

// ── NOTIFICATION CLICK ────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const reminderId = event.notification.data?.reminderId || null;
    const usercode = event.notification.data?.usercode || null;
    const WORKER = 'https://pulppro-access.pulpprobrain.workers.dev';

    // Notify open app clients to refresh reminders
    const notifyClients = () => clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(list => list.forEach(c => c.postMessage({ type: 'REMINDER_UPDATED' })));

    if (event.action === 'done') {
        event.waitUntil(
            fetch(WORKER + '/reminder-mark-done', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret: 'pulpro2024', reminderId, usercode })
            }).then(notifyClients).catch(() => {})
        );
        return;
    }

    if (event.action === 'snooze') {
        event.waitUntil(
            fetch(WORKER + '/reminder-snooze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret: 'pulpro2024', reminderId, usercode, minutes: 60 })
            }).then(notifyClients).catch(() => {})
        );
        return;
    }

    if (event.action === 'dismiss') return;

    // plain tap — store reminderId in Cache API then iOS opens PWA natively
    // if app already open, postMessage directly
    event.waitUntil(
        caches.open('pulpro-pending').then(cache => {
            return cache.put('/pending-reminder', new Response(JSON.stringify({ reminderId, usercode })));
        }).then(() => {
            return clients.matchAll({ type: 'window', includeUncontrolled: true });
        }).then(clientList => {
            if (clientList.length > 0) {
                clientList[0].focus();
                clientList[0].postMessage({ type: 'OPEN_REMINDERS', reminderId });
            }
            // No openWindow — iOS opens PWA natively on notification tap
        })
    );
});
