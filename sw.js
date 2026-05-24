const CACHE_VERSION = 'v2.2';
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
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch(e) {
        try {
            const text = event.data ? event.data.text() : '';
            data = { title: 'Pulp Pro', body: text || 'You have a reminder.' };
        } catch(e2) {
            data = { title: 'Pulp Pro', body: 'You have a reminder.' };
        }
    }

    const title = data.title || 'Pulp Pro Reminder';
    const options = {
        body: data.body || 'You have a reminder due now.',
        icon: '/edited-image.png',
        badge: '/edited-image.png',
        tag: 'pulpro-reminder',
        requireInteraction: true,
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// ── NOTIFICATION CLICK ────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    // Open or focus the app
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If app already open, focus it
            for (const client of clientList) {
                if (client.url.includes('pulppro.github.io') || client.url.includes('pulpprobrain.workers.dev')) {
                    client.focus();
                    client.postMessage({ type: 'OPEN_REMINDERS' });
                    return;
                }
            }
            // Otherwise open app
            return clients.openWindow('/');
        })
    );
});
