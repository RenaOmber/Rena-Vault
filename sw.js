const CACHE = 'ro-vault-v4';
const ASSETS = [
  '/index.html',
  '/theme.js'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k)))) // hapus SEMUA cache lama
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('supabase.co')) return;
  if (!e.request.url.startsWith(self.location.origin)) return;
  // NETWORK-FIRST: selalu ambil versi terbaru, cache cuma buat offline
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
        return res;
      })
      .catch(async () => (await caches.match(e.request)) || new Response('Offline', { status: 503 }))
  );
});

self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) { data = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(data.title || 'Rena Omber', {
    body: data.body || '', icon: '/icon-192.png', badge: '/icon-192.png', data: data.data || {}
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || '/alert.html'));
});
