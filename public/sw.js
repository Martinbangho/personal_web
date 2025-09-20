// Service Worker for caching static assets
const CACHE_NAME = 'bangho-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/assets/css/bootstrap.min.css',
    '/assets/js/main.min.js',
    '/assets/js/jquery.min.js',
    '/assets/img/hero/me.webp',
    '/assets/img/logo.ico'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function(cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
        .then(function(response) {
            // Return cached version or fetch from network
            return response || fetch(event.request);
        })
    );
});