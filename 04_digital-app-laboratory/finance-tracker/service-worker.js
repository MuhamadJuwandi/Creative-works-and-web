const CACHE_NAME = 'juwan-finance-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './logo.jpg'
];

// 1. Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Membuka cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Activate Service Worker (Bersihkan cache lama jika ada update)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 3. Fetch (Strategi: Cache First, lalu Network)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Jika ada di cache, gunakan cache. Jika tidak, ambil dari internet.
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
