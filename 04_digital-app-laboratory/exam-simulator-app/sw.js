const CACHE_NAME = 'ut-exam-sim-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './db.js',
    './assets/logo.png',
    './assets/bg-result.png',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/lucide@latest',
    'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js',
    'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});
