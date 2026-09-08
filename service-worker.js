const CACHE_NAME = 'zera-ps-clinical-root-20260908';
const APP_SHELL = ['./', './index.html', './app.html', './app.js', './manifest.json', './assets/styles.css', './assets/data.js', './assets/templates.js', './assets/scores.js', './assets/clinical-state.js', './assets/document-engine.js', './assets/storage.js', './assets/ui.js', './assets/app.js', './assets/logo.svg', './src/app.js', './src/temporal-ui.js', './src/context-coordination.js', './src/justification-engine.js', './src/hda-composer.js', './src/tool-presentation.js', './src/clinical-state.js', './src/data.js', './src/templates.js', './src/ui.js', './src/storage.js', './src/workflow-engine.js', './src/score-engine.js', './src/document-engine.js', './src/protocol-schema.js', './src/protocol-engine.js', './src/protocol-registry.js', './src/protocol-renderer.js', './protocols/sca.js', './work-version/dist/style.css', './work-version/dist/app.js', './work-version/dist/engine.js', './work-version/dist/storage.js', './work-version/dist/manifest.json'];
self.addEventListener('install', event => {event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));self.skipWaiting();});
self.addEventListener('activate', event => {event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('zera-ps-') && key !== CACHE_NAME && key !== 'zera-ps-v3-clinical').map(key => caches.delete(key)))).then(() => self.clients.claim()));});
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin)return;
  if(event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html'))));
    return;
  }
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(response => response || Response.error())));
});
