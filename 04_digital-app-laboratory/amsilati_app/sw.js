/**
 * Service Worker v5 — Smart caching strategies
 * - Network-First: Google APIs, PDF files (always get latest)
 * - Cache-First: Static assets (HTML, CSS, JS, images)
 */
const CACHE_NAME = 'amsilati-v5';

const STATIC_ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './manifest.json',
    './data/mock.json',
    './assets/logo_pesantren.jpg',
    './assets/amsilati_logo.jpg',
    'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&family=Outfit:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
];
// NOTE: hafalan.pdf is intentionally NOT pre-cached here.
// It uses network-first strategy so updates are picked up automatically.

// ─── INSTALL ─────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return Promise.allSettled(
                    STATIC_ASSETS.map(url =>
                        cache.add(url).catch(err => {
                            console.warn('SW: Failed to cache:', url, err.message);
                        })
                    )
                );
            })
            .then(() => self.skipWaiting())
    );
});

// ─── ACTIVATE ────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// ─── FETCH ───────────────────────────
self.addEventListener('fetch', event => {
    const url = event.request.url;

    // Google Sheets / Google Drive: Network-First
    if (url.includes('docs.google.com/spreadsheets') || url.includes('drive.google.com')) {
        event.respondWith(networkFirst(event.request));
        return;
    }

    // PDF files: Network-First (so updated PDFs are always picked up)
    if (url.endsWith('.pdf')) {
        event.respondWith(networkFirst(event.request));
        return;
    }

    // Everything else: Cache-First
    event.respondWith(cacheFirst(event.request));
});

/**
 * Network-First strategy.
 * Tries network; on success, caches the response.
 * On failure, falls back to cached response.
 */
async function networkFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (err) {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        return new Response('Offline', { status: 503 });
    }
}

/**
 * Cache-First strategy for static assets.
 * Serves cached version immediately; if not cached, fetches and caches.
 */
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (err) {
        return new Response('Offline', { status: 503 });
    }
}
