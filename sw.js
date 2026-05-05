const CACHE_NAME = 'pulp-pro-v2';
const ASSETS = [
    '/Pulp/',
    '/Pulp/index.html',
    '/Pulp/manifest.json',
    '/Pulp/edited-image.png',
    '/Pulp/banana.png',
    '/Pulp/mango.png',
    '/Pulp/avocado.png',
    '/Pulp/css/theme.css',
    '/Pulp/css/layout.css',
    '/Pulp/css/components.css',
    '/Pulp/js/app.js',
    '/Pulp/js/navigation.js',
    '/Pulp/js/brands.js',
    '/Pulp/js/favorites.js',
    '/Pulp/js/history.js',
    '/Pulp/js/calculator.js',
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
});

// Fetch — serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
