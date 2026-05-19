const CACHE_VERSION = 'v2.2';
const CACHE_NAME = 'pulp-pro-' + CACHE_VERSION;
const ASSETS = [
    '/Pulp-Pro-Intelligence/',
    '/Pulp-Pro-Intelligence/index.html',
    '/Pulp-Pro-Intelligence/manifest.json',
    '/Pulp-Pro-Intelligence/edited-image.png',
    '/Pulp-Pro-Intelligence/colour.png',
    '/Pulp-Pro-Intelligence/css/theme.css',
    '/Pulp-Pro-Intelligence/css/layout.css',
    '/Pulp-Pro-Intelligence/css/components.css',
    '/Pulp-Pro-Intelligence/js/app.js',
    '/Pulp-Pro-Intelligence/js/navigation.js',
    '/Pulp-Pro-Intelligence/js/history.js',
    '/Pulp-Pro-Intelligence/js/calculator.js',
    '/Pulp-Pro-Intelligence/js/colour-scanner.js',
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
    // Skip non-GET and cross-origin except CDN
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    const isAPI = url.hostname.includes('pulpprobrain.workers.dev');
    if (isAPI) return; // Never cache API calls

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) {
                // Return cache immediately, update in background
                fetch(event.request).then((response) => {
                    if (response && response.status === 200) {
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, response));
                    }
                }).catch(() => {});
                return cached;
            }
            // Not in cache — fetch from network and cache it
            return fetch(event.request).then((response) => {
                if (!response || response.status !== 200) return response;
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            }).catch(() => {
                // Offline fallback — return index.html for navigation requests
                if (event.request.headers.get('accept')?.includes('text/html')) {
                    return caches.match('/Pulp-Pro-Intelligence/index.html');
                }
            });
        })
    );
});

self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') self.skipWaiting();
});
