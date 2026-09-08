const CACHE_NAME = 'zera-ps-clinical-root-20260908';
const APP_SHELL = ['./', './index.html', './work-version/dist/style.css', './work-version/dist/app.js', './work-version/dist/engine.js', './work-version/dist/storage.js', './work-version/dist/manifest.json'];
self.addEventListener('install', event => {event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));self.skipWaiting();});
self.addEventListener('activate', event => {event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('zera-ps-') && key !== CACHE_NAME && key !== 'zera-ps-v3-clinical').map(key => caches.delete(key)))).then(() => self.clients.claim()));});
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin)return;
  if(event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(response => response || Response.error())));
});
