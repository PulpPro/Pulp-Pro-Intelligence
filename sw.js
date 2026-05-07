const CACHE_VERSION = 'v1.7';
const CACHE_NAME = 'pulp-pro-' + CACHE_VERSION;
const ASSETS = [
    '/Pulp-Pro-Intelligence/',
    '/Pulp-Pro-Intelligence/index.html',
    '/Pulp-Pro-Intelligence/manifest.json',
    '/Pulp-Pro-Intelligence/edited-image.png',
    '/Pulp-Pro-Intelligence/banana.png',
    '/Pulp-Pro-Intelligence/mango.png',
    '/Pulp-Pro-Intelligence/avocado.png',
    '/Pulp-Pro-Intelligence/rotten.png',
    '/Pulp-Pro-Intelligence/colour.png',
    '/Pulp-Pro-Intelligence/news.png',
    '/Pulp-Pro-Intelligence/css/theme.css',
    '/Pulp-Pro-Intelligence/css/layout.css',
    '/Pulp-Pro-Intelligence/css/components.css',
    '/Pulp-Pro-Intelligence/js/translations.js',
    '/Pulp-Pro-Intelligence/js/app.js',
    '/Pulp-Pro-Intelligence/js/navigation.js',
    '/Pulp-Pro-Intelligence/js/brands.js',
    '/Pulp-Pro-Intelligence/js/favorites.js',
    '/Pulp-Pro-Intelligence/js/history.js',
    '/Pulp-Pro-Intelligence/js/calculator.js',
    '/Pulp-Pro-Intelligence/js/defects-data.js',
    '/Pulp-Pro-Intelligence/js/defect-detector.js',
    '/Pulp-Pro-Intelligence/js/colour-scanner.js',
    '/Pulp-Pro-Intelligence/js/news.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Pulp Pro: Caching assets ' + CACHE_VERSION);
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            caches.keys().then((keys) => {
                return Promise.all(
                    keys.filter(key => key !== CACHE_NAME).map(key => {
                        console.log('Pulp Pro: Removing old cache', key);
                        return caches.delete(key);
                    })
                );
            }),
            self.clients.claim()
        ])
    );
});

self.addEventListener('fetch', (event) => {
    const isHTML = event.request.headers.get('accept')?.includes('text/html');

    if (isHTML) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
    } else {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request).then((networkResponse) => {
                    const clone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return networkResponse;
                });
            })
        );
    }
});

self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
