// Define um nome e versão para o cache
const CACHE_NAME = 'defesa-base-v2'; // Mudei a versão para forçar a atualização

// Lista de arquivos que serão armazenados em cache
const FILES_TO_CACHE = [
  '/',
  'index.html',
  'manifest.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
  'icons/maskable-icon.png' // Adicionado o ícone mascarável ao cache
];

// Evento de instalação do Service Worker
self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Instalando...');
  
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pré-cache de arquivos da aplicação');
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// Evento de ativação do Service Worker
self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Ativando...');
  
  // Remove caches antigos que não são o atual (v1, por exemplo)
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removendo cache antigo', key);
          return caches.delete(key);
        }
      }));
    })
  );

  self.clients.claim();
});

// Evento de fetch (intercepta as requisições de rede)
self.addEventListener('fetch', (evt) => {
  // Ignora requisições que não são GET
  if (evt.request.method !== 'GET') {
    return;
  }
  
  // Estratégia: Cache-First. Tenta servir do cache primeiro.
  evt.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(evt.request)
        .then((response) => {
          return response || fetch(evt.request);
        });
    })
  );
});