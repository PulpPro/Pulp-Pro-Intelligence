const CACHE_VERSION = 'v6';
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
    event.waitUntil(
        fetch('https://pulppro-access.pulpprobrain.workers.dev/latest-reminder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secret: 'pulpro2024' })
        })
        .then(r => r.json())
        .then(data => {
            return self.registration.showNotification('Pulp Pro Reminder', {
                body: data.text || 'You have a reminder due now.',
                icon: '/edited-image.png',
                badge: '/edited-image.png',
                tag: 'pulpro-reminder',
                requireInteraction: true,
                data: { reminderId: data.id || null }
            });
        })
        .catch(() => {
            return self.registration.showNotification('Pulp Pro Reminder', {
                body: 'You have a reminder due now.',
                icon: '/edited-image.png',
                badge: '/edited-image.png',
                tag: 'pulpro-reminder',
                requireInteraction: true,
                data: { reminderId: null }
            });
        })
    );
});

// ── NOTIFICATION CLICK ────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const reminderId = event.notification.data?.reminderId || null;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If app already open, focus it and postMessage
            for (const client of clientList) {
                if (client.url.includes('pulppro.github.io') || client.url.includes('pulpprobrain.workers.dev')) {
                    client.focus();
                    client.postMessage({ type: 'OPEN_REMINDERS', reminderId });
                    return;
                }
            }
            // App not open — open index.html directly, not base URL
            const base = 'https://pulppro.github.io/Pulp-Pro-Intelligence/';
            const param = reminderId ? `?open=reminders&reminderId=${reminderId}` : '?open=reminders';
            return clients.openWindow(base + param);
        })
    );
});
