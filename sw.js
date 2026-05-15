const CACHE_NAME = 'pulp-pro-v3';
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
    '/Pulp-Pro-Intelligence/js/app.js',
    '/Pulp-Pro-Intelligence/js/navigation.js',
    '/Pulp-Pro-Intelligence/js/favorites.js',
    '/Pulp-Pro-Intelligence/js/history.js',
    '/Pulp-Pro-Intelligence/js/calculator.js',
    '/Pulp-Pro-Intelligence/js/translations.js',
    '/Pulp-Pro-Intelligence/js/defects-data.js',
    '/Pulp-Pro-Intelligence/js/defect-detector.js',
    '/Pulp-Pro-Intelligence/js/colour-scanner.js',
    '/Pulp-Pro-Intelligence/js/news.js',
    '/Pulp-Pro-Intelligence/js/fruit-defects-data.js',
    '/Pulp-Pro-Intelligence/js/fruit-defects.js',
    '/Pulp-Pro-Intelligence/js/origin-report.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css'
];

// Install — cache all assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Pulp Pro: Caching assets');
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch — serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
