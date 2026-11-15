// Service worker: guarda a "casca" da app para abrir rápido e instalar no telemóvel.
const CACHE = 'marcai-v6';
const BASE = new URL('./', self.location).pathname; // funciona em /app/ ou /qualquer/pasta/app/
const SHELL = ['', 'index.html', 'app.js', 'locale.js', 'agents-ui.js', 'data.js', 'config.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png'].map(f => BASE + f);
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || !u.pathname.startsWith(BASE)) return; // Supabase e CDNs vão sempre à rede
  // rede primeiro, cache como reserva (para estar sempre atualizado)
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match(BASE + 'index.html'))));
});

// Notificações push: nova marcação / desmarcação (enviadas pela função "push" do servidor)
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data && e.data.text() }; }
  const icon = new URL('icon-192.png', self.registration.scope).href;
  e.waitUntil(self.registration.showNotification(d.title || 'Marcaí', { body: d.body || '', tag: d.tag, icon, badge: icon, data: { url: new URL('./#agenda', self.registration.scope).href } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const w = list.find(c => c.url.startsWith(self.registration.scope));
    return w ? w.focus().then(c => c.navigate ? c.navigate(url) : c) : clients.openWindow(url);
  }));
});
