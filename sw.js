const CACHE = 'ro-vault-v2';
const ASSETS = [
  '/index.html',
  '/alert.html',
  '/timeline.html',
  '/weekly.html',
  '/team.html',
  '/research.html',
  '/theme.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch', e => {
  // Don't intercept non-GET, Supabase, or external requests
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('supabase.co')) return;
  if (!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request).catch(async () => {
      const cached = await caches.match(e.request);
      // caches.match bisa resolve undefined -> respondWith wajib dapat Response
      return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
    })
  );
});

// Push notification handler
self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) { data = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(
    self.registration.showNotification(data.title || 'Rena Omber', {
      body: data.body || '',
      icon: data.icon || '/icon-192.png',
      badge: '/icon-192.png',
      data: data.data || {}
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/alert.html';
  e.waitUntil(clients.openWindow(url));
});
