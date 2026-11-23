// Guía Portal Credigestión. Independiente de las otras apps del sitio.
// Cambia el número de versión cada vez que actualices el index.html
const CACHE = 'guiaportal-v1';

const ARCHIVOS = [
  './',
  './index.html',
  './manifest.json',
  './guia-icon-192.png',
  './guia-icon-512.png',
  './guia-apple-touch-icon.png'
];

// Instalar: guarda los archivos para que funcione sin internet
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

// Activar: borra SOLO versiones anteriores de esta guía (no toca las otras apps)
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k.startsWith('guiaportal-') && k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Primero intenta internet (para ver cambios); si no hay, usa lo guardado
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // fuentes de Google: las maneja el navegador
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
